import express from 'express'
import aiController from '../controllers/aiController.js'
import { protect } from '../middlewares/index.js'

const router = express.Router()

// All routes require authentication
router.use(protect)

router.post('/chat', aiController.chatWithAI)

export default router
