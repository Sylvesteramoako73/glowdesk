import { type NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getSessionUser } from '@/lib/auth'

const BASE = process.env.NEXTAUTH_URL ?? 'https://app.glowdeskapp.online'
const redir = (path: string) => NextResponse.redirect(`${BASE}${path}`)

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) return redir('/marketing?tab=accounts&error=access_denied')

  const appId     = process.env.FACEBOOK_APP_ID!
  const appSecret = process.env.FACEBOOK_APP_SECRET!
  const callbackUrl = `${BASE}/api/social/callback/facebook`

  // Exchange code for short-lived user token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token`
    + `?client_id=${appId}`
    + `&redirect_uri=${encodeURIComponent(callbackUrl)}`
    + `&client_secret=${appSecret}`
    + `&code=${code}`
  )
  const tokenData = await tokenRes.json()
  if (tokenData.error) return redir('/marketing?tab=accounts&error=token_exchange')

  // Exchange for long-lived token (60 day expiry)
  const longRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token`
    + `?grant_type=fb_exchange_token`
    + `&client_id=${appId}`
    + `&client_secret=${appSecret}`
    + `&fb_exchange_token=${tokenData.access_token}`
  )
  const longData = await longRes.json()
  const userToken = longData.access_token ?? tokenData.access_token

  // Get the salon's Facebook Pages
  const pagesRes  = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}`)
  const pagesData = await pagesRes.json()

  if (!pagesData.data?.length) return redir('/marketing?tab=accounts&error=no_pages')

  // Use the first page (salon owners typically have one)
  const page = pagesData.data[0]

  // Check for linked Instagram Business account
  let instagramId:       string | null = null
  let instagramUsername: string | null = null
  try {
    const igPageRes  = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
    )
    const igPageData = await igPageRes.json()
    if (igPageData.instagram_business_account?.id) {
      instagramId = igPageData.instagram_business_account.id
      const igUserRes  = await fetch(
        `https://graph.facebook.com/v19.0/${instagramId}?fields=username&access_token=${page.access_token}`
      )
      const igUserData = await igUserRes.json()
      instagramUsername = igUserData.username ?? null
    }
  } catch {}

  // Get tenantId from session cookie
  const user = await getSessionUser()
  if (!user?.tenantId) return redir('/marketing?tab=accounts&error=not_authenticated')

  // Store connection in Firestore
  await adminDb.collection('social_connections').doc(user.tenantId).set({
    facebook: {
      pageId:            page.id,
      pageName:          page.name,
      pageAccessToken:   page.access_token,
      instagramId,
      instagramUsername,
      connectedAt:       new Date().toISOString(),
    },
  }, { merge: true })

  return redir('/marketing?tab=accounts&connected=facebook')
}
