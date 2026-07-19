import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeContext } from '@/context/ThemeContext'

const slides = [
  {
    id: 1,
    url: '/industrial-1.jpg',
    alt: 'Industrial facility'
  },
  {
    id: 2,
    url: '/industrial-2.jpg',
    alt: 'Power plant'
  },
  {
    id: 3,
    url: '/industrial-3.jpg',
    alt: 'Workers in factory'
  }
]

export function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isDark } = useThemeContext()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode='wait'>
        <motion.div
          key={slides[currentIndex].id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentIndex].url}
            alt={slides[currentIndex].alt}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      {/* Overlay */}
      <div className={
        isDark
          ? 'absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70'
          : 'absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/70'
      } />
      {/* Dots indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex
                ? 'w-6 bg-primary'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
