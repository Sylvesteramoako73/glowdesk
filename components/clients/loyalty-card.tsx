'use client'
import { useState, useTransition } from 'react'
import { Star, Gift, Plus, Minus, ChevronRight, X, Check } from 'lucide-react'
import { adjustLoyaltyPoints, getLoyaltyLog } from '@/lib/actions/clients'
import { cn } from '@/lib/utils'

const TIERS = [
  { name: 'Bronze',   min: 0,   max: 99,  color: 'text-orange-600',  bg: 'bg-orange-50  dark:bg-orange-950/40',  bar: 'bg-orange-400' },
  { name: 'Silver',   min: 100, max: 249, color: 'text-gray-600',    bg: 'bg-gray-100   dark:bg-gray-800',        bar: 'bg-gray-400' },
  { name: 'Gold',     min: 250, max: 499, color: 'text-yellow-600',  bg: 'bg-yellow-50  dark:bg-yellow-950/40',  bar: 'bg-yellow-400' },
  { name: 'Platinum', min: 500, max: Infinity, color: 'text-teal-600', bg: 'bg-teal-50  dark:bg-teal-950/40',    bar: 'bg-teal-500' },
]

const REASON_LABELS: Record<string, string> = {
  appointment: 'Appointment',
  manual_add:  'Manual add',
  redemption:  'Redeemed',
  bonus:       'Bonus',
}

type LogEntry = { id: string; delta: number; balanceAfter: number; reason: string; note: string | null; createdAt: string }

interface Props {
  clientId: string
  initialPoints: number
  initialTier: string
}

export function LoyaltyCard({ clientId, initialPoints, initialTier }: Props) {
  const [points, setPoints]     = useState(initialPoints)
  const [tier, setTier]         = useState(initialTier)
  const [modal, setModal]       = useState<'add' | 'redeem' | 'log' | null>(null)
  const [amount, setAmount]     = useState('')
  const [note, setNote]         = useState('')
  const [log, setLog]           = useState<LogEntry[]>([])
  const [logLoading, setLogLoading] = useState(false)
  const [, startTransition]     = useTransition()

  const currentTier = TIERS.find(t => t.name === tier) ?? TIERS[0]
  const nextTier    = TIERS[TIERS.findIndex(t => t.name === tier) + 1] ?? null
  const progress    = nextTier
    ? Math.min(100, Math.round(((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100))
    : 100

  function openLog() {
    setModal('log')
    if (log.length === 0) {
      setLogLoading(true)
      getLoyaltyLog(clientId).then(data => { setLog(data); setLogLoading(false) })
    }
  }

  function recalcTier(pts: number) {
    if (pts >= 500) return 'Platinum'
    if (pts >= 250) return 'Gold'
    if (pts >= 100) return 'Silver'
    return 'Bronze'
  }

  function submit(type: 'add' | 'redeem') {
    const n = parseInt(amount)
    if (!n || n <= 0) return
    const delta = type === 'add' ? n : -n
    startTransition(async () => {
      await adjustLoyaltyPoints(clientId, delta, type === 'add' ? 'manual_add' : 'redemption', note || undefined)
      const newPts = Math.max(0, points + delta)
      setPoints(newPts)
      setTier(recalcTier(newPts))
      setLog([])  // reset so it reloads on next open
      setModal(null)
      setAmount('')
      setNote('')
    })
  }

  return (
    <>
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" /> Loyalty Points
          </h3>
          <button onClick={openLog} className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5">
            History <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Points + tier */}
        <div className={cn('rounded-xl px-4 py-3 flex items-center justify-between', currentTier.bg)}>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{points.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">points</p>
          </div>
          <div className="text-right">
            <span className={cn('text-sm font-semibold', currentTier.color)}>{tier}</span>
            {nextTier && (
              <p className="text-[10px] text-gray-400 mt-0.5">{nextTier.min - points} to {nextTier.name}</p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {nextTier && (
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>{currentTier.name} ({currentTier.min})</span>
              <span>{nextTier.name} ({nextTier.min})</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', currentTier.bar)} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {!nextTier && (
          <p className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1 font-medium">
            <Gift className="h-3.5 w-3.5" /> Top tier achieved!
          </p>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setModal('add')}
            className="flex items-center justify-center gap-1.5 h-8 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Points
          </button>
          <button
            onClick={() => setModal('redeem')}
            disabled={points === 0}
            className="flex items-center justify-center gap-1.5 h-8 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium transition-colors disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" /> Redeem
          </button>
        </div>
      </div>

      {/* Add / Redeem modal */}
      {(modal === 'add' || modal === 'redeem') && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {modal === 'add' ? 'Add Loyalty Points' : 'Redeem Points'}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="form-label">Points</label>
                <input
                  type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 50"
                  className="form-input w-full"
                  autoFocus
                />
                {modal === 'redeem' && (
                  <p className="text-xs text-gray-400 mt-1">Available: {points} pts</p>
                )}
              </div>
              <div>
                <label className="form-label">Note (optional)</label>
                <input
                  type="text" value={note} onChange={e => setNote(e.target.value)}
                  placeholder={modal === 'add' ? 'e.g. Birthday bonus' : 'e.g. Discount redemption'}
                  className="form-input w-full"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                <button
                  onClick={() => submit(modal)}
                  disabled={!amount || parseInt(amount) <= 0 || (modal === 'redeem' && parseInt(amount) > points)}
                  className="btn-primary flex-1 justify-center text-sm"
                >
                  <Check className="h-4 w-4" /> Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {modal === 'log' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Points History</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {logLoading ? (
                <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
              ) : log.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">No history yet.</div>
              ) : log.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    entry.delta > 0 ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                  )}>
                    {entry.delta > 0 ? '+' : '−'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {entry.delta > 0 ? `+${entry.delta}` : entry.delta} pts
                      <span className="ml-1 font-normal text-gray-400">→ {entry.balanceAfter}</span>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {REASON_LABELS[entry.reason] ?? entry.reason}
                      {entry.note && ` · ${entry.note}`}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(entry.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
