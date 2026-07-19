import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FileText, Brain, BarChart3, Users } from 'lucide-react'
import { ImageSlider } from '@/components/common/ImageSlider'
import { Testimonials } from '@/components/landing/Testimonials'
import { Footer } from '@/components/layout/Footer'
import { useThemeContext } from '@/context/ThemeContext'

const features = [
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Organize and manage all industrial documents in one centralized location'
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Get intelligent summaries and insights from your documents'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track document usage and gain valuable insights'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share documents and collaborate with your team securely'
  }
]

export default function Landing() {
  const { isDark } = useThemeContext()
  return (
    <div className="min-h-screen">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">IAI</span>
            </div>
            <span className="text-xl font-bold">Industrial AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative py-20 px-6 min-h-[70vh] flex items-center justify-center">
        <ImageSlider />
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AI-Powered Industrial Knowledge Management System
            </h1>
            <p className={`text-xl mb-8 max-w-3xl mx-auto ${isDark ? 'text-slate-300' : 'text-muted'}`}>
              Transform how your industrial team manages, analyzes, and collaborates on documents with the power of AI
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="h-12 px-8">Start Free Trial</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="lg" className="h-12 px-8">View Demo</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className={`py-20 px-6 ${isDark ? 'bg-slate-900' : 'bg-surface'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Everything You Need</h2>
            <p className={`max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-muted'}`}>
              A complete solution for industrial document management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-xl border transition-colors ${
                  isDark
                    ? 'border-slate-700 hover:border-primary/50 bg-slate-800/50'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-muted'}`}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <Footer />
    </div>
  )
}

