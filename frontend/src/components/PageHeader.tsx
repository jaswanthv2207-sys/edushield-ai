import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface PageHeaderProps {
  /** Small uppercase label shown above the title */
  eyebrow?: string
  title: ReactNode
  description?: string
  actions?: ReactNode
  className?: string
}

/**
 * Consistent page masthead: eyebrow label, display title, description
 * and trailing action buttons. Every page should use this so headings,
 * spacing and entrance animation stay in sync.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <span className="eyebrow mb-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-saffron-500" />
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-[2.1rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-[0.9rem]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </motion.div>
  )
}
