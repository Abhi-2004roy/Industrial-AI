import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, FileText, Users, TrendingUp, Upload, FileUp } from 'lucide-react'
import { useAnalyticsMetrics, useAnalyzeDocument } from '@/hooks/useAnalytics'
import { useThemeContext } from '@/context/ThemeContext'

const PIE_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b']

export default function Analytics() {
  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics()
  const analyzeMutation = useAnalyzeDocument()
  const { isDark } = useThemeContext()

  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showCharts, setShowCharts] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const stats = [
    { label: 'Total Logins', value: metrics?.totalLogins ?? 0, icon: TrendingUp },
    { label: 'Documents Shared', value: metrics?.totalDocuments ?? 0, icon: FileText },
    { label: 'Active Users', value: metrics?.activeUsers ?? 0, icon: Users },
    { label: 'Document Views', value: metrics?.viewsThisWeek ?? 0, icon: BarChart3 },
  ]

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    setFile(selectedFile)
    setAnalysisResult(null)
    setShowCharts(false)
    setError('')
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    handleFileSelect(droppedFile)
  }, [])

  const handleUploadAndExtract = async () => {
    if (!file) {
      setError('Please select a PDF file first.')
      return
    }

    setError('')
    setShowCharts(false)

    try {
      const result = await analyzeMutation.mutateAsync(file)
      setAnalysisResult(result)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze document. Please try again.')
    }
  }

  const chartGridColor = isDark ? '#334155' : '#e2e8f0'
  const chartTextColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Analytics</h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>
          Track document usage and analyze industrial PDFs with AI
        </p>
      </motion.div>

      {/* Full-width upload bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardContent className="p-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-xl p-8 transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : isDark
                    ? 'border-slate-600 hover:border-slate-500'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-muted/30'}`}>
                    <FileUp className={`w-6 h-6 ${isDark ? 'text-slate-300' : 'text-muted'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {file ? file.name : 'Drag & drop a PDF here, or browse'}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-muted'}`}>
                      Upload an industrial document for AI-powered analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <a
                    href="https://drive.google.com/file/d/1V2t0t__Oq_v0ACflVLAIxnjjgw38nevw/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm ${isDark ? 'text-slate-400 hover:text-primary' : 'text-muted hover:text-primary'} underline-offset-2 hover:underline`}
                  >
                    View Example PDF Template
                  </a>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUploadAndExtract}
                    disabled={!file || analyzeMutation.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {analyzeMutation.isPending ? 'Analyzing...' : 'Upload & Extract Summary'}
                  </Button>
                </div>
              </div>
            </div>
            {error && <p className="text-destructive text-sm mt-3">{error}</p>}
          </CardContent>
        </Card>
      </motion.div>

      {/* Step 1: Summary card */}
      {analysisResult?.summary && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardHeader>
              <CardTitle className={isDark ? 'text-white' : ''}>Document Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {analysisResult.summary}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Analyze button */}
      {analysisResult?.summary && !showCharts && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button type="button" size="lg" onClick={() => setShowCharts(true)}>
            Analyze the PDF
          </Button>
        </motion.div>
      )}

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-muted'}`}>
                  {stat.label}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-muted'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : ''}`}>
                  {metricsLoading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Step 3: Charts */}
      {showCharts && analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : ''}>
                  Risk & Benefit Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysisResult.pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {analysisResult.pieChartData?.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : ''}>
                  Value Degradation vs Company Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analysisResult.growthAndDegradationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="year" tick={{ fill: chartTextColor }} />
                    <YAxis tick={{ fill: chartTextColor }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        borderColor: chartGridColor,
                        color: isDark ? '#e2e8f0' : '#334155',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="valueDegradation"
                      name="Value Degradation"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="companyGrowth"
                      name="Company Growth"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
