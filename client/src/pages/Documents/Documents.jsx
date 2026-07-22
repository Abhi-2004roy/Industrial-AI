import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { useDocuments, useDeleteDocument } from '@/hooks/useDocuments'
import { useThemeContext } from '@/context/ThemeContext'
import { getFileUrl } from '@/utils/fileUrl'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Documents() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')?.trim().toLowerCase() || ''
  const { data, isLoading } = useDocuments()
  const allDocs = data?.data ?? []
  const docs = searchQuery
    ? allDocs.filter((doc) => {
        const title = (doc.title || '').toLowerCase()
        const description = (doc.description || '').toLowerCase()
        const category = (doc.category?.name || doc.category || '').toLowerCase()
        return (
          title.includes(searchQuery) ||
          description.includes(searchQuery) ||
          category.includes(searchQuery)
        )
      })
    : allDocs
  const { isDark } = useThemeContext()
  const deleteDocumentMutation = useDeleteDocument()
  const [docToDelete, setDocToDelete] = useState(null)

  const handleDelete = async () => {
    if (!docToDelete) return

    try {
      await deleteDocumentMutation.mutateAsync(docToDelete._id || docToDelete.id)
      setDocToDelete(null)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to delete document')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Documents</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>
            {searchQuery
              ? `Showing results for "${searchParams.get('search')}"`
              : 'Manage and organize your industrial documents'}
          </p>
        </div>
        <Link to="/dashboard/upload">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <CardContent className={`py-10 text-center ${isDark ? 'text-slate-300' : 'text-muted'}`}>
            Loading documents...
          </CardContent>
        </Card>
      ) : docs.length === 0 ? (
        <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <CardContent className="py-10 text-center">
            <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-muted'}`} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {searchQuery ? 'No matching documents' : 'No documents yet'}
            </h2>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>
              {searchQuery
                ? 'Try a different search term or clear the search filter.'
                : 'Upload a document to start building your knowledge base.'}
            </p>
          </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((doc, idx) => (
          <motion.div
            key={doc._id || doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`h-full hover:shadow-lg transition-shadow ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <Link to={`/dashboard/document/${doc._id || doc.id}`}>
                        <CardTitle className={`truncate ${isDark ? 'text-white' : ''}`}>{doc.title}</CardTitle>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDocToDelete(doc)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>{doc.category}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-sm line-clamp-2 ${isDark ? 'text-slate-300' : 'text-muted'}`}>{doc.description}</p>
                <div className={`flex items-center justify-between mt-4 text-xs ${isDark ? 'text-slate-400' : 'text-muted'}`}>
                  <span>{doc.uploadDate || new Date(doc.createdAt).toLocaleDateString()}</span>
                  <span>{doc.size || (doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : '')}</span>
                </div>
                {doc.filePath && (
                  <div className="mt-2">
                    <a 
                      href={getFileUrl(doc.filePath)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`text-xs text-primary hover:underline ${isDark ? 'text-primary' : ''}`}
                    >
                      View Document
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      )}

      <Dialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <DialogContent className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : ''}>Delete Document</DialogTitle>
            <DialogDescription className={isDark ? 'text-slate-400' : ''}>
              {docToDelete ? `Are you sure you want to delete "${docToDelete.title}"? This action cannot be undone.` : 'This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDocToDelete(null)}
              className={isDark ? 'text-slate-300' : ''}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDocumentMutation.isPending}
            >
              {deleteDocumentMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
