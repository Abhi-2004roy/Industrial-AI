import express from 'express'
import { protect } from '../middlewares/index.js'
import { upload } from '../middlewares/upload.js'
import { documentController } from '../controllers/index.js'

const router = express.Router()

router.post(
  '/upload',
  protect,
  upload.single('file'),
  documentController.uploadDocument
)

router.get('/', protect, documentController.getDocuments)

router.get('/:id', protect, documentController.getDocumentById)

router.delete('/:id', protect, documentController.deleteDocument)

router.post(
  '/profile-image',
  protect,
  upload.single('image'),
  documentController.uploadProfileImage
)

export default router
