import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuthContext } from '@/context/AuthContext'
import { useThemeContext } from '@/context/ThemeContext'
import { uploadProfileImage } from '@/services/api/documents'

export default function Profile() {
  const { user, updateUser } = useAuthContext()
  const { isDark } = useThemeContext()
  const { register, handleSubmit, setValue } = useForm()
  const [loadingImage, setLoadingImage] = useState(false)

  const getFileUrl = (filePath) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000'
    return `${baseUrl}${filePath}`
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const updatedUser = await uploadProfileImage(formData)
      updateUser(updatedUser)
    } catch (err) {
      console.error(err)
      alert('Image upload failed')
    } finally {
      setLoadingImage(false)
    }
  }

  const onSubmit = (data) => {
    updateUser(data)
    alert('Profile updated!')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile</h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-muted'}`}>Manage your personal information</p>
      </motion.div>

      <Card className={`${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center mb-8">
            {user?.avatar ? (
              <img
                src={getFileUrl(user.avatar)}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              id="profile-image-input"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button
              variant="ghost"
              size="sm"
              disabled={loadingImage}
              onClick={() => document.getElementById('profile-image-input').click()}
            >
              {loadingImage ? 'Uploading...' : 'Change Photo'}
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={isDark ? 'text-slate-200' : ''}>Full Name</Label>
              <Input
                id="name"
                defaultValue={user?.name}
                {...register('name')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={isDark ? 'text-slate-200' : ''}>Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email}
                {...register('email')}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className={isDark ? 'text-slate-200' : ''}>Role</Label>
              <Input
                id="role"
                defaultValue={user?.role}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className={isDark ? 'text-slate-200' : ''}>Department</Label>
              <Input
                id="department"
                defaultValue={user?.department}
                {...register('department')}
              />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

