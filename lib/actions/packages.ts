'use server'
import { revalidatePath } from 'next/cache'
import { adminDb, docData } from '@/lib/firebase-admin'
import { getTenantId } from '@/lib/auth'

export type PackageItem = {
  serviceId: string
  serviceName: string
  duration: number
  originalPrice: number
}

export type ServicePackage = {
  id: string
  tenantId: string
  name: string
  description: string
  items: PackageItem[]
  totalDuration: number
  originalTotal: number
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function getPackages(): Promise<ServicePackage[]> {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const snap = await adminDb.collection('packages')
    .where('tenantId', '==', tenantId)
    .get()
  return snap.docs
    .map(d => docData(d) as ServicePackage)
    .filter(p => p.isActive !== false)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getPublicPackages(tenantId: string): Promise<ServicePackage[]> {
  const snap = await adminDb.collection('packages')
    .where('tenantId', '==', tenantId)
    .where('isActive', '==', true)
    .get()
  return snap.docs
    .map(d => docData(d) as ServicePackage)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function createPackage(data: {
  name: string
  description: string
  items: PackageItem[]
  price: number
}): Promise<ServicePackage> {
  const tenantId = await getTenantId()
  if (!tenantId) throw new Error('Unauthorized')
  const now = new Date().toISOString()
  const ref = adminDb.collection('packages').doc()
  const doc: Omit<ServicePackage, 'id'> = {
    tenantId,
    name: data.name,
    description: data.description,
    items: data.items,
    totalDuration: data.items.reduce((s, i) => s + i.duration, 0),
    originalTotal: data.items.reduce((s, i) => s + i.originalPrice, 0),
    price: data.price,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }
  await ref.set(doc)
  revalidatePath('/services')
  return { id: ref.id, ...doc }
}

export async function updatePackage(id: string, data: Partial<{
  name: string; description: string; items: PackageItem[]; price: number; isActive: boolean
}>): Promise<void> {
  const updates: Record<string, unknown> = { ...data, updatedAt: new Date().toISOString() }
  if (data.items) {
    updates.totalDuration = data.items.reduce((s, i) => s + i.duration, 0)
    updates.originalTotal = data.items.reduce((s, i) => s + i.originalPrice, 0)
  }
  await adminDb.collection('packages').doc(id).update(updates)
  revalidatePath('/services')
}

export async function deletePackage(id: string): Promise<void> {
  await adminDb.collection('packages').doc(id).update({ isActive: false, updatedAt: new Date().toISOString() })
  revalidatePath('/services')
}
