'use server'
import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { getTenantId } from '@/lib/auth'
import { DEFAULT_WORKING_HOURS } from '@/lib/types'
import type { SalonSettings } from '@/lib/types'
export type { DayHours, WorkingHours, SalonSettings, MomoNetwork } from '@/lib/types'

const DEFAULTS = {
  salonName:      '',
  tagline:        '',
  phone:          '',
  whatsappNumber: '',
  address:        '',
  email:          '',
  depositPct:     30,
  workingHours:   DEFAULT_WORKING_HOURS,
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

export async function savePayoutSettings(data: {
  momoNumber: string
  network: string
  ownerName: string
}): Promise<{ success: boolean; error?: string }> {
  const tenantId = await getTenantId()
  if (!tenantId) return { success: false, error: 'Not authenticated' }

  const { createTransferRecipient } = await import('@/lib/services/paystack')
  const result = await createTransferRecipient({
    name:        data.ownerName,
    momoNumber:  data.momoNumber,
    network:     data.network,
  })

  if (!result.success) return { success: false, error: result.error }

  await adminDb.collection('settings').doc(tenantId).set({
    payoutMomoNumber:      data.momoNumber,
    payoutNetwork:         data.network,
    paystackRecipientCode: result.recipientCode,
  }, { merge: true })

  revalidatePath('/settings')
  return { success: true }
}
