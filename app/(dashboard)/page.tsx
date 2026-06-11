import { TrendingUp, TrendingDown, ChevronRight, Banknote, CalendarDays, BarChart3, Users2, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, getTodayAppointments } from '@/lib/actions/appointments'
import { getStaffWithStats } from '@/lib/actions/staff'
import { getSessionUser, getEffectiveLocationId } from '@/lib/auth'
import { formatCurrency, getGreeting } from '@/lib/utils'
import dynamic from 'next/dynamic'
const BookingLinkCard = dynamic(
  () => import('@/components/dashboard/booking-link-card').then(m => ({ default: m.BookingLinkCard })),
  { ssr: false }
)
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist'

const STAT_CARDS = [
  {
    key: 'todayRevenue',
    label: "Today's Revenue",
    icon: Banknote,
    bg:   'bg-gradient-to-b from-teal-400 to-teal-600',
    num:  'text-white',
    sub:  'text-teal-100',
    icon_bg: 'bg-white/20',
  },
  {
    key: 'todayBookings',
    label: "Today's Bookings",
    icon: CalendarDays,
    bg:   'bg-gradient-to-b from-indigo-400 to-indigo-600',
    num:  'text-white',
    sub:  'text-indigo-100',
    icon_bg: 'bg-white/20',
  },
  {
    key: 'monthlyRevenue',
    label: 'Monthly Revenue',
    icon: BarChart3,
    bg:   'bg-gradient-to-b from-violet-400 to-violet-600',
    num:  'text-white',
    sub:  'text-violet-100',
    icon_bg: 'bg-white/20',
  },
  {
    key: 'avgTransaction',
    label: 'Avg. Transaction',
    icon: Users2,
    bg:   'bg-gradient-to-b from-amber-400 to-orange-500',
    num:  'text-white',
    sub:  'text-amber-100',
    icon_bg: 'bg-white/20',
  },
]

const STATUS_COLORS: Record<string, string> = {
  completed:   'bg-gray-400',
  'in-progress': 'bg-teal-500',
  confirmed:   'bg-blue-500',
  cancelled:   'bg-red-400',
  pending:     'bg-amber-400',
}

const STATUS_LABELS: Record<string, string> = {
  completed:   'Done',
  'in-progress': 'Now',
  confirmed:   'Confirmed',
  cancelled:   'Cancelled',
  pending:     'Pending',
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = [
  'bg-teal-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-rose-500', 'bg-amber-500', 'bg-sky-500',
]

export default async function DashboardPage() {
  const user             = await getSessionUser()
  const firstName        = user?.name.split(' ')[0] ?? 'there'
  const activeLocationId = await getEffectiveLocationId()

  const [stats, todayApts, staffList] = await Promise.all([
    getDashboardStats(activeLocationId),
    getTodayAppointments(activeLocationId),
    getStaffWithStats(activeLocationId),
  ])

  const today = new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long' })

  const statValues = [
    { value: formatCurrency(stats.todayRevenue),  sub: `${stats.completedToday} done · ${stats.upcomingToday} upcoming`, trend: undefined },
    { value: String(stats.todayBookings),          sub: `${stats.availableStaff}/${stats.staffCount} staff available`,  trend: undefined },
    { value: formatCurrency(stats.monthlyRevenue), sub: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}% vs last month`, trend: stats.revenueGrowth >= 0 },
    { value: formatCurrency(stats.avgTransaction), sub: `${stats.totalClients} active clients`, trend: undefined },
  ]

  // Simple revenue ring: % of monthly target (use 5000 GHS as soft target)
  const TARGET = 5000
  const pct    = Math.min(100, Math.round((stats.monthlyRevenue / TARGET) * 100))
  const r      = 52
  const circ   = 2 * Math.PI * r
  const dash   = circ * (1 - pct / 100)

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">{today}</p>
          <h1 className="text-[2rem] font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Here's what's happening at your salon today.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Link href="/appointments/new" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/20 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Appointment
          </Link>
          <Link href="/pos" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-teal-500 hover:bg-teal-600 text-white transition-colors shadow-sm shadow-teal-200 dark:shadow-teal-900/40">
            New Sale <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((cfg, i) => {
          const Icon = cfg.icon
          const s    = statValues[i]
          return (
            <div key={cfg.key} className={`${cfg.bg} rounded-2xl p-5 flex flex-col justify-between min-h-[160px] shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-default`}>
              <div className="flex items-center justify-between">
                <div className={`h-9 w-9 rounded-xl ${cfg.icon_bg} flex items-center justify-center`}>
                  <Icon className="h-4.5 w-4.5 text-white" style={{ height: '18px', width: '18px' }} />
                </div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-widest text-right leading-tight max-w-[90px]">{cfg.label}</p>
              </div>
              <div>
                <p className={`text-[1.85rem] font-black tracking-tight leading-none ${cfg.num} mb-1.5`}>{s.value}</p>
                <p className={`text-xs flex items-center gap-1 ${cfg.sub}`}>
                  {s.trend === true  && <TrendingUp  className="h-3 w-3 shrink-0" />}
                  {s.trend === false && <TrendingDown className="h-3 w-3 shrink-0" />}
                  {s.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's appointments — 2/3 */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Today's Appointments</h2>
              <p className="text-xs text-gray-400 mt-0.5">{todayApts.length} scheduled</p>
            </div>
            <Link href="/appointments" className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {todayApts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <CalendarDays className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No appointments today</p>
              <Link href="/appointments/new" className="mt-3 text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline">Schedule one →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {todayApts.map((apt, idx) => (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Avatar */}
                  <div className={`h-9 w-9 rounded-xl ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {getInitials(apt.clientName)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{apt.clientName}</p>
                    <p className="text-xs text-gray-400 truncate">{apt.services.map((s: any) => s.name).join(', ') || apt.staffName}</p>
                  </div>
                  {/* Time */}
                  <p className="text-xs font-mono text-gray-400 shrink-0">{apt.startTime}</p>
                  {/* Status dot + label */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[apt.status] ?? 'bg-gray-300'}`} />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">
                      {STATUS_LABELS[apt.status] ?? apt.status}
                    </span>
                  </div>
                  {/* Amount */}
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 shrink-0">{formatCurrency(apt.totalPrice)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-5">

          {/* Revenue ring */}
          <div className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-1">Monthly Goal</h2>
            <p className="text-xs text-gray-400 mb-5">Revenue progress</p>
            <div className="flex items-center justify-center">
              <svg width="128" height="128" className="-rotate-90">
                <circle cx="64" cy="64" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-100 dark:text-gray-800" />
                <circle
                  cx="64" cy="64" r={r} fill="none"
                  stroke="url(#tealGrad)" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dash}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <defs>
                  <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-2xl font-black text-gray-900 dark:text-white">{pct}%</p>
                <p className="text-[10px] text-gray-400 font-medium">of goal</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">This month</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Growth</p>
                <p className={`text-sm font-bold ${stats.revenueGrowth >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
                </p>
              </div>
            </div>
          </div>

          {/* Staff status */}
          <div className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Staff Today</h2>
              <Link href="/staff" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {staffList.slice(0, 5).map((member, idx) => (
                <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`h-8 w-8 rounded-lg ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.role}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${member.isAvailable ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                      {member.isAvailable ? 'Free' : 'Busy'}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{member.completedToday}/{member.todayBookings} done</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <OnboardingChecklist />
          <BookingLinkCard />
        </div>
      </div>
    </div>
  )
}

export const revalidate = 30
