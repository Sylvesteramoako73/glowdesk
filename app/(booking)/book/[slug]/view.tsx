'use client'
import { useState } from 'react'
import { Check, ArrowRight, ChevronLeft, Loader2, MapPin, Clock, Calendar } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Service, Staff } from '@/lib/types'
import type { Location } from '@/lib/actions/locations'

const TIME_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00',
]

function getMinDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

type Props = {
  tenantId:  string
  salonName: string
  services:  Service[]
  staff:     Staff[]
  locations: Location[]
}

export function PublicBookingView({ tenantId, salonName, services, staff, locations }: Props) {
  const multiLocation = locations.length > 1

  const [step, setStep]           = useState(1)
  const [locationId, setLocId]    = useState(multiLocation ? '' : (locations[0]?.id ?? ''))
  const [selectedSvcs, setSvcs]   = useState<string[]>([])
  const [staffId, setStaffId]     = useState('')
  const [date, setDate]           = useState('')
  const [time, setTime]           = useState('')
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [email, setEmail]         = useState('')
  const [notes, setNotes]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  const selectedLoc  = locations.find(l => l.id === locationId) ?? null
  const staffForLoc  = locationId && staff.some(s => (s as any).locationId)
    ? staff.filter(s => (s as any).locationId === locationId || !(s as any).locationId)
    : staff

  const categories = [...new Set(services.map(s => s.category))]
  const picked     = services.filter(s => selectedSvcs.includes(s.id))
  const total      = picked.reduce((s, sv) => s + sv.price, 0)
  const duration   = picked.reduce((s, sv) => s + sv.duration, 0)

  // Step numbering
  const BRANCH_STEP  = multiLocation ? 1 : null
  const SERVICE_STEP = multiLocation ? 2 : 1
  const WHEN_STEP    = multiLocation ? 3 : 2
  const DETAIL_STEP  = multiLocation ? 4 : 3
  const TOTAL_STEPS  = multiLocation ? 4 : 3

  const STEP_LABELS = multiLocation
    ? ['Branch', 'Services', 'Date & Time', 'Your Details']
    : ['Services', 'Date & Time', 'Your Details']

  function toggleSvc(id: string) {
    setSvcs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function canAdvance() {
    if (step === BRANCH_STEP)  return !!locationId
    if (step === SERVICE_STEP) return selectedSvcs.length > 0
    if (step === WHEN_STEP)    return !!date && !!time && !!staffId
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          serviceIds: selectedSvcs,
          staffId,
          locationId: locationId || null,
          date,
          startTime: time,
          name,
          phone,
          email,
          notes,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Booking failed')
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  function reset() {
    setStep(1); setSvcs([]); setStaffId(''); setDate(''); setTime('')
    setName(''); setPhone(''); setEmail(''); setNotes(''); setDone(false); setError('')
    if (multiLocation) setLocId('')
  }

  // ── Confirmation screen ──────────────────────────────────────────────────────
  if (done) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
        <Check className="h-8 w-8 text-teal-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Received!</h2>
      <p className="text-gray-500 text-sm mb-1">Thanks, {name}! We'll confirm your appointment shortly.</p>
      <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2">
        {selectedLoc && (
          <div className="flex gap-2 text-gray-600"><MapPin className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />{selectedLoc.name}</div>
        )}
        <div className="flex gap-2 text-gray-600"><Calendar className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />{date}</div>
        <div className="flex gap-2 text-gray-600"><Clock className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />{fmt12(time)}</div>
        <div className="flex gap-2 text-gray-600"><Check className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />{picked.map(s => s.name).join(', ')}</div>
      </div>
      <button onClick={reset} className="mt-6 px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        Book Another
      </button>
    </div>
  )

  return (
    <div className="space-y-4">

      {/* ── Step indicator ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0">
        {STEP_LABELS.map((label, i) => {
          const n    = i + 1
          const done = step > n
          const curr = step === n
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => done ? setStep(n) : undefined}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                  curr ? 'bg-teal-600 text-white'
                       : done ? 'text-teal-600 cursor-pointer hover:bg-teal-50'
                              : 'text-gray-400 cursor-default'
                )}
              >
                <span className={cn(
                  'h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  curr ? 'bg-white/20' : done ? 'bg-teal-100' : 'bg-gray-100'
                )}>
                  {done ? <Check className="h-3 w-3" /> : n}
                </span>
                {label}
              </button>
              {i < STEP_LABELS.length - 1 && (
                <div className={cn('flex-1 h-px mx-1', step > n ? 'bg-teal-300' : 'bg-gray-200')} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Card ─────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Step: Branch selection */}
        {step === BRANCH_STEP && (
          <div className="p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-900">Which branch would you like to visit?</p>
            <div className="space-y-2">
              {locations.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => setLocId(loc.id)}
                  className={cn(
                    'flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-all',
                    locationId === loc.id
                      ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                    locationId === loc.id ? 'bg-teal-600' : 'bg-gray-100')}>
                    <MapPin className={cn('h-4 w-4', locationId === loc.id ? 'text-white' : 'text-gray-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{loc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{loc.address}</p>
                    {loc.phone && <p className="text-xs text-gray-400">{loc.phone}</p>}
                  </div>
                  {locationId === loc.id && <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Services */}
        {step === SERVICE_STEP && (
          <div>
            {selectedLoc && (
              <div className="flex items-center gap-2 px-5 py-3 bg-teal-50 border-b border-teal-100">
                <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
                <span className="text-sm text-teal-800 font-medium">{selectedLoc.name}</span>
              </div>
            )}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">Select all the services you want — we'll bundle them into one appointment.</p>
            </div>
            {categories.map(cat => (
              <div key={cat}>
                <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{cat}</p>
                </div>
                {services.filter(s => s.category === cat).map(svc => {
                  const sel = selectedSvcs.includes(svc.id)
                  return (
                    <div
                      key={svc.id}
                      onClick={() => toggleSvc(svc.id)}
                      className={cn(
                        'flex items-center gap-4 px-5 py-4 cursor-pointer border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-b-0',
                        sel && 'bg-teal-50 hover:bg-teal-50'
                      )}
                    >
                      <div className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                        sel ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                      )}>
                        {sel && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{svc.name}</p>
                        {svc.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{svc.description}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(svc.price)}</p>
                        <p className="text-xs text-gray-400">{svc.duration} min</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}

            {/* Running total */}
            {picked.length > 0 && (
              <div className="px-5 py-3 bg-teal-600 flex items-center justify-between">
                <p className="text-xs text-teal-100">{picked.length} service{picked.length !== 1 ? 's' : ''} · {duration} min</p>
                <p className="text-sm font-bold text-white">{formatCurrency(total)}</p>
              </div>
            )}
          </div>
        )}

        {/* Step: Date & Time */}
        {step === WHEN_STEP && (
          <div className="p-5 space-y-6">

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <Calendar className="h-4 w-4 inline mr-1.5 text-teal-600" />
                When would you like to come in?
              </label>
              <input
                type="date"
                min={getMinDate()}
                value={date}
                onChange={e => { setDate(e.target.value); setTime('') }}
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Time grid */}
            {date && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  <Clock className="h-4 w-4 inline mr-1.5 text-teal-600" />
                  Pick a time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t)}
                      className={cn(
                        'py-2.5 rounded-xl text-xs font-medium border transition-all',
                        time === t
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-teal-400 hover:text-teal-700'
                      )}
                    >
                      {fmt12(t)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Staff */}
            {date && time && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Choose your stylist</label>
                <div className="space-y-2">
                  <div
                    onClick={() => setStaffId('any')}
                    className={cn(
                      'flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition-all',
                      staffId === 'any'
                        ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
                      staffId === 'any' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500')}>
                      ✦
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Any Available Stylist</p>
                      <p className="text-xs text-gray-400">We'll assign the best match</p>
                    </div>
                    {staffId === 'any' && <Check className="h-5 w-5 text-teal-600 ml-auto" />}
                  </div>

                  {staffForLoc.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setStaffId(m.id)}
                      className={cn(
                        'flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition-all',
                        staffId === m.id
                          ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className={cn(
                        'h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
                        staffId === m.id ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
                      )}>
                        {m.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-400">{m.role}</p>
                      </div>
                      {staffId === m.id && <Check className="h-5 w-5 text-teal-600 ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary strip */}
            {picked.length > 0 && date && time && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                <p className="font-medium text-gray-900">{picked.map(s => s.name).join(' + ')}</p>
                <p className="text-gray-500">{date} · {fmt12(time)} · {duration} min</p>
                <p className="font-semibold text-teal-700">{formatCurrency(total)}</p>
              </div>
            )}
          </div>
        )}

        {/* Step: Details */}
        {step === DETAIL_STEP && (
          <form id="public-booking-form" onSubmit={handleSubmit} className="p-5 space-y-4">

            {/* Booking summary */}
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-1.5 text-sm">
              {selectedLoc && (
                <div className="flex items-center gap-2 text-teal-800">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">{selectedLoc.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-teal-800">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{date} at {fmt12(time)}</span>
              </div>
              <div className="flex items-center gap-2 text-teal-800">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span>{picked.map(s => s.name).join(', ')} · {formatCurrency(total)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
              <input
                required value={name} onChange={e => setName(e.target.value)}
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number *</label>
              <input
                required value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="+233 24 000 0000"
                type="tel"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Any preferences, allergies or special requests…"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </form>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 h-12 px-5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canAdvance()}
            className="flex-1 flex items-center justify-center gap-2 h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            form="public-booking-form"
            type="submit"
            disabled={loading || !name || !phone}
            className="flex-1 flex items-center justify-center gap-2 h-12 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Booking…</>
              : <><Check className="h-4 w-4" /> Confirm Booking</>
            }
          </button>
        )}
      </div>
    </div>
  )
}
