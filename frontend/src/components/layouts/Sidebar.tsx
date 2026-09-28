import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Brain,
  Calculator,
  BarChart3,
  HeartHandshake,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'

const sections = [
  {
    label: 'Overview',
    items: [{ path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'Intelligence',
    items: [
      { path: '/students', icon: Users, label: 'Students' },
      { path: '/ai-prediction', icon: Brain, label: 'AI Prediction' },
      { path: '/manual-prediction', icon: Calculator, label: 'Manual Prediction' },
      { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/counselling', icon: HeartHandshake, label: 'Counselling' },
      { path: '/reports', icon: FileText, label: 'Reports' },
    ],
  },
  {
    label: 'System',
    items: [{ path: '/settings', icon: Settings, label: 'Settings' }],
  },
]

const roleBadge: Record<string, string> = {
  admin: 'bg-saffron-500/20 text-saffron-300 border-saffron-500/30',
  principal: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  teacher: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  counsellor: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
}

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  /** Mobile drawer visibility */
  open?: boolean
  onClose?: () => void
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  open = false,
  onClose,
}: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const isCollapsed = collapsed

  const content = (
    <div className="navy-surface flex h-full flex-col text-slate-300">
      {/* Logo */}
      <div
        className={cn(
          'flex h-[68px] shrink-0 items-center border-b border-white/10',
          isCollapsed ? 'justify-center px-3' : 'justify-between px-5'
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!isCollapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow-blue">
                <Sparkles className="h-5 w-5 text-white" />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a1633] bg-saffron-400" />
              </div>
              <div className="leading-tight">
                <p className="font-display text-[17px] font-bold tracking-tight text-white">
                  EduShield <span className="text-saffron-400">AI</span>
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Govt. of Rajasthan
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mini"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow-blue"
            >
              <Sparkles className="h-5 w-5 text-white" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a1633] bg-saffron-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isCollapsed && onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-scroll flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-5">
        {sections.map((section) => (
          <div key={section.label}>
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl text-[13.5px] font-medium transition-all duration-200',
                      isCollapsed ? 'h-11 justify-center px-0' : 'px-3 py-2.5',
                      isActive
                        ? 'bg-gradient-to-r from-brand-600/85 to-brand-600/40 text-white shadow-[0_8px_20px_-12px_rgb(37_99_235_/0.9)]'
                        : 'text-slate-400 hover:bg-white/[0.07] hover:text-slate-100'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId={isCollapsed ? 'nav-dot-v' : 'nav-pill'}
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-saffron-400 shadow-[0_0_10px_rgb(249_140_7_/0.9)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110',
                        isActive && 'text-white'
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {!isCollapsed && isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-saffron-400" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl bg-white/[0.06] p-3',
            isCollapsed && 'justify-center bg-transparent p-2'
          )}
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white ring-2 ring-white/10">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b1730] bg-emerald-400" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-semibold text-white">
                {user?.full_name || 'User'}
              </p>
              <span
                className={cn(
                  'mt-1 inline-flex items-center rounded-full border px-1.5 py-px text-[9.5px] font-bold uppercase tracking-wider',
                  roleBadge[user?.role || ''] || 'border-white/15 bg-white/10 text-slate-300'
                )}
              >
                {user?.role || 'user'}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="rounded-lg p-2 text-slate-400 transition-all hover:bg-red-500/15 hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="mt-2 flex h-9 w-full items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-red-500/15 hover:text-red-400"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop — visibility controlled by the wrapper so framer's inline
          styles can never override the `hidden` class */}
      <div className="fixed left-0 top-0 z-40 hidden h-screen lg:block">
        <motion.aside
          animate={{ width: isCollapsed ? 84 : 276 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="h-full overflow-hidden shadow-[4px_0_24px_-16px_rgb(10_22_51_/0.6)]"
        >
          {content}
        </motion.aside>

        {/* Collapse toggle — outside the clipped inner box */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-[86px] hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-soft transition-all hover:border-brand-400 hover:text-brand-600 lg:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed left-0 top-0 z-50 h-screen w-[276px] lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
