import Link from 'next/link'
import { CheckCircle2, Circle, Rocket } from 'lucide-react'
import { adminDb } from '@/lib/firebase-admin'
import { getTenantId } from '@/lib/auth'

async function getOnboardingStatus() {
  const tenantId = await getTenantId()
  if (!tenantId) return null

  const [servicesSnap, staffSnap, settings] = await Promise.all([
    adminDb.collection('services').where('tenantId', '==', tenantId).limit(1).get(),
    adminDb.collection('staff').where('tenantId', '==', tenantId).limit(1).get(),
    adminDb.collection('settings').doc(tenantId).get(),
  ])

  const s = settings.data()
  return {
    hasService:      !servicesSnap.empty,
    hasStaff:        !staffSnap.empty,
    hasWorkingHours: !!(s?.workingHours),
    hasPhone:        !!(s?.phone),
  }
}

const STEPS = [
  {
    key: 'hasService' as const,
    label: 'Add your first service',
    desc:  'Hair, nails, facials — add what you offer',
    href:  '/services',
    cta:   'Add service',
  },
  {
    key: 'hasStaff' as const,
    label: 'Add a staff member',
    desc:  'Invite your team so they can take bookings',
    href:  '/staff',
    cta:   'Add staff',
  },
  {
    key: 'hasWorkingHours' as const,
    label: 'Set your working hours',
    desc:  'Tell clients when you\'re open',
    href:  '/settings',
    cta:   'Configure hours',
  },
  {
    key: 'hasPhone' as const,
    label: 'Add your contact details',
    desc:  'Phone & address shown on your booking page',
    href:  '/settings',
    cta:   'Update settings',
  },
]

export async function OnboardingChecklist() {
  const status = await getOnboardingStatus()
  if (!status) return null

  const done  = STEPS.filter(s => status[s.key]).length
  const total = STEPS.length

  if (done === total) return null // hide once complete

  return (
    <div className="card p-5 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Rocket className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Get started</h3>
            <p className="text-xs text-gray-500 mt-0.5">{done} of {total} steps complete</p>
          </div>
        </div>
        <div className="text-xs font-medium text-blue-600">{Math.round((done / total) * 100)}%</div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>

      <div className="space-y-2.5">
        {STEPS.map(step => {
          const complete = status[step.key]
          return (
            <div key={step.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {complete
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <Circle className="h-4 w-4 text-gray-300 shrink-0" />}
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${complete ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {step.label}
                  </p>
                  {!complete && <p className="text-xs text-gray-500 truncate">{step.desc}</p>}
                </div>
              </div>
              {!complete && (
                <Link
                  href={step.href}
                  className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap"
                >
                  {step.cta} →
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
