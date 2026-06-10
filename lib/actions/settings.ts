'use server'
import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { getTenantId } from '@/lib/auth'
import { DEFAULT_WORKING_HOURS } from '@/lib/types'
import type { SalonSettings } from '@/lib/types'
export type { DayHours, WorkingHours, SalonSettings } from '@/lib/types'
export { DEFAULT_WORKING_HOURS } from '@/lib/types'

const DEFAULTS = {
  salonName:    '',
  tagline:      '',
  phone:        '',
  address:      '',
  email:        '',
  depositPct:   30,
  workingHours: DEFAULT_WORKING_HOURS,
}

export async function getSalonSettings(): Promise<SalonSettings> {
  const tenantId = await getTenantId()
  if (!tenantId) return DEFAULTS
  const doc = await adminDb.collection('settings').doc(tenantId).get()
  return { ...DEFAULTS, ...(doc.data() ?? {}) }
}

export async function updateSalonSettings(data: Partial<SalonSettings>): Promise<void> {
  const tenantId = await getTenantId()
  if (!tenantId) return
  await adminDb.collection('settings').doc(tenantId).set(data, { merge: true })
  revalidatePath('/settings')
}
