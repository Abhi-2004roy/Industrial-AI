import Groq from 'groq-sdk'
import ActivityLog from '../models/ActivityLog.js'
import User from '../models/User.js'
import Document from '../models/Document.js'
import config from '../config/index.js'
import { BadRequestError, InternalServerError } from '../utils/index.js'

const groq = new Groq({ apiKey: config.groq.apiKey })

async function resolvePdfParser() {
  const pdfModule = await import('pdf-parse-new')
  let parsePdf = pdfModule
  if (typeof parsePdf !== 'function') parsePdf = pdfModule.default
  if (typeof parsePdf !== 'function') parsePdf = pdfModule.default?.default
  if (typeof parsePdf !== 'function') {
    parsePdf =
      Object.values(pdfModule).find((val) => typeof val === 'function') ||
      Object.values(pdfModule.default || {}).find((val) => typeof val === 'function')
  }
  if (typeof parsePdf !== 'function') {
    throw new InternalServerError('PDF parser is unavailable')
  }
  return parsePdf
}

export async function extractPdfText(buffer) {
  const parsePdf = await resolvePdfParser()
  const data = await parsePdf(buffer)
  return data.text || ''
}

function truncateText(text, maxLength = 12000) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}\n\n[Document truncated due to length.]`
}

function parseGroqJson(content) {
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new InternalServerError('Failed to parse AI analysis response')
  }
  return JSON.parse(jsonMatch[0])
}

export async function getMetrics() {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - 7)
  startOfWeek.setHours(0, 0, 0, 0)

  const [totalLogins, activeUsers, totalDocuments, uploadsToday, viewsThisWeek] =
    await Promise.all([
      ActivityLog.countDocuments({ action: { $in: ['login', 'register'] } }),
      User.countDocuments(),
      Document.countDocuments(),
      Document.countDocuments({ createdAt: { $gte: startOfToday } }),
      Document.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]).then((result) => result[0]?.total || 0),
    ])

  return {
    totalLogins,
    activeUsers,
    totalDocuments,
    uploadsToday,
    viewsThisWeek,
  }
}

export async function analyzeDocument(fileBuffer) {
  if (!fileBuffer?.length) {
    throw new BadRequestError('PDF file is required')
  }

  if (!config.groq.apiKey) {
    throw new InternalServerError('Groq API key is not configured')
  }

  let documentText = ''
  try {
    documentText = await extractPdfText(fileBuffer)
  } catch {
    throw new BadRequestError('Failed to parse PDF file')
  }

  if (!documentText.trim()) {
    throw new BadRequestError('No text could be extracted from the PDF')
  }

  documentText = truncateText(documentText)

  const prompt = `You are an industrial document analyst. Read the entire document carefully and extract the actual figures, metrics, and trends it contains before answering. Respond with ONLY valid JSON (no markdown, no code fences, no extra commentary) in this exact shape:
{
  "summary": "A concise 3-4 sentence summary grounded in the document's key facts and figures.",
  "pieChartData": [
    { "name": "Risks", "value": <number 0-100> },
    { "name": "Benefits", "value": <number 0-100> },
    { "name": "ROI", "value": <number 0-100> },
    { "name": "Maintenance/Skill Gap", "value": <number 0-100> }
  ],
  "growthAndDegradationData": [
    { "year": "Year 1", "valueDegradation": <number>, "companyGrowth": <number> },
    { "year": "Year 2", "valueDegradation": <number>, "companyGrowth": <number> },
    { "year": "Year 3", "valueDegradation": <number>, "companyGrowth": <number> },
    { "year": "Year 4", "valueDegradation": <number>, "companyGrowth": <number> },
    { "year": "Year 5", "valueDegradation": <number>, "companyGrowth": <number> }
  ]
}

Rules:
- Read the whole document first and base every value on the figures, metrics, and statements it actually contains.
- When the document states explicit numbers, use them (rounded to at most 2 decimals) instead of generic estimates.
- pieChartData values represent the percentage breakdown across the four categories and must sum to approximately 100. Use decimals where useful for finer detail rather than only whole numbers.
- valueDegradation should reflect asset/value decline trends (higher = more degradation); report the actual magnitude or rate where the document provides it.
- companyGrowth should reflect projected company growth percentage or index per year; prefer the document's own figures when available.
- Only fall back to reasonable industrial estimates when the document is silent, and keep them consistent with any partial data present.
- Always return the exact keys and structure shown above; do not add, rename, or omit any field.

Document:
${documentText}`

  try {
    const completion = await groq.chat.completions.create({
      model: config.groq.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new InternalServerError('Empty response from Groq')
    }

    const parsed = parseGroqJson(content)

    return {
      summary: parsed.summary || 'Summary unavailable.',
      pieChartData: Array.isArray(parsed.pieChartData) ? parsed.pieChartData : [],
      growthAndDegradationData: Array.isArray(parsed.growthAndDegradationData)
        ? parsed.growthAndDegradationData
        : [],
    }
  } catch (err) {
    if (err instanceof BadRequestError || err instanceof InternalServerError) {
      throw err
    }
    throw new InternalServerError('Failed to analyze document with Groq')
  }
}

export async function logAuthActivity(userId, action, req) {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      resourceType: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })
  } catch {
    // Non-blocking
  }
}

export default {
  getMetrics,
  analyzeDocument,
  extractPdfText,
  logAuthActivity,
}
