'use server'
import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { getTenantId } from '@/lib/auth'
import { FieldValue } from 'firebase-admin/firestore'

export type FacebookConnection = {
  pageId:           string
  pageName:         string
  pageAccessToken:  string
  instagramId?:     string | null
  instagramUsername?: string | null
  connectedAt:      string
}

export type SocialConnections = {
  facebook?: FacebookConnection
}

export async function getSocialConnections(): Promise<SocialConnections> {
  const tenantId = await getTenantId()
  if (!tenantId) return {}
  const doc = await adminDb.collection('social_connections').doc(tenantId).get()
  return (doc.data() ?? {}) as SocialConnections
}

export async function disconnectSocialAccount(platform: 'facebook'): Promise<void> {
  const tenantId = await getTenantId()
  if (!tenantId) return
  await adminDb.collection('social_connections').doc(tenantId).update({
    [platform]: FieldValue.delete(),
  })
  revalidatePath('/marketing')
}

export async function publishToFacebook(
  caption: string,
  hashtags: string[]
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  const tenantId = await getTenantId()
  if (!tenantId) return { success: false, error: 'Not authenticated' }

  const doc  = await adminDb.collection('social_connections').doc(tenantId).get()
  const conn = doc.data()?.facebook as FacebookConnection | undefined

  if (!conn) return { success: false, error: 'Facebook not connected' }

  const message = `${caption}\n\n${hashtags.map(h => '#' + h.replace(/^#/, '')).join(' ')}`

  try {
    const res  = await fetch(`https://graph.facebook.com/v19.0/${conn.pageId}/feed`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message, access_token: conn.pageAccessToken }),
    })
    const data = await res.json()
    if (!res.ok || data.error) {
      return { success: false, error: data.error?.message ?? 'Failed to post to Facebook' }
    }
    const postUrl = `https://www.facebook.com/${data.id?.replace('_', '/posts/')}`
    return { success: true, postUrl }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function publishToInstagram(
  caption: string,
  hashtags: string[],
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  const tenantId = await getTenantId()
  if (!tenantId) return { success: false, error: 'Not authenticated' }

  const doc  = await adminDb.collection('social_connections').doc(tenantId).get()
  const conn = doc.data()?.facebook as FacebookConnection | undefined

  if (!conn?.instagramId) return { success: false, error: 'Instagram not connected' }

  const fullCaption = `${caption}\n\n${hashtags.map(h => '#' + h.replace(/^#/, '')).join(' ')}`

  try {
    // Step 1: create container
    const containerRes = await fetch(`https://graph.facebook.com/v19.0/${conn.instagramId}/media`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ image_url: imageUrl, caption: fullCaption, access_token: conn.pageAccessToken }),
    })
    const container = await containerRes.json()
    if (!containerRes.ok || container.error) {
      return { success: false, error: container.error?.message ?? 'Failed to create Instagram media' }
    }

    // Step 2: publish container
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${conn.instagramId}/media_publish`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ creation_id: container.id, access_token: conn.pageAccessToken }),
    })
    const published = await publishRes.json()
    if (!publishRes.ok || published.error) {
      return { success: false, error: published.error?.message ?? 'Failed to publish to Instagram' }
    }

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
