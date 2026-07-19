import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import DocumentRepository from '../repositories/DocumentRepository.js'
import UserRepository from '../repositories/UserRepository.js'
import config from '../config/index.js'
import {
  normalizeStoredUploadPath,
  resolveUploadAbsolutePath,
  sanitizeUserForResponse,
} from '../utils/filePaths.js'
import { NotFoundError, BadRequestError } from '../utils/errors.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.resolve(__dirname, '..', config.uploadPath)

export const uploadDocument = async (userId, file, data) => {
  if (!file) {
    throw new BadRequestError('No file uploaded')
  }

  const document = await DocumentRepository.create({
    title: data.title || file.originalname,
    description: data.description,
    originalFileName: file.originalname,
    fileName: file.filename,
    filePath: `/uploads/${file.filename}`,
    fileSize: file.size,
    mimeType: file.mimetype,
    fileType: file.mimetype.split('/')[1],
    uploader: userId,
    status: 'completed'
  })

  return document
}

export const getDocuments = async (userId, options = {}) => {
  return DocumentRepository.findByUploader(userId, options)
}

export const getDocumentById = async (userId, docId) => {
  const doc = await DocumentRepository.findById(docId)
  if (!doc) {
    throw new NotFoundError('Document not found')
  }

  const uploaderId = doc.uploader?._id?.toString?.() || doc.uploader?.toString?.()
  if (uploaderId !== userId.toString()) {
    throw new NotFoundError('Document not found')
  }

  return doc
}

export const deleteDocument = async (userId, docId) => {
  const doc = await getDocumentById(userId, docId)
  const storedFileName = doc.fileName || path.basename(doc.filePath || '')
  const filePath = resolveUploadAbsolutePath(storedFileName, uploadsDir)

  if (filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (err) {
      console.error('[deleteDocument] Error deleting file (continuing anyway):', err)
    }
  }

  const deletedDoc = await DocumentRepository.deleteById(docId)
  if (!deletedDoc) {
    throw new NotFoundError('Document not found')
  }

  return deletedDoc
}

export const uploadProfileImage = async (userId, file) => {
  if (!file) {
    throw new BadRequestError('No file uploaded')
  }

  const user = await UserRepository.updateById(userId, {
    avatar: file.filename,
  })

  return sanitizeUserForResponse(user)
}
