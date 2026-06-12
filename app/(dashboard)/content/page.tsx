import { getMarketingPosts } from '@/lib/actions/marketing'
import { getSalonSettings } from '@/lib/actions/settings'
import { getServices } from '@/lib/actions/services'
import { getSocialConnections } from '@/lib/actions/social'
import { MarketingView } from './view'

export default async function MarketingPage() {
  const [posts, settings, services, socialConnections] = await Promise.all([
    getMarketingPosts().catch(() => []),
    getSalonSettings().catch(() => ({ salonName: '', address: '' } as any)),
    getServices().catch(() => []),
    getSocialConnections().catch(() => ({})),
  ])

  const serviceCategories = [...new Set(services.map(s => s.category))].filter(Boolean)

  return (
    <MarketingView
      initialPosts={posts}
      salonName={settings.salonName || 'Your Salon'}
      address={settings.address || 'Ghana'}
      serviceCategories={serviceCategories}
      hasApiKey={!!process.env.ANTHROPIC_API_KEY}
      hasFbAppId={!!process.env.FACEBOOK_APP_ID}
      socialConnections={socialConnections}
    />
  )
}

export const revalidate = 60
