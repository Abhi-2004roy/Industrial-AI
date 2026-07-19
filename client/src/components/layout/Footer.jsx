import { Mail, GitFork, Play } from 'lucide-react'
import { useThemeContext } from '@/context/ThemeContext'

export function Footer() {
  const { isDark } = useThemeContext()

  return (
    <footer
      className={`border-t px-6 py-8 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-surface border-border'
      }`}
    >
      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2">
        <div>
          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Connect with me
          </h3>
          <div className="flex items-center gap-4">
            <a
              href="mailto:codesonlyabhi@gmail.com"
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-muted hover:text-primary hover:bg-primary/10'
              }`}
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a
              href="#"
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-muted hover:text-primary hover:bg-primary/10'
              }`}
              aria-label="GitHub"
            >
              <GitFork className="w-5 h-5" />
            </a>
            <a
              href="#"
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-muted hover:text-primary hover:bg-primary/10'
              }`}
              aria-label="YouTube"
            >
              <Play className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            About
          </h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-muted'}`}>
            Built by a 2nd-year student, full-stack software developer, and machine learning enthusiast who also creates gaming and tech content on YouTube. Passionate about building robust backend systems and beautiful UIs.
          </p>
        </div>
      </div>

      <div className={`mt-8 pt-6 border-t text-center text-xs ${isDark ? 'border-slate-800 text-slate-500' : 'border-border text-muted'}`}>
        &copy; {new Date().getFullYear()} Industrial AI Knowledge Hub
      </div>
    </footer>
  )
}
