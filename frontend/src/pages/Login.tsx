import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  BarChart3,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const features = [
  { icon: BarChart3, text: 'Real-time dropout risk assessment across every school' },
  { icon: Sparkles, text: 'ML-driven recommendations for early intervention' },
  { icon: HeartHandshake, text: 'End-to-end counselling & follow-up management' },
]

const DEMO_CREDENTIALS = [
  { role: 'Administrator', email: 'admin@edushield.ai', password: 'Admin@123' },
  { role: 'Counsellor', email: 'counsellor@edushield.ai', password: 'Counsellor@123' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password, rememberMe)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ============ Left: brand hero ============ */}
      <div className="hero-surface relative hidden w-[46%] overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Decorative layers */}
        <div aria-hidden className="jaali pointer-events-none absolute inset-0 opacity-60" />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 animate-float rounded-full bg-brand-500/25 blur-[90px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 animate-float rounded-full bg-saffron-500/20 blur-[100px] [animation-delay:-3s]"
        />

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center gap-3.5"
        >
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <ShieldCheck className="h-6 w-6 text-white" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-saffron-400 ring-2 ring-[#0c1e4a]" />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">
              EduShield <span className="text-saffron-400">AI</span>
            </h1>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-200/80">
              Government of Rajasthan
            </p>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-xl"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-100 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-saffron-400" />
            AI-Powered Dropout Prediction
          </span>

          <h2 className="font-display text-[2.6rem] font-extrabold leading-[1.08] tracking-tight text-white">
            Keep every child{' '}
            <span className="bg-gradient-to-r from-saffron-300 via-saffron-400 to-brand-200 bg-clip-text text-transparent">
              in school
            </span>
            .
          </h2>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-brand-100/80">
            Early-warning intelligence that turns attendance, academic and
            financial signals into action — before a student drops out.
          </p>

          <ul className="mt-8 space-y-3.5">
            {features.map((f, i) => (
              <motion.li
                key={f.text}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.25 + i * 0.12 }}
                className="flex items-center gap-3 text-sm text-brand-50/90"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <f.icon className="h-4 w-4 text-saffron-300" />
                </span>
                {f.text}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Floating stat cards */}
        <div className="relative flex items-end gap-4">
          {[
            { label: 'Students monitored', value: '1.2L+' },
            { label: 'At-risk flagged early', value: '8,400' },
            { label: 'Schools connected', value: '312' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
              className="flex-1 rounded-2xl border border-white/12 bg-white/[0.07] p-4 backdrop-blur-md"
            >
              <p className="font-display text-xl font-bold text-white">{s.value}</p>
              <p className="mt-0.5 text-[11px] text-brand-100/70">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============ Right: form ============ */}
      <div className="relative flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[54%]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden"
        >
          <div className="hero-surface absolute inset-x-0 top-0 h-56" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[440px]"
        >
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow-blue">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
                EduShield <span className="text-saffron-600">AI</span>
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
                Government of Rajasthan
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-card p-7 shadow-lift sm:p-9 dark:border-slate-800">
            <span className="eyebrow">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-saffron-500" />
              Secure sign-in
            </span>
            <h2 className="mt-2.5 font-display text-[26px] font-extrabold leading-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Sign in to continue to your dashboard
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
              >
                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] font-semibold">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@edushield.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px] font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl pl-10 pr-11"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="group h-12 w-full rounded-xl text-[15px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Demo accounts — click to fill
              </p>
              <div className="grid gap-2">
                {DEMO_CREDENTIALS.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => {
                      setEmail(c.email)
                      setPassword(c.password)
                      setError('')
                    }}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-soft dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-brand-500"
                  >
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                        {c.role}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {c.email} · {c.password}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} EduShield AI · Department of Education,
            Government of Rajasthan
          </p>
        </motion.div>
      </div>
    </div>
  )
}
