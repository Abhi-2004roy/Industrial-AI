import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'
import { createRequire } from 'module'

import config from '../config/index.js'
import Document from '../models/Document.js'
import { resolveUploadAbsolutePath } from '../utils/filePaths.js'
import { BadRequestError, NotFoundError, InternalServerError } from '../utils/index.js'

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

const PRIMARY_MODEL = 'gemini-3.5-flash-lite'
// Lighter/alternate model used when the primary keeps returning 503/429.
const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash']
// Exponential backoff delays (ms) applied to each model before falling back.
const BACKOFF_MS = [1500, 3000]

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Detect transient "high demand" / rate-limit failures from the Gemini SDK.
function isRetryableAiError(error) {
  const status =
    error?.status ?? error?.statusCode ?? error?.response?.status ?? error?.error?.status
  if (status === 503 || status === 429) return true

  const message = `${error?.message || ''} ${error?.error?.message || ''}`.toLowerCase()
  return [
    'high demand',
    'overloaded',
    'service unavailable',
    'rate limit',
    'temporarily unavailable',
    'fetch failed',
    'econnreset',
    'etimedout',
    '503',
    '429',
  ].some((needle) => message.includes(needle))
}

async function generateWithRetry(modelName, prompt) {
  const client = genAI.getGenerativeModel({ model: modelName })
  let lastError

  // Initial attempt + up to 2 retries (backoff 1500ms, then 3000ms).
  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt += 1) {
    try {
      const result = await client.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      lastError = error
      if (!isRetryableAiError(error)) throw error
      if (attempt < BACKOFF_MS.length) await sleep(BACKOFF_MS[attempt])
    }
  }

  throw lastError
}

// Retry the primary model, then automatically fall back to an alternate model.
async function generateContentWithFallback(prompt) {
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS]
  let lastError

  for (const modelName of models) {
    try {
      return await generateWithRetry(modelName, prompt)
    } catch (error) {
      lastError = error
      if (!isRetryableAiError(error)) throw error
    }
  }

  throw lastError
}

// Extract text from different file types
async function extractTextFromFile(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase()
  
  if (ext === '.txt' || mimeType === 'text/plain') {
    return await fs.readFile(filePath, 'utf-8')
  } else if (ext === '.pdf' || mimeType === 'application/pdf') {
    try {
      const dataBuffer = await fs.readFile(filePath)
      
      const pdfModule = await import('pdf-parse-new')
      
      // --- THE BRUTE-FORCE FUNCTION FINDER ---
      let parsePdf = pdfModule;
      
      // 1. Check standard ESM default wrappers
      if (typeof parsePdf !== 'function') parsePdf = pdfModule.default;
      if (typeof parsePdf !== 'function') parsePdf = pdfModule.default?.default;
      
      // 2. If STILL not a function, search the entire object structure for a function
      if (typeof parsePdf !== 'function') {
        parsePdf = Object.values(pdfModule).find(val => typeof val === 'function') || 
                   Object.values(pdfModule.default || {}).find(val => typeof val === 'function');
      }

      // 3. If we are completely out of luck, dump the exact object structure to the terminal
      if (typeof parsePdf !== 'function') {
         console.error('\n🚨 CRITICAL PDF MODULE DUMP 🚨');
         console.error(pdfModule);
         console.error('🚨 ------------------------ 🚨\n');
         throw new Error('pdf-parse is literally not exporting a function!');
      }
      // ---------------------------------------

      const data = await parsePdf(dataBuffer)
      return data.text
    } catch (err) {
      console.error('Error parsing PDF:', err)
      return '[Error: Failed to parse PDF file. Please try a different file.]'
    }
  } else {
    return `[Unsupported file type: ${ext}]. Only .txt and .pdf files are supported for text extraction.`
  }
}

export const chatWithAI = async (req, res, next) => {
  try {
    const { prompt, documentId } = req.body

    if (!prompt || !documentId) {
      throw new BadRequestError('Prompt and documentId are required')
    }

    // Get document from DB
    const document = await Document.findById(documentId)
    if (!document) {
      throw new NotFoundError('Document not found')
    }

    // Resolve file path
    const filePath = resolveUploadAbsolutePath(document.filePath, config.uploadPath)
    if (!filePath) {
      throw new BadRequestError('Document file path is invalid')
    }

    // Extract text
    let documentText = ''
    try {
      documentText = await extractTextFromFile(filePath, document.mimeType)
    } catch (err) {
      console.error('Error extracting text:', err)
      throw new InternalServerError('Failed to extract text from document')
    }

    // Temporary truncation fix to prevent Gemini token limit errors
    // TODO: Replace with proper RAG pipeline (chunking + vector DB) for full-document analysis
    const MAX_TEXT_LENGTH = 60000
    if (documentText.length > MAX_TEXT_LENGTH) {
      documentText = documentText.slice(0, MAX_TEXT_LENGTH) + '\n\n[Document truncated due to length. For full-document analysis, implement RAG.]'
    }

    // Build the prompt
    const fullPrompt = `You are a helpful AI assistant analyzing an industrial/academic document named "${document.title}". 

Document Context:
${documentText}

User Message: ${prompt}

Instructions:
1. Answer the user's message using the information provided in the Document Context.
2. If the user is just saying hello or asking for a summary, greet them or summarize the document naturally.
3. If the user asks a specific question and the answer cannot be found in the context, politely inform them that the information is missing from the document.
4. If  `
    // Call Gemini with retry + model fallback for transient 503/429 errors.
    const text = await generateContentWithFallback(fullPrompt)

    res.status(200).json({
      success: true,
      data: { text }
    })
  } catch (error) {
    // Keep normal validation/404 errors handled by your error middleware
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return next(error)
    }

    // Log the full Gemini error in your server terminal only
    console.error('[chatWithAI] Gemini error:', error)

    // Send a clean message to the mobile app instead of raw Google API URLs
    return res.status(503).json({
      success: false,
      message: 'AI service is currently busy or unavailable. Please try again in a moment.',
    })
  }
}
export default {
  chatWithAI,
}
