import analyticsService from '../services/analyticsService.js'
import { BadRequestError } from '../utils/index.js'

export const getMetrics = async (req, res, next) => {
  try {
    const metrics = await analyticsService.getMetrics()
    res.status(200).json({ success: true, data: metrics })
  } catch (err) {
    next(err)
  }
}

export const analyzeDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('PDF file is required')
    }

    if (req.file.mimetype !== 'application/pdf') {
      throw new BadRequestError('Only PDF files are supported')
    }

    const analysis = await analyticsService.analyzeDocument(req.file.buffer)

    res.status(200).json({
      success: true,
      data: analysis,
    })
  } catch (err) {
    next(err)
  }
}

export default {
  getMetrics,
  analyzeDocument,
}
