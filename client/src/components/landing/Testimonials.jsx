import { Star } from 'lucide-react'
import { useThemeContext } from '@/context/ThemeContext'

const reviews = [
  {
    name: 'Sarah Chen',
    role: 'Plant Operations Manager',
    text: 'This AI Powered Industrial Knowledge Management System cut our document lookup time in half. The smart search is a game changer.',
  },
  {
    name: 'Marcus Rivera',
    role: 'Maintenance Lead',
    text: 'Finally, all our SOPs and manuals in one place. The AI summaries help our team get up to speed on complex procedures fast.',
  },
  {
    name: 'Emily Watson',
    role: 'Quality Assurance Director',
    text: 'Compliance audits are smoother than ever. We can trace every document version and share insights across departments instantly.',
  },
  {
    name: 'David Okonkwo',
    role: 'Safety Engineer',
    text: 'The platform keeps our safety protocols accessible on the floor. Real-time analytics show us exactly what teams are referencing.',
  },
  {
    name: 'Lisa Park',
    role: 'Production Supervisor',
    text: 'Industrial AI transformed how we onboard new hires. They find answers themselves instead of waiting on senior staff.',
  },
]

function ReviewCard({ review, isDark }) {
  return (
    <div
      className={`flex-shrink-0 w-80 md:w-96 p-6 rounded-xl border mx-3 ${
        isDark
          ? 'bg-slate-800/80 border-slate-700'
          : 'bg-white border-border shadow-sm'
      }`}
    >
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
        ))}
      </div>
      <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        &ldquo;{review.text}&rdquo;
      </p>
      <div>
        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {review.name}
        </p>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-muted'}`}>{review.role}</p>
      </div>
    </div>
  )
}

export function Testimonials() {
  const { isDark } = useThemeContext()
  const duplicatedReviews = [...reviews, ...reviews]

  return (
    <section className={`py-16 overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-background'}`}>
      <div className="text-center mb-10 px-6">
        <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Trusted by Industrial Teams
        </h2>
        <p className={`max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-muted'}`}>
          See what professionals are saying about our AI Powered Industrial Knowledge Management System
        </p>
      </div>

      <div className="relative">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {duplicatedReviews.map((review, idx) => (
            <ReviewCard key={idx} review={review} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  )
}
