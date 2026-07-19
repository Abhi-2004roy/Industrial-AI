import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as documentsApi from '@/services/api/documents'

export function useDocuments(params = {}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsApi.getDocuments(params),
  })
}

export function useDocument(id) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.getDocumentById(id),
    enabled: !!id,
  })
}

export function useDocumentSummary(id) {
  return useQuery({
    queryKey: ['document-summary', id],
    queryFn: () => documentsApi.getDocumentSummary(id),
    enabled: !!id,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: documentsApi.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: documentsApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
