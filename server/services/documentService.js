import DocumentRepository from '../repositories/DocumentRepository.js'
import UserRepository from '../repositories/UserRepository.js'
import { NotFoundError, BadRequestError } from '../utils/errors.js'

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
  const doc = await getDocumentById(userId, docId)
  await DocumentRepository.deleteById(docId)
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
