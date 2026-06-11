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

// Inline styles so Tailwind JIT can't purge the colors
const CARD_STYLES = [
  { grad: { background: 'linear-gradient(160deg,#2dd4bf 0%,#0d9488 100%)' }, shadow: '0 8px 32px rgba(13,148,136,0.35)' },
  { grad: { background: 'linear-gradient(160deg,#818cf8 0%,#4338ca 100%)' }, shadow: '0 8px 32px rgba(67,56,202,0.35)' },
  { grad: { background: 'linear-gradient(160deg,#c084fc 0%,#7c3aed 100%)' }, shadow: '0 8px 32px rgba(124,58,237,0.35)' },
  { grad: { background: 'linear-gradient(160deg,#fbbf24 0%,#f97316 100%)' }, shadow: '0 8px 32px rgba(249,115,22,0.35)' },
]

const STAT_META = [
  { key: 'todayRevenue',   label: "Today's Revenue",   Icon: Banknote    },
  { key: 'todayBookings',  label: "Today's Bookings",  Icon: CalendarDays },
  { key: 'monthlyRevenue', label: 'Monthly Revenue',   Icon: BarChart3    },
  { key: 'avgTransaction', label: 'Avg. Transaction',  Icon: Users2       },
]

const STATUS_COLORS: Record<string, string> = {
  completed:     'bg-gray-400',
  'in-progress': 'bg-teal-500',
  confirmed:     'bg-blue-500',
  cancelled:     'bg-red-400',
  pending:       'bg-amber-400',
}
const STATUS_LABELS: Record<string, string> = {
  completed:     'Done',
  'in-progress': 'Now',
  confirmed:     'Confirmed',
  cancelled:     'Cancelled',
  pending:       'Pending',
}

const AVATAR_BG = ['#0d9488','#4338ca','#7c3aed','#e11d48','#d97706','#0284c7']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

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
    { value: String(stats.todayBookings),          sub: `${stats.availableStaff}/${stats.staffCount} staff available`,   trend: undefined },
    { value: formatCurrency(stats.monthlyRevenue), sub: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}% vs last month`, trend: stats.revenueGrowth >= 0 },
    { value: formatCurrency(stats.avgTransaction), sub: `${stats.totalClients} active clients`, trend: undefined },
  ]

  // Monthly goal ring
  const TARGET  = 5000
  const pct     = Math.min(100, Math.round((stats.monthlyRevenue / TARGET) * 100))
  const r       = 48
  const circ    = 2 * Math.PI * r
  const dashOff = circ * (1 - pct / 100)

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">{today}</p>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">
            Here's what's happening at your salon today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link href="/appointments/new" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm">
            <Plus className="h-4 w-4" /> Appointment
          </Link>
          <Link href="/pos" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all" style={{ background: 'linear-gradient(135deg,#14b8a6,#0d9488)', boxShadow: '0 4px 14px rgba(13,148,136,0.4)' }}>
            New Sale <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_META.map(({ key, label, Icon }, i) => {
          const s   = statValues[i]
          const cs  = CARD_STYLES[i]
          return (
            <div
              key={key}
              className="rounded-2xl p-5 flex flex-col justify-between cursor-default transition-transform duration-200 hover:-translate-y-1"
              style={{ ...cs.grad, minHeight: '172px', boxShadow: cs.shadow }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Icon className="text-white" style={{ height: 20, width: 20 }} />
                </div>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest text-right leading-tight">{label}</p>
              </div>
              <div>
                <p className="text-[1.9rem] font-black tracking-tight leading-none text-white mb-1.5">{s.value}</p>
                <p className="text-xs text-white/70 flex items-center gap-1">
                  {s.trend === true  && <TrendingUp  className="h-3 w-3 shrink-0" />}
                  {s.trend === false && <TrendingDown className="h-3 w-3 shrink-0" />}
                  {s.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's appointments — 2/3 */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
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
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)' }}>
                <CalendarDays className="h-7 w-7 text-teal-500" />
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No appointments today</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Your calendar is clear.</p>
              <Link href="/appointments/new" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">Schedule an appointment →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {todayApts.map((apt, idx) => (
                <div key={apt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: AVATAR_BG[idx % AVATAR_BG.length] }}>
                    {getInitials(apt.clientName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{apt.clientName}</p>
                    <p className="text-xs text-gray-400 truncate">{apt.services.map((s: any) => s.name).join(', ') || apt.staffName}</p>
                  </div>
                  <p className="text-xs font-mono text-gray-400 shrink-0">{apt.startTime}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[apt.status] ?? 'bg-gray-300'}`} />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">{STATUS_LABELS[apt.status] ?? apt.status}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 shrink-0">{formatCurrency(apt.totalPrice)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-5">

          {/* Revenue ring */}
          <div className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 className="font-bold text-gray-900 dark:text-white">Monthly Goal</h2>
            <p className="text-xs text-gray-400 mb-5">GH₵ {TARGET.toLocaleString()} target</p>
            <div className="relative flex items-center justify-center" style={{ height: 120 }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r={r} fill="none"
                  stroke="url(#tg)" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOff}
                />
                <defs>
                  <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{pct}%</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">of goal</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-800/60 text-center">
                <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide font-semibold">Revenue</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
              <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-800/60 text-center">
                <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide font-semibold">Growth</p>
                <p className={`text-sm font-bold ${stats.revenueGrowth >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
                </p>
              </div>
            </div>
          </div>

          {/* Staff */}
          <div className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">Staff Today</h2>
              <Link href="/staff" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">View all</Link>
            </div>
            {staffList.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No staff added yet.</p>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {staffList.slice(0, 5).map((member, idx) => (
                  <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: AVATAR_BG[idx % AVATAR_BG.length] }}>
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${member.isAvailable ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                        {member.isAvailable ? 'Free' : 'Busy'}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">{member.completedToday}/{member.todayBookings} done</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <OnboardingChecklist />
          <BookingLinkCard />
        </div>
      </div>
    </div>
  )
}

export const revalidate = 30
