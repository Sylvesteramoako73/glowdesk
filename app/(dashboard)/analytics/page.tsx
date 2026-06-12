import { requireRole, getEffectiveLocationId } from '@/lib/auth'
import { getAnalyticsData } from '@/lib/actions/analytics'
import { getSalonSettings } from '@/lib/actions/settings'
import { AnalyticsView } from './view'

export default async function AnalyticsPage() {
  await requireRole('owner', 'manager')
  const [activeLocationId, settings] = await Promise.all([
    getEffectiveLocationId(),
    getSalonSettings(),
  ])
  const data = await getAnalyticsData('week', activeLocationId)
  return <AnalyticsView initialData={data} salonName={settings.salonName || 'Your Salon'} />
}

