import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'
import { createRequire } from 'module'

import config from '../config/index.js'
import Document from '../models/Document.js'
import { resolveUploadAbsolutePath } from '../utils/filePaths.js'
import { BadRequestError, NotFoundError, InternalServerError } from '../utils/index.js'

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

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
    const MAX_TEXT_LENGTH = 15000
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
3. If the user asks a specific question and the answer cannot be found in the context, politely inform them that the information is missing from the document.`

    // Call Gemini
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    res.status(200).json({
      success: true,
      data: { text }
    })
  } catch (error) {
    next(error)
  }
}

export default {
  chatWithAI,
}
