import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/utils/cn'

function Tabs({ className, ...props }) {
  return <TabsPrimitive.Root className={cn('', className)} {...props} />
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-muted',
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-surface data-[state=active]:text-slate-900 data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn('mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
