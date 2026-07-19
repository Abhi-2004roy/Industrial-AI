import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, FileText, Users, TrendingUp } from 'lucide-react'
import { useThemeContext } from '@/context/ThemeContext'

const notifications = [
  {
    id: 1,
    type: 'document',
    title: 'New Document Uploaded',
    description: 'Safety Manual v2.0 has been added to the knowledge base',
    time: '5 minutes ago',
    read: false
  },
  {
    id: 2,
    type: 'user',
    title: 'New Team Member',
    description: 'John Smith has joined your team',
    time: '1 hour ago',
    read: false
  },
  {
    id: 3,
    type: 'analytics',
    title: 'Weekly Report',
    description: 'Your weekly analytics report is ready',
    time: '2 hours ago',
    read: true
  },
  {
    id: 4,
    type: 'document',
    title: 'Document Updated',
    description: 'Maintenance Checklist has been updated',
    time: '1 day ago',
    read: true
  }
]

const getIcon = (type) => {
  switch (type) {
    case 'document':
      return FileText
    case 'user':
      return Users
    case 'analytics':
      return TrendingUp
    default:
      return Bell
  }
}

const getColor = (type) => {
  switch (type) {
    case 'document':
      return 'text-primary bg-primary/10'
    case 'user':
      return 'text-success bg-success/10'
    case 'analytics':
      return 'text-accent bg-accent/10'
    default:
      return 'text-muted bg-muted/10'
  }
}

export default function Notifications() {
  const { isDark } = useThemeContext()
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>Stay updated with your team's activities</p>
      </motion.div>

      <div className="space-y-4">
        {notifications.map((notification, idx) => {
          const Icon = getIcon(notification.type)
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`${notification.read ? 'opacity-60' : ''} ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getColor(notification.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : ''}`}>{notification.title}</p>
                          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>{notification.description}</p>
                        </div>
                        <span className={`text-xs flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-muted'}`}>{notification.time}</span>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

