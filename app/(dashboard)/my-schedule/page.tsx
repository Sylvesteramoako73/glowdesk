import { requireRole } from '@/lib/auth'
import { ScheduleView } from './view'

export default async function MySchedulePage() {
  await requireRole('owner', 'manager', 'staff')
  return <ScheduleView />
}
