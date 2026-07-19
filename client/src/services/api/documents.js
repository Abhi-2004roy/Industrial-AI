import apiClient from './client.js'

export async function getDocuments(params = {}) {
  const response = await apiClient.get('/documents', { params })
  return response.data.data
}

export async function getDocumentById(id) {
  const response = await apiClient.get(`/documents/${id}`)
  return response.data.data
}

export async function uploadDocument(formData) {
  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data.data
}

export async function deleteDocument(id) {
  const response = await apiClient.delete(`/documents/${id}`)
  return response.data.data
}

export async function uploadProfileImage(formData) {
  const response = await apiClient.post('/documents/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data.data
}

export async function getDocumentSummary(id) {
  return {
    summary: 'Document summary placeholder...',
    keyPoints: ['Point 1', 'Point 2', 'Point 3'],
    entities: ['Entity 1', 'Entity 2'],
    sentiment: 'neutral',
    readingTime: '12 min'
  }
}
