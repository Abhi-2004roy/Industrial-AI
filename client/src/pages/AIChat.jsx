import { useState, useRef, useEffect } from 'react'
import { useThemeContext } from '@/context/ThemeContext'
import { useDocuments } from '@/hooks/useDocuments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Send, FileText, Loader2 } from 'lucide-react'
import * as aiApi from '@/services/api/ai'

export default function AIChat() {
  const { isDark } = useThemeContext()
  const { data: documentsResponse, isLoading: isLoadingDocuments } = useDocuments()
  const [selectedDocumentId, setSelectedDocumentId] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  const documents = documentsResponse?.data || []

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !selectedDocumentId || isTyping) return

    // Add user message
    const userMessage = { role: 'user', content: inputValue }
    setChatHistory(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const result = await aiApi.sendAIChat(inputValue, selectedDocumentId)
      const aiMessage = { role: 'assistant', content: result.data?.text || 'Sorry, no response' }
      setChatHistory(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = { role: 'assistant', content: error.message || 'Something went wrong' }
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Sparkles className="inline-block mr-2 w-6 h-6 text-accent" />
          AI Assistant
        </h1>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Document Selector Sidebar */}
        <div className={`w-64 flex-shrink-0 p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-border'}`}>
          <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Select Document
          </h3>
          <div className="space-y-2 overflow-y-auto max-h-full">
            {isLoadingDocuments ? (
              <div className="flex items-center gap-2 text-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <p className="text-muted text-sm">No documents uploaded yet</p>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => setSelectedDocumentId(doc._id)}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-2 ${
                    selectedDocumentId === doc._id
                      ? isDark
                        ? 'bg-primary/20 text-white border border-primary'
                        : 'bg-primary/10 text-primary border border-primary'
                      : isDark
                      ? 'hover:bg-slate-700 text-slate-300'
                      : 'hover:bg-gray-100 text-slate-600'
                  }`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-sm">{doc.title}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-border'}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!selectedDocumentId ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                <Sparkles className="w-12 h-12 mb-3 text-accent" />
                <p>Select a document to start chatting with AI</p>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                <Sparkles className="w-12 h-12 mb-3 text-accent" />
                <p>Ask a question about your selected document</p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? isDark
                          ? 'bg-primary text-white'
                          : 'bg-primary text-white'
                        : isDark
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-gray-100 text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-gray-100 text-slate-800'}`}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question..."
                disabled={!selectedDocumentId || isTyping}
                className="flex-1"
              />
              <Button type="submit" disabled={!selectedDocumentId || isTyping || !inputValue.trim()}>
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
