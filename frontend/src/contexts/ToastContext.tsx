import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (type: ToastType, title: string, message?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const config: Record<
    ToastType,
    { icon: ReactNode; tile: string; stripe: string; ring: string }
  > = {
    success: {
      icon: <CheckCircle className="h-4 w-4" />,
      tile: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
      stripe: 'bg-emerald-500',
      ring: 'border-emerald-200/70 dark:border-emerald-800/60',
    },
    error: {
      icon: <XCircle className="h-4 w-4" />,
      tile: 'bg-red-500/12 text-red-600 dark:text-red-400',
      stripe: 'bg-red-500',
      ring: 'border-red-200/70 dark:border-red-800/60',
    },
    warning: {
      icon: <AlertCircle className="h-4 w-4" />,
      tile: 'bg-amber-500/14 text-amber-600 dark:text-amber-400',
      stripe: 'bg-amber-500',
      ring: 'border-amber-200/70 dark:border-amber-800/60',
    },
    info: {
      icon: <AlertCircle className="h-4 w-4" />,
      tile: 'bg-brand-500/12 text-brand-600 dark:text-brand-300',
      stripe: 'bg-brand-500',
      ring: 'border-brand-200/70 dark:border-brand-800/60',
    },
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-[380px] flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((toast) => {
            const c = config[toast.type]
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 60, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border bg-card p-4 shadow-lift backdrop-blur ${c.ring}`}
              >
                <span
                  className={`absolute inset-y-0 left-0 w-[3px] ${c.stripe}`}
                />
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${c.tile}`}
                >
                  {c.icon}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[13.5px] font-semibold leading-tight text-slate-900 dark:text-white">
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className="mt-1 text-[12.5px] leading-snug text-slate-500 dark:text-slate-400">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="-mr-1 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
                {/* Auto-dismiss progress line */}
                <motion.span
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-[2px] w-full origin-left ${c.stripe} opacity-60`}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
