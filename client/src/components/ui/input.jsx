import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-slate-900 placeholder:text-muted transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      ref={ref}
      aria-invalid={error ? 'true' : undefined}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
