import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as documentsApi from '@/services/api/documents'

function removeDocumentFromCache(existing, deletedId) {
  const id = String(deletedId)

  if (!existing) {
    return existing
  }

  if (Array.isArray(existing)) {
    return existing.filter((doc) => String(doc._id || doc.id) !== id)
  }

  if (Array.isArray(existing?.data)) {
    return {
      ...existing,
      data: existing.data.filter((doc) => String(doc._id || doc.id) !== id),
    }
  }

  return existing
}

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
    onSuccess: (_deletedDocument, deletedId) => {
      queryClient.setQueriesData({ queryKey: ['documents'] }, (existing) =>
        removeDocumentFromCache(existing, deletedId)
      )
      queryClient.removeQueries({ queryKey: ['document', deletedId] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
