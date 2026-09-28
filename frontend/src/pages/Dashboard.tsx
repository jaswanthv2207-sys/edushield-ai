import { motion } from 'framer-motion'
import {
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  School,
  UserCheck,
  Calendar,
  ArrowRight,
  Sparkles,
  BarChart3,
  HeartHandshake,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import AnimatedCounter from '@/components/AnimatedCounter'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const RISK_COLORS: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
}

const tooltipStyle = {
  backgroundColor: '#0a1633',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: 12,
  boxShadow: '0 18px 40px -18px rgba(10,22,51,0.7)',
}

const container = {
  hidden: { opacity: 0 },
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function Dashboard() {
  const { data, isLoading } = useAnalytics()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const stats = data?.dashboard_stats || {
    total_students: 0,
    high_risk_count: 0,
    medium_risk_count: 0,
    low_risk_count: 0,
    dropout_rate: 0,
    total_schools: 0,
    total_counsellors: 0,
    active_counselling_sessions: 0,
  }

  const pct = (n: number) =>
    stats.total_students > 0
      ? `${Math.round((n / stats.total_students) * 1000) / 10}%`
      : '0%'

  const kpiCards = [
    {
      title: 'Total Students',
      value: stats.total_students,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      foot: `Across ${stats.total_schools} schools`,
      tone: 'text-brand-600 dark:text-brand-300',
    },
    {
      title: 'High Risk',
      value: stats.high_risk_count,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-600',
      foot: `${pct(stats.high_risk_count)} of student body`,
      tone: 'text-red-600 dark:text-red-400',
      urgent: true,
    },
    {
      title: 'Medium Risk',
      value: stats.medium_risk_count,
      icon: TrendingUp,
      gradient: 'from-amber-400 to-orange-500',
      foot: `${pct(stats.medium_risk_count)} of student body`,
      tone: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Low Risk',
      value: stats.low_risk_count,
      icon: TrendingDown,
      gradient: 'from-emerald-400 to-teal-600',
      foot: `${pct(stats.low_risk_count)} of student body`,
      tone: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Dropout Rate',
      value: stats.dropout_rate,
      suffix: '%',
      decimals: 1,
      icon: GraduationCap,
      gradient: 'from-violet-500 to-purple-600',
      foot: 'Model-estimated this term',
      tone: 'text-violet-600 dark:text-violet-300',
    },
    {
      title: 'Total Schools',
      value: stats.total_schools,
      icon: School,
      gradient: 'from-sky-500 to-blue-600',
      foot: 'Connected institutions',
      tone: 'text-sky-600 dark:text-sky-300',
    },
    {
      title: 'Counsellors',
      value: stats.total_counsellors,
      icon: UserCheck,
      gradient: 'from-teal-500 to-cyan-600',
      foot: 'Field intervention team',
      tone: 'text-teal-600 dark:text-teal-300',
    },
    {
      title: 'Active Sessions',
      value: stats.active_counselling_sessions,
      icon: Calendar,
      gradient: 'from-fuchsia-500 to-pink-600',
      foot: 'Cases in progress',
      tone: 'text-fuchsia-600 dark:text-fuchsia-300',
    },
  ]

  const riskData = data?.risk_distribution || []
  const attendanceData = data?.attendance_trend || []
  const schoolData = data?.school_comparison || []
  const totalRisk = riskData.reduce((s, r) => s + (r.count || 0), 0)

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const rawName = user?.full_name?.split(' ')[0] || 'there'
  const displayName = rawName === 'System' ? 'Admin' : rawName
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const quickActions = [
    { label: 'Run AI Prediction', icon: Sparkles, to: '/ai-prediction' },
    { label: 'Open Analytics', icon: BarChart3, to: '/analytics' },
    { label: 'Counselling Queue', icon: HeartHandshake, to: '/counselling' },
  ]

  return (
    <div className="space-y-6">
      {/* ============ Hero banner ============ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="hero-surface relative overflow-hidden rounded-3xl p-6 shadow-lift sm:p-8"
      >
        <div aria-hidden className="jaali pointer-events-none absolute inset-0 opacity-50" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 animate-float rounded-full bg-saffron-400/25 blur-[70px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 animate-float rounded-full bg-brand-400/30 blur-[70px] [animation-delay:-4s]"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-100 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-saffron-400" />
              {today}
            </span>
            <h1 className="mt-3.5 font-display text-2xl font-extrabold leading-tight text-white sm:text-[2rem]">
              {greeting}, {displayName}{' '}
              <span className="inline-block origin-[70%_70%] animate-[float_3.5s_ease-in-out_infinite]">
                👋
              </span>
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-brand-100/80 sm:text-[15px]">
              {stats.high_risk_count > 0 ? (
                <>
                  <span className="font-semibold text-saffron-300">
                    {stats.high_risk_count} students
                  </span>{' '}
                  are flagged high-risk right now. Early intervention today prevents
                  dropouts tomorrow.
                </>
              ) : (
                <>No students are currently flagged high-risk. Keep up the great work.</>
              )}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.to)}
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:border-saffron-400/60 hover:bg-white/20"
                >
                  <a.icon className="h-4 w-4 text-saffron-300" />
                  {a.label}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Hero mini stats */}
          <div className="grid w-full shrink-0 grid-cols-3 gap-3 lg:w-auto">
            {[
              { label: 'Students', value: stats.total_students },
              { label: 'Schools', value: stats.total_schools },
              { label: 'Sessions', value: stats.active_counselling_sessions },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.45 }}
                className="min-w-[92px] rounded-2xl border border-white/12 bg-white/[0.08] px-4 py-3.5 text-center backdrop-blur-md sm:min-w-[110px]"
              >
                <p className="font-display text-2xl font-extrabold text-white">
                  <AnimatedCounter value={s.value} />
                </p>
                <p className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-brand-100/70">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ============ KPI cards ============ */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {kpiCards.map((card) => (
          <motion.div key={card.title} variants={item}>
            <Card className="top-accent card-hover group h-full [--accent-stripe:theme(colors.brand.500)]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      {card.title}
                    </p>
                    <p
                      className={`mt-2 font-display text-[32px] font-extrabold leading-none tracking-tight ${card.tone}`}
                    >
                      <AnimatedCounter
                        value={card.value}
                        suffix={card.suffix}
                        decimals={card.decimals ?? 0}
                      />
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <card.icon className="h-[22px] w-[22px] text-white" />
                  </div>
                </div>
                <p className="mt-3.5 flex items-center gap-1.5 border-t border-dashed border-slate-200 pt-3 text-[12.5px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  {card.urgent && (
                    <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-red-500" />
                  )}
                  {card.foot}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ============ Charts row ============ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Attendance trend */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="xl:col-span-3"
        >
          <Card className="h-full">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription className="mt-1">
                  Average monthly attendance across all connected schools
                </CardDescription>
              </div>
              <span className="hidden rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600 sm:block dark:bg-brand-950 dark:text-brand-300">
                12 months
              </span>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={288}>
                <AreaChart data={attendanceData} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#355ef2" stopOpacity={0.42} />
                      <stop offset="95%" stopColor="#355ef2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    width={44}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#355ef2', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    type="monotone"
                    dataKey="average_attendance"
                    name="Attendance %"
                    stroke="#355ef2"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorAttendance)"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk distribution donut */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="xl:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription className="mt-1">
                Current risk segmentation of the student body
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={96}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="risk_level"
                      stroke="none"
                    >
                      {riskData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={RISK_COLORS[entry.risk_level] || '#355ef2'}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Donut center */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
                    <AnimatedCounter value={totalRisk} />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Students
                  </span>
                </div>
              </div>

              {/* Legend chips */}
              <div className="mt-3 space-y-2">
                {riskData.map((entry) => (
                  <div
                    key={entry.risk_level}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-900/70"
                  >
                    <span className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: RISK_COLORS[entry.risk_level] || '#355ef2',
                        }}
                      />
                      {String(entry.risk_level).charAt(0) +
                        String(entry.risk_level)
                          .slice(1)
                          .toLowerCase()}
                    </span>
                    <span className="flex items-center gap-2 text-[13px]">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {entry.count}
                      </span>
                      <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                        {entry.percentage}%
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ============ School comparison ============ */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>School Comparison</CardTitle>
              <CardDescription className="mt-1">
                Risk concentration by school — target resources where they matter
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/students')}>
              View all students
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={schoolData} margin={{ top: 6, right: 8, left: -14, bottom: 24 }}>
                <CartesianGrid strokeDasharray="4 6" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                <XAxis
                  dataKey="school_name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  interval={0}
                  angle={schoolData.length > 6 ? -18 : 0}
                  textAnchor={schoolData.length > 6 ? 'end' : 'middle'}
                  height={54}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={44} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(53,94,242,0.06)' }} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="high_risk_count" name="High Risk" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={38} />
                <Bar dataKey="medium_risk_count" name="Medium Risk" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={38} />
                <Bar dataKey="low_risk_count" name="Low Risk" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-9 w-16" />
              <Skeleton className="mt-4 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[288px] w-full" />
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[340px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
