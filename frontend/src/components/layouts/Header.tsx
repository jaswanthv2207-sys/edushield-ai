import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Moon, Sun, Menu, Sparkles } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

interface HeaderProps {
  onMenuClick?: () => void
}

const routeMeta: Record<string, { section: string; title: string }> = {
  '/dashboard': { section: 'Overview', title: 'Dashboard' },
  '/students': { section: 'Intelligence', title: 'Students' },
  '/ai-prediction': { section: 'Intelligence', title: 'AI Prediction' },
  '/manual-prediction': { section: 'Intelligence', title: 'Manual Prediction' },
  '/analytics': { section: 'Intelligence', title: 'Analytics' },
  '/counselling': { section: 'Operations', title: 'Counselling' },
  '/reports': { section: 'Operations', title: 'Reports' },
  '/settings': { section: 'System', title: 'Settings' },
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const meta =
    routeMeta[location.pathname] ||
    (location.pathname.startsWith('/students/')
      ? { section: 'Intelligence', title: 'Student Profile' }
      : { section: 'EduShield', title: 'Workspace' })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const term = query.trim()
      navigate(term ? `/students?search=${encodeURIComponent(term)}` : '/students')
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-[68px] items-center justify-between gap-4 border-b px-4 transition-all duration-300 sm:px-6',
        scrolled
          ? 'glass-strong border-slate-200/80 shadow-[0_10px_30px_-24px_rgb(10_22_51_/0.8)] dark:border-slate-800'
          : 'glass border-transparent dark:border-slate-800/60'
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden min-w-0 sm:block">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
            <span className="inline-block h-1 w-1 rounded-full bg-saffron-500" />
            {meta.section}
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={meta.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="truncate font-display text-[15px] font-bold leading-tight text-slate-900 dark:text-white"
            >
              {meta.title}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search students, schools..."
            className="h-10 w-64 rounded-xl border-slate-200/80 bg-white/70 pl-9 pr-14 text-[13px] shadow-none backdrop-blur dark:border-slate-700 dark:bg-slate-900/60 lg:w-72"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 lg:block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            ⏎
          </kbd>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-xl text-slate-500 hover:text-brand-600 dark:text-slate-400"
          title="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 60, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.22 }}
              className="flex"
            >
              {theme === 'dark' ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </motion.span>
          </AnimatePresence>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl text-slate-500 hover:text-brand-600 dark:text-slate-400"
          title="High-risk student alerts"
          onClick={() => navigate('/counselling')}
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900">
            <span className="absolute inset-0 animate-pulse-dot rounded-full bg-red-400" />
          </span>
        </Button>

        <div className="mx-1 hidden h-8 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-glow-blue ring-2 ring-white dark:ring-slate-900">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
          </div>
          <div className="hidden leading-tight lg:block">
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
              {user?.full_name || 'User'}
            </p>
            <p className="flex items-center gap-1 text-[11px] capitalize text-slate-600 dark:text-slate-400">
              <Sparkles className="h-3 w-3 text-saffron-500" />
              {user?.role || 'user'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
