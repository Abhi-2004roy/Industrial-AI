import apiClient from './client'

export async function sendAIChat(prompt, documentId) {
  const response = await apiClient.post('/ai/chat', { prompt, documentId })
  return response.data
}
