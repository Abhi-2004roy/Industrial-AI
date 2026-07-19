import * as documentService from '../services/documentService.js'

export const uploadDocument = async (req, res, next) => {
  try {
    const doc = await documentService.uploadDocument(
      req.user._id,
      req.file,
      req.body
    )
    res.status(201).json({ success: true, data: doc })
  } catch (err) {
    next(err)
  }
}

export const getDocuments = async (req, res, next) => {
  try {
    const docs = await documentService.getDocuments(req.user._id)
    res.status(200).json({ success: true, data: docs })
  } catch (err) {
    next(err)
  }
}

export const getDocumentById = async (req, res, next) => {
  try {
    const doc = await documentService.getDocumentById(req.user._id, req.params.id)
    res.status(200).json({ success: true, data: doc })
  } catch (err) {
    next(err)
  }
}

export const deleteDocument = async (req, res, next) => {
  try {
    const doc = await documentService.deleteDocument(req.user._id, req.params.id)
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      data: doc,
    })
  } catch (err) {
    next(err)
  }
}

export const uploadProfileImage = async (req, res, next) => {
  try {
    const user = await documentService.uploadProfileImage(
      req.user._id,
      req.file
    )
    res.status(200).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export default {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  uploadProfileImage
}
