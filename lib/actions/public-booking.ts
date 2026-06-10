'use server'
import { adminDb, docData } from '@/lib/firebase-admin'
import type { Service, Staff, SalonSettings } from '@/lib/types'
import type { Location } from '@/lib/actions/locations'

export type PublicSalonData = {
  tenantId: string
  salonName: string
  settings: SalonSettings
  services: Service[]
  staff: Staff[]
  locations: Location[]
}

export async function getPublicSalonData(slug: string): Promise<PublicSalonData | null> {
  const tenantSnap = await adminDb.collection('tenants')
    .where('slug', '==', slug).limit(1).get()
  if (tenantSnap.empty) return null

  const tenantDoc  = tenantSnap.docs[0]
  const tenantId   = tenantDoc.id
  const tenantData = tenantDoc.data()

  const [servicesSnap, staffSnap, settingsDoc, locationsSnap] = await Promise.all([
    adminDb.collection('services').where('tenantId', '==', tenantId).get(),
    adminDb.collection('staff').where('tenantId', '==', tenantId).where('isActive', '==', true).get(),
    adminDb.collection('settings').doc(tenantId).get(),
    adminDb.collection('locations').where('tenantId', '==', tenantId).get(),
  ])

  const services = servicesSnap.docs
    .map(d => docData(d) as Service)
    .filter(s => s.isActive)
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))

  const staff = staffSnap.docs
    .map(d => docData(d) as Staff)
    .sort((a, b) => a.name.localeCompare(b.name))

  const settings  = (settingsDoc.data() ?? {}) as SalonSettings
  const salonName = settings.salonName || tenantData.name || 'Salon'

  const locations = locationsSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as Location))
    .filter(l => l.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))

  return { tenantId, salonName, settings, services, staff, locations }
}
