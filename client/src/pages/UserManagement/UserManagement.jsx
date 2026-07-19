import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'
import { mockUsers } from '@/constants/mockData'
import { useThemeContext } from '@/context/ThemeContext'

export default function UserManagement() {
  const { isDark } = useThemeContext()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>User Management</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>Manage your team members and their permissions</p>
        </motion.div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardHeader>
            <CardTitle className={`${isDark ? 'text-white' : ''}`}>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUsers.map((user, idx) => (
                <div key={user.id} className={`flex items-center gap-4 p-4 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-muted/20'}`}>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isDark ? 'text-white' : ''}`}>{user.name}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-muted'}`}>{user.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-muted'}`}>{user.role}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Active</span>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

