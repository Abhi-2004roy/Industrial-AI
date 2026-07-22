import { useQuery, useMutation } from '@tanstack/react-query'
import * as analyticsApi from '@/services/api/analytics'

export function useAnalyticsMetrics() {
  return useQuery({
    queryKey: ['analytics-metrics'],
    queryFn: analyticsApi.getMetrics,
  })
}

export function useAnalyzeDocument() {
  return useMutation({
    mutationFn: analyticsApi.analyzeDocument,
  })
}
