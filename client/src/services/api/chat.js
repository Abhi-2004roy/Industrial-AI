import { delay } from './client'
import { mockChatHistory } from '@/constants/mockData'

let chatSessions = {}

export async function sendMessage(documentId, message) {
  await delay(1200)

  const responses = [
    'Based on the document analysis, the recommended maintenance interval for hydraulic systems is every 500 operating hours. Key checkpoints include fluid level, filter condition, and seal integrity.',
    'The safety protocols outlined in this document require PPE including safety glasses, steel-toe boots, and hearing protection when operating within 10 feet of the equipment.',
    'According to the specifications, the maximum operating pressure is 3000 PSI. Exceeding this limit may cause catastrophic failure of the hydraulic seals.',
    'The troubleshooting section indicates that erratic movement is typically caused by air in the hydraulic lines. The recommended fix is to bleed the system following the procedure on page 23.',
    'Quality control checkpoints for Line 3 include dimensional verification at stations 4, 7, and 12. Each checkpoint has specific tolerance ranges documented in Appendix B.',
  ]

  const randomResponse = responses[Math.floor(Math.random() * responses.length)]

  return {
    id: String(Date.now()),
    role: 'assistant',
    content: randomResponse,
    timestamp: new Date().toISOString(),
    sources: documentId
      ? [{ documentId, title: 'Referenced Document', page: Math.floor(Math.random() * 40) + 1 }]
      : [],
  }
}

export async function getChatHistory(documentId) {
  await delay(300)
  if (!chatSessions[documentId]) {
    chatSessions[documentId] = [...mockChatHistory]
  }
  return chatSessions[documentId]
}

export async function clearChatHistory(documentId) {
  await delay(200)
  chatSessions[documentId] = [...mockChatHistory]
  return chatSessions[documentId]
}
