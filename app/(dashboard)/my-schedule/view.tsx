'use client'
import { useState, useEffect, useTransition } from 'react'
import { ChevronLeft, ChevronRight, Clock, User, Check, Play, UserX, Loader2, CalendarDays } from 'lucide-react'
import { getAppointments, updateAppointmentStatus } from '@/lib/actions/appointments'
import { getStaff } from '@/lib/actions/staff'
import { formatCurrency, cn } from '@/lib/utils'

type Apt = Awaited<ReturnType<typeof getAppointments>>[0]
type StaffMember = Awaited<ReturnType<typeof getStaff>>[0]

const STATUS_CONFIG = {
  pending:      { label: 'Pending',     bg: 'bg-amber-50  dark:bg-amber-950/40',  dot: 'bg-amber-400',  text: 'text-amber-700 dark:text-amber-300' },
  confirmed:    { label: 'Confirmed',   bg: 'bg-blue-50   dark:bg-blue-950/40',   dot: 'bg-blue-400',   text: 'text-blue-700  dark:text-blue-300'  },
  'in-progress':{ label: 'In Progress', bg: 'bg-green-50  dark:bg-green-950/40',  dot: 'bg-green-500',  text: 'text-green-700 dark:text-green-300' },
  completed:    { label: 'Done',        bg: 'bg-gray-50   dark:bg-gray-800',      dot: 'bg-gray-300',   text: 'text-gray-500  dark:text-gray-400'  },
  cancelled:    { label: 'Cancelled',   bg: 'bg-red-50    dark:bg-red-950/40',    dot: 'bg-red-400',    text: 'text-red-600   dark:text-red-400'   },
  'no-show':    { label: 'No-show',     bg: 'bg-red-50    dark:bg-red-950/40',    dot: 'bg-red-300',    text: 'text-red-500   dark:text-red-400'   },
}

function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function dateLabel(d: Date) {
  const today = new Date()
  const diff   = Math.round((d.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / 86_400_000)
  today.setHours(0,0,0,0)
  d.setHours(0,0,0,0)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return d.toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric', month: 'short' })
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0]
}

export function ScheduleView() {
  const [offset, setOffset]     = useState(0)       // days from today
  const [staffId, setStaffId]   = useState<string>('all')
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [apts, setApts]         = useState<Apt[]>([])
  const [loading, setLoading]   = useState(true)
  const [, startTransition]     = useTransition()
  const [updating, setUpdating] = useState<string | null>(null)

  const date   = new Date()
  date.setDate(date.getDate() + offset)
  const dateStr = isoDate(date)

  // Load staff list once
  useEffect(() => {
    getStaff().then(list => {
      setStaffList(list)
      // Try to match current user to a staff record by name via /api/auth/me
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(me => {
        if (me?.name) {
          const match = list.find(s => s.name.toLowerCase() === me.name.toLowerCase())
          if (match) setStaffId(match.id)
        }
      })
    })
  }, [])

  // Load appointments whenever date or staff changes
  useEffect(() => {
    setLoading(true)
    const filters: { date: string; staffId?: string } = { date: dateStr }
    if (staffId !== 'all') filters.staffId = staffId
    getAppointments(filters).then(data => {
      setApts(data.sort((a, b) => a.startTime.localeCompare(b.startTime)))
      setLoading(false)
    })
  }, [dateStr, staffId])

  function changeStatus(id: string, status: string) {
    setUpdating(id)
    startTransition(async () => {
      await updateAppointmentStatus(id, status)
      setApts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      setUpdating(null)
    })
  }

  const activeApts    = apts.filter(a => !['completed', 'cancelled', 'no-show'].includes(a.status))
  const finishedApts  = apts.filter(a => ['completed', 'cancelled', 'no-show'].includes(a.status))

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-8">

      {/* Header */}
      <div>
        <h1 className="page-title">My Schedule</h1>
        <p className="page-subtitle">Your appointments for the day</p>
      </div>

      {/* Staff picker */}
      {staffList.length > 0 && (
        <select
          value={staffId}
          onChange={e => setStaffId(e.target.value)}
          className="form-input w-full"
        >
          <option value="all">All Staff</option>
          {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}

      {/* Day navigation */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
        <button
          onClick={() => setOffset(o => o - 1)}
          className="h-8 w-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dateLabel(new Date(dateStr + 'T00:00:00'))}</p>
          <p className="text-xs text-gray-400">{new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button
          onClick={() => setOffset(o => o + 1)}
          className="h-8 w-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {offset !== 0 && (
          <button
            onClick={() => setOffset(0)}
            className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline"
          >
            Today
          </button>
        )}
      </div>

      {/* Summary strip */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',    value: String(apts.length) },
            { label: 'Upcoming', value: String(activeApts.length) },
            { label: 'Revenue',  value: formatCurrency(apts.filter(a => a.status === 'completed').reduce((s, a) => s + (a.totalPrice ?? 0), 0)) },
          ].map(s => (
            <div key={s.label} className="stat-box py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Appointments */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : apts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center">
          <CalendarDays className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No appointments {offset === 0 ? 'today' : 'on this day'}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeApts.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Upcoming</p>
              {activeApts.map(apt => <AppCard key={apt.id} apt={apt} updating={updating} onStatus={changeStatus} />)}
            </>
          )}
          {finishedApts.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-4">Completed / Cancelled</p>
              {finishedApts.map(apt => <AppCard key={apt.id} apt={apt} updating={updating} onStatus={changeStatus} />)}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function AppCard({ apt, updating, onStatus }: {
  apt: Apt
  updating: string | null
  onStatus: (id: string, status: string) => void
}) {
  const cfg     = STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  const isLoading = updating === apt.id

  return (
    <div className={cn('rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden', cfg.bg)}>
      {/* Time bar */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Clock className="h-4 w-4 text-gray-400 shrink-0" />
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{fmt12(apt.startTime)}</span>
        {apt.duration && <span className="text-xs text-gray-400">· {apt.duration} min</span>}
        <span className={cn('ml-auto text-xs font-medium flex items-center gap-1', cfg.text)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
          {cfg.label}
        </span>
      </div>

      {/* Client + services */}
      <div className="px-4 pb-3 space-y-1">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{apt.client?.name ?? '—'}</span>
          {apt.client?.phone && (
            <a href={`tel:${apt.client.phone}`} className="ml-auto text-xs text-teal-600 dark:text-teal-400 hover:underline">{apt.client.phone}</a>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 pl-6 line-clamp-2">
          {(apt.services ?? []).map((s: any) => s.name ?? s.serviceName).join(' · ')}
        </p>
        {apt.totalPrice > 0 && (
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 pl-6">{formatCurrency(apt.totalPrice)}</p>
        )}
      </div>

      {/* Actions */}
      {!['completed', 'cancelled', 'no-show'].includes(apt.status) && (
        <div className="flex gap-2 px-4 pb-4">
          {apt.status !== 'in-progress' && (
            <button
              onClick={() => onStatus(apt.id, 'in-progress')}
              disabled={isLoading}
              className="flex items-center gap-1.5 flex-1 justify-center h-9 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              Start
            </button>
          )}
          <button
            onClick={() => onStatus(apt.id, 'completed')}
            disabled={isLoading}
            className="flex items-center gap-1.5 flex-1 justify-center h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Done
          </button>
          <button
            onClick={() => onStatus(apt.id, 'no-show')}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <UserX className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
