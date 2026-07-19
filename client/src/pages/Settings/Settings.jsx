import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import { useThemeContext } from '@/context/ThemeContext'

export default function Settings() {
  const { register, handleSubmit } = useForm()
  const { isDark } = useThemeContext()

  const onSubmit = (data) => {
    console.log('Saving settings:', data)
    alert('Settings saved!')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>Manage your account and application preferences</p>
      </motion.div>

      <div className="space-y-6">
        <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardHeader>
            <CardTitle className={`${isDark ? 'text-white' : ''}`}>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company" className={isDark ? 'text-slate-200' : ''}>Company Name</Label>
                <Input id="company" placeholder="Your company name" {...register('company')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className={isDark ? 'text-slate-200' : ''}>Email Notifications</Label>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-slate-300' : ''}`}>Receive email updates</span>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language" className={isDark ? 'text-slate-200' : ''}>Language</Label>
                <Input id="language" placeholder="English" {...register('language')} />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
          <CardHeader>
            <CardTitle className={`${isDark ? 'text-white' : ''}`}>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : ''}`}>Two-Factor Authentication</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-muted'}`}>Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
            <div className={`pt-4 border-t ${isDark ? 'border-slate-700' : 'border-border'}`}>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

