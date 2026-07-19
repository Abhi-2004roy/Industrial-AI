import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import DocumentRepository from '../repositories/DocumentRepository.js'
import UserRepository from '../repositories/UserRepository.js'
import { NotFoundError, BadRequestError } from '../utils/errors.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
  if (doc.uploader.toString() !== userId.toString()) {
    throw new NotFoundError('Document not found')
  }
  return doc
}

export const deleteDocument = async (userId, docId) => {
  console.log('[deleteDocument] Starting deletion for user:', userId, 'docId:', docId)
  const doc = await getDocumentById(userId, docId)
  console.log('[deleteDocument] Found document:', doc._id, doc.fileName)
  // Delete the physical file from uploads directory
  const filePath = path.join(__dirname, '../uploads', doc.fileName)
  console.log('[deleteDocument] File path to delete:', filePath)
  try {
    // Check if file exists first
    await fs.promises.access(filePath)
    await fs.promises.unlink(filePath)
    console.log('[deleteDocument] File deleted successfully')
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`[deleteDocument] File not found for deletion: ${filePath}`)
    } else {
      console.error('[deleteDocument] Error deleting file:', err)
    }
  }
  console.log('[deleteDocument] Deleting document from DB...')
  const deletedDoc = await DocumentRepository.deleteById(docId)
  console.log('[deleteDocument] Document deleted from DB:', deletedDoc)
  return doc
}

export const uploadProfileImage = async (userId, file) => {
  if (!file) {
    throw new BadRequestError('No file uploaded')
  }
  const user = await UserRepository.updateById(userId, {
    avatar: `/uploads/${file.filename}`
  })
  return user
}
