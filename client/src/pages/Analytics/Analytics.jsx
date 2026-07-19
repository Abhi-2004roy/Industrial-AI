import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, FileText, Users, TrendingUp } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useThemeContext } from '@/context/ThemeContext'

export default function Analytics() {
  const { analytics } = useAnalytics()
  const { isDark } = useThemeContext()

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Analytics</h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>Track document usage and team performance</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Views', value: '12.5k', icon: TrendingUp, change: '+12%' },
          { label: 'Documents Shared', value: '342', icon: FileText, change: '+8%' },
          { label: 'Active Users', value: '89', icon: Users, change: '+3%' },
          { label: 'Search Queries', value: '1.8k', icon: BarChart3, change: '+18%' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-muted'}`}>{stat.label}</CardTitle>
                <stat.icon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-muted'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : ''}`}>{stat.value}</div>
                <p className="text-sm text-success mt-1">{stat.change} from last week</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardHeader>
              <CardTitle className={`${isDark ? 'text-white' : ''}`}>Document Views by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <p className={`${isDark ? 'text-slate-400' : 'text-muted'}`}>Chart would appear here</p>
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
              <CardTitle className={`${isDark ? 'text-white' : ''}`}>User Activity</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <p className={`${isDark ? 'text-slate-400' : 'text-muted'}`}>Chart would appear here</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

