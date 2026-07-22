import apiClient from './client'

export async function getMetrics() {
  const response = await apiClient.get('/analytics/metrics')
  return response.data.data
}

export async function analyzeDocument(file) {
  const formData = new FormData()
  formData.append('document', file)

  const response = await apiClient.post('/analytics/analyze-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
  return response.data.data
}
