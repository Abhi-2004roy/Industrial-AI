import { useQuery } from '@tanstack/react-query'
import * as analyticsApi from '@/services/api/analytics'

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics-full'],
    queryFn: analyticsApi.getFullAnalytics,
  })
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics-overview'],
    queryFn: analyticsApi.getAnalyticsOverview,
  })
}

export function useFullAnalytics() {
  return useQuery({
    queryKey: ['analytics-full'],
    queryFn: analyticsApi.getFullAnalytics,
  })
}

export function useDocumentTrend() {
  return useQuery({
    queryKey: ['analytics-trend'],
    queryFn: analyticsApi.getDocumentTrend,
  })
}

export function useCategoryDistribution() {
  return useQuery({
    queryKey: ['analytics-categories'],
    queryFn: analyticsApi.getCategoryDistribution,
  })
}

export function useAiUsage() {
  return useQuery({
    queryKey: ['analytics-ai-usage'],
    queryFn: analyticsApi.getAiUsage,
  })
}
