import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Upload, Users, TrendingUp } from 'lucide-react'
import { mockDocuments, mockUsers } from '@/constants/mockData'
import { useDocuments } from '@/hooks/useDocuments'
import { useAnalyticsMetrics } from '@/hooks/useAnalytics'
import { useThemeContext } from '@/context/ThemeContext'

export default function Dashboard() {
  const { data } = useDocuments()
  const { data: metrics, isLoading: metricsLoading } = useAnalyticsMetrics()
  const docs = data?.data || mockDocuments
  const { isDark } = useThemeContext()

  const stats = [
    {
      title: 'Total Documents',
      value: metrics?.totalDocuments ?? docs?.length ?? 0,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Active Users',
      value: metrics?.activeUsers ?? 0,
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Uploads Today',
      value: metrics?.uploadsToday ?? 0,
      icon: Upload,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Total Logins',
      value: metrics?.totalLogins ?? 0,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ]

  const dashboardImages = [
    { id: 1, src: '/industrial-1.jpg', alt: 'Industrial facility' },
    { id: 2, src: '/industrial-2.jpg', alt: 'Power plant' },
    { id: 3, src: '/industrial-3.jpg', alt: 'Workers in factory' }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Dashboard</h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>Welcome back! Here's what's happening today.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-muted'}`}>{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
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

      {/* Image Gallery Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardHeader>
            <CardTitle className={`${isDark ? 'text-white' : ''}`}>Facility Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardImages.map((image, idx) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative rounded-lg overflow-hidden aspect-video group"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium">{image.alt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardHeader>
              <CardTitle className={`${isDark ? 'text-white' : ''}`}>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(docs.length ? docs : mockDocuments).slice(0, 5).map((doc) => (
                  <div key={doc._id || doc.id} className={`flex items-center gap-4 p-3 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-muted/20'}`}>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : ''}`}>{doc.title}</p>
                      <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-muted'}`}>{doc.category?.name || doc.category || 'Uncategorized'}</p>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-muted'}`}>
                      {doc.uploadDate || (doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardHeader>
              <CardTitle className={`${isDark ? 'text-white' : ''}`}>Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className={`flex items-center gap-4 p-3 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-muted/20'}`}>
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : ''}`}>{user.name}</p>
                      <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-muted'}`}>Just uploaded a document</p>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-muted'}`}>2m ago</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
