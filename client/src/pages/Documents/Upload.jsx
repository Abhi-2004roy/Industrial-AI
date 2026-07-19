import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, X } from 'lucide-react'
import { useThemeContext } from '@/context/ThemeContext'
import { uploadDocument } from '@/services/api/documents'

export default function UploadDocument() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isDark } = useThemeContext()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', data.title)
      formData.append('description', data.description)
      
      await uploadDocument(formData)
      navigate('/dashboard/documents')
    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Upload Document</h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>Add a new document to your knowledge base</p>
      </motion.div>

      <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                dragging ? 'border-primary bg-primary/5' : (isDark ? 'border-slate-600 hover:border-primary/50' : 'border-border hover:border-primary/50')
              }`}
            >
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0])}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : ''}`}>{selectedFile.name}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-muted'}`}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : ''}`}>Drag and drop your file here</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-muted'}`}>or click to browse</p>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-muted'}`}>
                    Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className={isDark ? 'text-slate-200' : ''}>Document Title</Label>
                <Input
                  id="title"
                  placeholder="Enter document title"
                  {...register('title', {
                    required: 'Title is required'
                  })}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className={isDark ? 'text-slate-200' : ''}>Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the document"
                  {...register('description')}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => navigate('/dashboard/documents')}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={!selectedFile || loading}>
                {loading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

