import { TrendingUp, TrendingDown, AlertCircle, ChevronRight, Check, Banknote, CalendarDays, BarChart3, Users2 } from 'lucide-react'
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

const STAT_CONFIGS = [
  {
    key: 'todayRevenue',
    label: "Today's Revenue",
    icon: Banknote,
    iconBg: 'bg-teal-500/10 dark:bg-teal-500/15',
    iconColor: 'text-teal-600 dark:text-teal-400',
    accent: 'from-teal-500/5 to-transparent',
  },
  {
    key: 'todayBookings',
    label: "Today's Bookings",
    icon: CalendarDays,
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconColor: 'text-blue-600 dark:text-blue-400',
    accent: 'from-blue-500/5 to-transparent',
  },
  {
    key: 'monthlyRevenue',
    label: 'Monthly Revenue',
    icon: BarChart3,
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    iconColor: 'text-violet-600 dark:text-violet-400',
    accent: 'from-violet-500/5 to-transparent',
  },
  {
    key: 'avgTransaction',
    label: 'Avg. Transaction',
    icon: Users2,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accent: 'from-amber-500/5 to-transparent',
  },
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
    { value: formatCurrency(stats.todayRevenue),  sub: `${stats.completedToday} completed · ${stats.upcomingToday} upcoming` },
    { value: String(stats.todayBookings),          sub: `${stats.availableStaff} of ${stats.staffCount} staff available` },
    { value: formatCurrency(stats.monthlyRevenue), sub: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}% vs last month`, up: stats.revenueGrowth >= 0 },
    { value: formatCurrency(stats.avgTransaction), sub: `${stats.totalClients} active clients` },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Page heading */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{today}</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-medium border border-teal-200 dark:border-teal-800">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          {stats.todayBookings} appointment{stats.todayBookings !== 1 ? 's' : ''} today
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIGS.map((cfg, i) => {
          const Icon = cfg.icon
          const s    = statValues[i]
          return (
            <div key={cfg.key} className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 overflow-hidden bg-gradient-to-br ${cfg.accent}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{cfg.label}</p>
                <div className={`h-8 w-8 rounded-lg ${cfg.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{s.value}</p>
              <p className={`text-xs flex items-center gap-1 ${s.up === true ? 'text-green-600' : s.up === false ? 'text-red-500' : 'text-gray-400'}`}>
                {s.up === true  && <TrendingUp  className="h-3 w-3" />}
                {s.up === false && <TrendingDown className="h-3 w-3" />}
                {s.sub}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's appointments */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Today's Appointments</h2>
            <Link href="/appointments" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {todayApts.length === 0 ? (
            <p className="text-sm text-gray-400 px-5 py-10 text-center">No appointments scheduled for today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Staff</th>
                    <th>Status</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {todayApts.map(apt => (
                    <tr key={apt.id}>
                      <td className="font-mono text-xs text-gray-400">{apt.startTime}</td>
                      <td className="font-medium">{apt.clientName}</td>
                      <td className="text-gray-500">{apt.services.map((s: any) => s.name).join(', ') || '—'}</td>
                      <td className="text-gray-400">{apt.staffName.split(' ')[0]}</td>
                      <td>
                        <span className={`badge ${
                          apt.status === 'completed'   ? 'badge-gray'   :
                          apt.status === 'in-progress' ? 'badge-green'  :
                          apt.status === 'confirmed'   ? 'badge-blue'   :
                          apt.status === 'cancelled'   ? 'badge-red'    : 'badge-yellow'
                        }`}>
                          {apt.status === 'in-progress' ? 'In Progress' : apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                      </td>
                      <td className="text-right font-semibold">{formatCurrency(apt.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <OnboardingChecklist />

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Staff Status</h2>
              <Link href="/staff" className="text-xs text-teal-600 hover:text-teal-700 font-medium">View all</Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {staffList.map(member => (
                <div key={member.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${member.isAvailable ? 'bg-green-500' : 'bg-amber-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {member.completedToday}/{member.todayBookings}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <BookingLinkCard />

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Insights</h2>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {stats.revenueGrowth > 0 && (
                <div className="flex gap-3 px-4 py-3">
                  <div className="h-7 w-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Revenue up {stats.revenueGrowth}% this month.</p>
                </div>
              )}
              <div className="flex gap-3 px-4 py-3">
                <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Check <Link href="/automations" className="text-teal-600 hover:underline font-medium">Automations</Link> to re-engage inactive clients.
                </p>
              </div>
              <div className="flex gap-3 px-4 py-3">
                <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stats.totalClients} active clients registered.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const revalidate = 30
