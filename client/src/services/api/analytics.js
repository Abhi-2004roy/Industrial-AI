import { delay } from './client'
import { mockAnalytics } from '@/constants/mockData'

export async function getAnalyticsOverview() {
  await delay(500)
  return mockAnalytics.overview
}

export async function getDocumentTrend() {
  await delay(400)
  return mockAnalytics.documentTrend
}

export async function getCategoryDistribution() {
  await delay(400)
  return mockAnalytics.categoryDistribution
}

export async function getAiUsage() {
  await delay(400)
  return mockAnalytics.aiUsage
}

export async function getTopDocuments() {
  await delay(400)
  return mockAnalytics.topDocuments
}

export async function getFullAnalytics() {
  await delay(600)
  return mockAnalytics
}
