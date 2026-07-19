import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, ArrowLeft, Download, Brain, MessageSquare } from 'lucide-react'
import { useThemeContext } from '@/context/ThemeContext'
import { useDocument } from '@/hooks/useDocuments'
import { getFileUrl } from '@/utils/fileUrl'

export default function DocumentDetail() {
  const { id } = useParams()
  const { isDark } = useThemeContext()
  const { data: docFromApi, isLoading } = useDocument(id)
  const doc = docFromApi

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className={isDark ? 'text-slate-300' : 'text-muted'}>Loading document...</p>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : ''}`}>Document not found</h2>
        <Link to="/dashboard/documents">
          <Button className="mt-4">Back to Documents</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link to="/dashboard/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.title}</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>{doc.category}</p>
        </div>
        {doc.filePath && (
          <a href={getFileUrl(doc.filePath)} target="_blank" rel="noopener noreferrer">
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </a>
        )}
      </motion.div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className={`w-full max-w-md ${isDark ? 'bg-slate-800' : ''}`}>
          <TabsTrigger value="content" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex-1">
            <Brain className="w-4 h-4 mr-2" />
            AI Summary
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardHeader>
              <CardTitle className={`${isDark ? 'text-white' : ''}`}>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {doc.filePath ? (
                <div className={`${isDark ? 'bg-slate-700/30' : 'bg-muted/20'} rounded-lg p-4 min-h-[500px]`}>
                  <iframe
                    src={getFileUrl(doc.filePath)}
                    className="w-full h-[500px] rounded-lg"
                    title={doc.title}
                  />
                </div>
              ) : (
                <div className={`${isDark ? 'bg-slate-700/30' : 'bg-muted/20'} rounded-lg p-8 min-h-[500px] flex items-center justify-center`}>
                  <div className="text-center">
                    <FileText className={`w-16 h-16 ${isDark ? 'text-slate-400' : 'text-muted'} mx-auto mb-4`} />
                    <p className={`${isDark ? 'text-slate-400' : 'text-muted'}`}>Document preview would appear here</p>
                    <p className={`text-sm mt-2 ${isDark ? 'text-slate-500' : 'text-muted'}`}>{doc.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardHeader>
              <CardTitle className={`${isDark ? 'text-white' : ''}`}>AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`${isDark ? 'bg-primary/10' : 'bg-primary/5'} rounded-lg p-6`}>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : ''}`}>Key Points</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className={isDark ? 'text-slate-300' : ''}>This document outlines safety procedures for industrial equipment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className={isDark ? 'text-slate-300' : ''}>Contains maintenance schedules and checklists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className={isDark ? 'text-slate-300' : ''}>Includes emergency response protocols</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardHeader>
              <CardTitle className={`${isDark ? 'text-white' : ''}`}>AI Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`${isDark ? 'bg-slate-700/30' : 'bg-muted/20'} rounded-lg p-4`}>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : ''}`}>Hello! I'm here to help you understand this document. What would you like to know?</p>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Ask a question about this document..." />
                  <Button>Send</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
