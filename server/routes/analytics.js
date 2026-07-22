import express from 'express'
import multer from 'multer'
import { analyticsController } from '../controllers/index.js'
import { protect } from '../middlewares/index.js'
import { BadRequestError } from '../utils/errors.js'

const router = express.Router()

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new BadRequestError('Only PDF files are supported'), false)
    }
  },
})

router.use(protect)

router.get('/metrics', analyticsController.getMetrics)

router.post(
  '/analyze-document',
  pdfUpload.single('document'),
  analyticsController.analyzeDocument
)

export default router
