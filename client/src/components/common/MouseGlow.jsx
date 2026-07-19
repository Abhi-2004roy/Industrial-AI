import { useEffect, useRef, useState } from 'react'
import { useThemeContext } from '@/context/ThemeContext'

export function MouseGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { isDark } = useThemeContext()

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', updateMousePosition)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
    }
  }, [])

  const glowColor = isDark 
    ? 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(236,72,153,0) 70%)' 
    : 'radial-gradient(circle, rgba(74,222,128,0.4) 0%, rgba(74,222,128,0) 70%)'

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-50"
      style={{
        transform: `translate(${mousePosition.x - 150}px, ${mousePosition.y - 150}px)`,
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: glowColor,
        filter: 'blur(64px)', // Tailwind blur-3xl is 64px
        transition: 'transform 0.1s ease-out, background 0.3s ease',
      }}
    />
  )
}
