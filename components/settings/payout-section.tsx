'use client'
import { useState, useEffect } from 'react'
import { Smartphone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { getSalonSettings } from '@/lib/actions/settings'
import { savePayoutSettings } from '@/lib/actions/settings'

const NETWORKS = [
  { value: 'mtn',        label: 'MTN MoMo' },
  { value: 'vodafone',   label: 'Vodafone Cash' },
  { value: 'airteltigo', label: 'AirtelTigo Money' },
]

export function PayoutSection() {
  const [momoNumber, setMomoNumber]   = useState('')
  const [network, setNetwork]         = useState('mtn')
  const [ownerName, setOwnerName]     = useState('')
  const [existingCode, setExisting]   = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)
  const [result, setResult]           = useState<{ ok: boolean; msg: string } | null>(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    getSalonSettings().then(s => {
      if (s.payoutMomoNumber) setMomoNumber(s.payoutMomoNumber)
      if (s.payoutNetwork)    setNetwork(s.payoutNetwork)
      if (s.paystackRecipientCode) setExisting(s.paystackRecipientCode)
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!momoNumber.trim() || !ownerName.trim()) return
    setSaving(true)
    setResult(null)
    const res = await savePayoutSettings({ momoNumber: momoNumber.trim(), network, ownerName: ownerName.trim() })
    if (res.success) {
      setExisting('saved')
      setResult({ ok: true, msg: 'MoMo payout account connected! Deposits will be transferred automatically.' })
    } else {
      setResult({ ok: false, msg: res.error ?? 'Failed to connect account. Please check your number and try again.' })
    }
    setSaving(false)
  }

  if (loading) return <div className="h-24 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>

  return (
    <div className="space-y-4">
      {existingCode && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          MoMo payout account connected — deposits go directly to your phone.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="form-label">Account Name (as registered with your network)</label>
          <input
            className="form-input"
            placeholder="e.g. Abena Mensah"
            value={ownerName}
            onChange={e => setOwnerName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="form-label">Mobile Network</label>
          <select
            className="form-input"
            value={network}
            onChange={e => setNetwork(e.target.value)}
          >
            {NETWORKS.map(n => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">MoMo Number</label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="form-input pl-9"
              placeholder="e.g. 0244123456"
              value={momoNumber}
              onChange={e => setMomoNumber(e.target.value)}
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">Deposits from client bookings will be sent to this number automatically.</p>
        </div>

        {result && (
          <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm border ${result.ok
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
            {result.ok
              ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
            {result.msg}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting…</> : existingCode ? 'Update MoMo Account' : 'Connect MoMo Account'}
        </button>
      </form>
    </div>
  )
}
