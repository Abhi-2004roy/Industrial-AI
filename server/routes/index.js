import express from 'express'
import authRouter from './auth.js'
import documentRouter from './documents.js'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/documents', documentRouter)

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is up and running!',
    timestamp: new Date().toISOString(),
  })
})

export default router;
