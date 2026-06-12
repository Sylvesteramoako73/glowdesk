import { NextResponse } from 'next/server'

export function GET() {
  const appId = process.env.FACEBOOK_APP_ID
  if (!appId) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL ?? 'https://app.glowdeskapp.online'}/marketing?tab=accounts&error=no_app_id`
    )
  }

  const base        = process.env.NEXTAUTH_URL ?? 'https://app.glowdeskapp.online'
  const callbackUrl = `${base}/api/social/callback/facebook`
  const scope       = 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish'
  const url         = `https://www.facebook.com/v19.0/dialog/oauth`
    + `?client_id=${appId}`
    + `&redirect_uri=${encodeURIComponent(callbackUrl)}`
    + `&scope=${scope}`
    + `&response_type=code`

  return NextResponse.redirect(url)
}
