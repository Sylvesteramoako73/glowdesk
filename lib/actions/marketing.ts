'use server'
import { revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import { getTenantId } from '@/lib/auth'
import { getSalonSettings } from './settings'
import { getServices } from './services'

export type PostIdea = {
  platform: 'instagram' | 'facebook' | 'whatsapp'
  category: string
  title: string
  caption: string
  hashtags: string[]
  bestTime: string
  emoji: string
}

export type MarketingPost = PostIdea & {
  id: string
  tenantId: string
  scheduledDate?: string
  scheduledTime?: string
  status: 'draft' | 'scheduled' | 'posted'
  createdAt: string
}

export async function generateContentIdeas(count = 6): Promise<PostIdea[]> {
  const [settings, services] = await Promise.all([
    getSalonSettings(),
    getServices(),
  ])

  const salonName = settings.salonName || 'our salon'
  const address   = settings.address   || 'Ghana'

  const byCategory: Record<string, string[]> = {}
  services.forEach(s => {
    if (!byCategory[s.category]) byCategory[s.category] = []
    byCategory[s.category].push(s.name)
  })
  const servicesList = Object.entries(byCategory)
    .map(([cat, names]) => `${cat}: ${names.slice(0, 5).join(', ')}`)
    .join('\n') || 'General beauty services'

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return getMockIdeas(salonName, Object.keys(byCategory))

  const ANGLES = [
    'client retention and loyalty rewards',
    'seasonal promotions and Ghana holiday tie-ins',
    'educational beauty tips and how-to content',
    'before-and-after transformation posts',
    'behind-the-scenes and team spotlight content',
    'engagement questions and polls to boost comments',
    'referral and word-of-mouth campaigns',
    'weekend and walk-in special offers',
    'testimonials and client appreciation posts',
    'new service launches and product features',
  ]
  // Pick 2 random angles to force variety each call
  const shuffled = [...ANGLES].sort(() => Math.random() - 0.5)
  const focusAngles = shuffled.slice(0, 2).join(' and ')
  const seed = Math.floor(Math.random() * 9000) + 1000

  const prompt = `You are a social media marketing expert for beauty salons in West Africa (Ghana).

Salon: "${salonName}" located in ${address}
Services:
${servicesList}

Variation seed: ${seed}
This batch should especially focus on: ${focusAngles}

Generate ${count} diverse, creative social media post ideas for this salon. Every regeneration must produce COMPLETELY DIFFERENT ideas — different topics, different captions, different angles, different platforms. Never repeat the same concept twice.

Return ONLY a valid JSON array (no markdown, no code fences, no extra text). Each object must have exactly these fields:
- "platform": one of "instagram", "facebook", "whatsapp"
- "category": service focus (e.g. "hair", "nails", "skincare", "spa", "promotion", "engagement", "tips")
- "title": 4-6 word title
- "caption": 2-4 warm and professional sentences with 2-3 emojis. NO hashtags in the caption.
- "hashtags": array of 6-10 hashtags. Include Ghana-specific ones like #GhanaBeauty #AccraSalon #GhanaHair
- "bestTime": posting time suggestion (e.g. "7pm–9pm weekdays")
- "emoji": one representative emoji

Vary platforms across the 6 posts. Tailor everything to the actual services listed.`

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client    = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model:       'claude-haiku-4-5-20251001',
      max_tokens:  2048,
      temperature: 1.0,
      messages:    [{ role: 'user', content: prompt }],
    })
    const text  = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const clean = text.replace(/```(?:json)?\n?|\n?```/g, '').trim()
    const ideas = JSON.parse(clean) as PostIdea[]
    return Array.isArray(ideas) ? ideas.slice(0, count) : getMockIdeas(salonName, Object.keys(byCategory))
  } catch (e) {
    console.error('[marketing] AI generation failed:', e)
    return getMockIdeas(salonName, Object.keys(byCategory))
  }
}

function getMockIdeas(salonName: string, cats: string[]): PostIdea[] {
  const hasHair  = cats.some(c => /hair|braid|wig|weave/i.test(c))
  const hasNails = cats.some(c => /nail/i.test(c))
  const hasSkin  = cats.some(c => /skin|facial|spa/i.test(c))

  return [
    {
      platform: 'instagram', category: hasHair ? 'hair' : 'promotion',
      title: 'Your Crown Deserves the Best',
      caption: `At ${salonName}, we pour love into every appointment 👑 Whether you're refreshing your look or trying something totally new, our team is ready to make you shine. Book your slot this week!`,
      hashtags: ['#GhanaHair', '#AccraBeauty', '#HairGoals', '#SalonLife', '#BeautyGhana', '#GlowUp'],
      bestTime: '7pm–9pm weekdays', emoji: '💇‍♀️',
    },
    {
      platform: 'facebook', category: 'promotion',
      title: 'Weekend Pamper Special',
      caption: `✨ Treat yourself this weekend! First-time clients get 10% off their first visit at ${salonName}. Tag someone who deserves a pamper session and make it a girls' day! 🎉`,
      hashtags: ['#WeekendVibes', '#GhanaBeauty', '#AccraSalon', '#PamperTime', '#BeautyDeals'],
      bestTime: 'Friday 6pm–9pm', emoji: '✨',
    },
    {
      platform: 'whatsapp', category: 'engagement',
      title: 'What\'s Your Beauty Goal?',
      caption: `Hey beautiful! 💕 What's your #1 beauty goal this month? Reply and let us create the perfect treatment plan just for you. We're here to make it happen!`,
      hashtags: ['#BeautyGoals', '#GlowUp', '#GhanaBeauty', '#ClientFirst'],
      bestTime: '12pm–2pm weekdays', emoji: '💬',
    },
    {
      platform: 'instagram', category: hasSkin ? 'skincare' : 'tips',
      title: 'Skincare Tip of the Week',
      caption: `Did you know Ghana's humid climate needs a special skincare routine? 🌿 Always use SPF, even on cloudy days. Our skin specialists are available for personalised consultations at ${salonName}!`,
      hashtags: ['#GhanaSkincare', '#SkincareRoutine', '#SPFEveryDay', '#AccraBeauty', '#GlowingSkin', '#BlackSkinCare'],
      bestTime: '8am–10am weekdays', emoji: '🌿',
    },
    {
      platform: 'facebook', category: hasNails ? 'nails' : 'engagement',
      title: 'Nail Art Inspo Drop',
      caption: `New season, new nails! 💅 Our nail artists are taking bookings for the most stunning designs in town. Which style would you choose — classic French or bold abstract? Drop your answer below!`,
      hashtags: ['#GhanaNails', '#NailArt', '#NailInspo', '#AccraNails', '#NailGoals', '#GelNails'],
      bestTime: '6pm–8pm Fridays', emoji: '💅',
    },
    {
      platform: 'whatsapp', category: 'promotion',
      title: 'Refer a Friend Offer',
      caption: `🎁 Spread the love! Refer a friend to ${salonName} and BOTH of you get 15% off your next service. Just mention this message when you book. Limited time only!`,
      hashtags: ['#ReferAFriend', '#GhanaBeauty', '#SalonDeals', '#AccraSalon'],
      bestTime: 'Saturday 10am–12pm', emoji: '🎁',
    },
  ]
}

export async function getMarketingPosts(): Promise<MarketingPost[]> {
  const tenantId = await getTenantId()
  if (!tenantId) return []
  const snap = await adminDb.collection('marketing_posts')
    .where('tenantId', '==', tenantId)
    .get()
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as MarketingPost))
    .sort((a, b) => (a.scheduledDate ?? a.createdAt).localeCompare(b.scheduledDate ?? b.createdAt))
}

export async function saveMarketingPost(
  idea: PostIdea & { scheduledDate?: string; scheduledTime?: string }
): Promise<string> {
  const tenantId = await getTenantId()
  if (!tenantId) throw new Error('Not authenticated')
  const ref  = adminDb.collection('marketing_posts').doc()
  const post = {
    ...idea,
    tenantId,
    status:    idea.scheduledDate ? 'scheduled' : 'draft',
    createdAt: new Date().toISOString(),
  }
  await ref.set(post)
  revalidatePath('/marketing')
  return ref.id
}

export async function updatePostStatus(id: string, status: MarketingPost['status']): Promise<void> {
  await adminDb.collection('marketing_posts').doc(id).update({ status, updatedAt: new Date().toISOString() })
  revalidatePath('/marketing')
}

export async function deleteMarketingPost(id: string): Promise<void> {
  await adminDb.collection('marketing_posts').doc(id).delete()
  revalidatePath('/marketing')
}
