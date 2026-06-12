'use client'
import { useState } from 'react'
import {
  Sparkles, Calendar, Lightbulb, Copy, CalendarPlus, Check,
  Loader2, Trash2, Instagram, Facebook, MessageCircle, Clock,
  TrendingUp, Hash, ChevronDown, ChevronUp, Megaphone, X,
  Gift, Star, Users, BookOpen,
} from 'lucide-react'
import {
  generateContentIdeas, saveMarketingPost, updatePostStatus,
  deleteMarketingPost, type PostIdea, type MarketingPost,
} from '@/lib/actions/marketing'
import { cn } from '@/lib/utils'

/* ── helpers ── */

const PLATFORM_CONFIG = {
  instagram: {
    label: 'Instagram',
    Icon: Instagram,
    bg: 'linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)',
    text: 'text-white',
    badge: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-700',
  },
  facebook: {
    label: 'Facebook',
    Icon: Facebook,
    bg: 'linear-gradient(135deg,#1877f2,#42b0ff)',
    text: 'text-white',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  },
  whatsapp: {
    label: 'WhatsApp',
    Icon: MessageCircle,
    bg: 'linear-gradient(135deg,#25d366,#128c7e)',
    text: 'text-white',
    badge: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
  },
}

const STATUS_BADGE: Record<MarketingPost['status'], string> = {
  draft:     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  posted:    'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GH', { weekday: 'short', month: 'short', day: 'numeric' })
}

/* ── sub-components ── */

function IdeaCard({
  idea,
  onSchedule,
}: {
  idea: PostIdea
  onSchedule: (idea: PostIdea) => void
}) {
  const cfg     = PLATFORM_CONFIG[idea.platform]
  const [copied, setCopied]     = useState(false)
  const [expanded, setExpanded] = useState(false)

  function copyCaption() {
    const full = `${idea.caption}\n\n${idea.hashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ')}`
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform duration-200"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

      {/* Platform header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: cfg.bg }}>
        <cfg.Icon className="h-4 w-4 text-white shrink-0" />
        <span className="text-xs font-bold text-white">{cfg.label}</span>
        <span className="ml-auto text-xl">{idea.emoji}</span>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-3">
        {/* Category + title */}
        <div>
          <span className={cn('badge border text-[10px] capitalize mb-1.5', cfg.badge)}>
            {idea.category}
          </span>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{idea.title}</h3>
        </div>

        {/* Caption */}
        <div>
          <p className={cn('text-xs text-gray-600 dark:text-gray-400 leading-relaxed', !expanded && 'line-clamp-3')}>
            {idea.caption}
          </p>
          {idea.caption.length > 120 && (
            <button onClick={() => setExpanded(e => !e)} className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-0.5 cursor-pointer">
              {expanded ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> More</>}
            </button>
          )}
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1">
          {idea.hashtags.slice(0, 5).map(tag => (
            <span key={tag} className="text-[10px] text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-1.5 py-0.5 rounded-full font-medium">
              #{tag.replace(/^#/, '')}
            </span>
          ))}
          {idea.hashtags.length > 5 && (
            <span className="text-[10px] text-gray-400 px-1.5 py-0.5">+{idea.hashtags.length - 5}</span>
          )}
        </div>

        {/* Best time */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-500">
          <Clock className="h-3 w-3 shrink-0" />
          Best time: {idea.bestTime}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={copyCaption}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => onSchedule(idea)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-xl text-white transition-all cursor-pointer hover:-translate-y-px"
          style={{ background: 'linear-gradient(135deg,#14b8a6,#0d9488)', boxShadow: '0 2px 8px rgba(13,148,136,0.3)' }}
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          Schedule
        </button>
      </div>
    </div>
  )
}

function ScheduleModal({
  idea,
  onClose,
  onSaved,
}: {
  idea: PostIdea
  onClose: () => void
  onSaved: (post: MarketingPost) => void
}) {
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0])
  const [time, setTime]     = useState('19:00')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const id = await saveMarketingPost({ ...idea, scheduledDate: date, scheduledTime: time })
      onSaved({ ...idea, id, tenantId: '', scheduledDate: date, scheduledTime: time, status: 'scheduled', createdAt: new Date().toISOString() })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#111115] rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Schedule Post</h3>
            <p className="text-xs text-gray-500 mt-0.5">{idea.title}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="form-label">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="form-label">Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="form-input" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Add to Calendar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CalendarTab({ posts: initial }: { posts: MarketingPost[] }) {
  const [posts, setPosts]   = useState<MarketingPost[]>(initial)
  const [pending, setPending] = useState<string | null>(null)

  async function markPosted(id: string) {
    setPending(id)
    await updatePostStatus(id, 'posted')
    setPosts(p => p.map(post => post.id === id ? { ...post, status: 'posted' } : post))
    setPending(null)
  }

  async function handleDelete(id: string) {
    setPending(id)
    await deleteMarketingPost(id)
    setPosts(p => p.filter(post => post.id !== id))
    setPending(null)
  }

  const upcoming = posts.filter(p => p.status !== 'posted')
  const done     = posts.filter(p => p.status === 'posted')

  if (posts.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)' }}>
        <Calendar className="h-8 w-8 text-teal-500" />
      </div>
      <p className="font-semibold text-gray-600 dark:text-gray-400">No posts scheduled yet</p>
      <p className="text-sm text-gray-400 mt-1">Generate ideas and click "Schedule" to add them here.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Upcoming ({upcoming.length})</h3>
          {upcoming.map(post => {
            const cfg = PLATFORM_CONFIG[post.platform]
            return (
              <div key={post.id} className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-4 flex gap-4"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                  <cfg.Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{post.title}</p>
                      {post.scheduledDate && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {formatDate(post.scheduledDate)} {post.scheduledTime && `· ${post.scheduledTime}`}
                        </p>
                      )}
                    </div>
                    <span className={cn('badge border text-[10px]', STATUS_BADGE[post.status])}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">{post.caption}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => markPosted(post.id)}
                      disabled={pending === post.id}
                      className="flex items-center gap-1 text-[10px] font-semibold text-green-700 dark:text-green-400 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {pending === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Mark posted
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={pending === post.id}
                      className="flex items-center gap-1 text-[10px] font-semibold text-red-500 hover:underline cursor-pointer disabled:opacity-50 ml-3"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Posted ({done.length})</h3>
          {done.map(post => {
            const cfg = PLATFORM_CONFIG[post.platform]
            return (
              <div key={post.id} className="bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.04] p-4 flex gap-4 opacity-70">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                  <cfg.Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.caption}</p>
                </div>
                <button onClick={() => handleDelete(post.id)} disabled={pending === post.id} className="p-1 text-gray-300 hover:text-red-400 cursor-pointer transition-colors shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const TIPS = [
  {
    icon: Clock, emoji: '⏰', title: 'Best Times to Post in Ghana',
    color: '#0d9488',
    tips: [
      'Evenings 7pm–10pm are peak engagement (after-work scrolling)',
      'Lunch break 12pm–2pm gets good reach on Facebook',
      'Saturday 10am–12pm is ideal for weekend promotions',
      'Avoid posting before 8am or after 11pm',
    ],
  },
  {
    icon: MessageCircle, emoji: '💬', title: 'WhatsApp First Strategy',
    color: '#25d366',
    tips: [
      'WhatsApp is the #1 platform for Ghana beauty clients — use it daily',
      'Broadcast lists for promotions to opted-in clients',
      'WhatsApp Status works like Instagram Stories — post transformations',
      'Use voice notes for a personal touch with loyal clients',
    ],
  },
  {
    icon: Star, emoji: '⭐', title: 'Content That Performs',
    color: '#f59e0b',
    tips: [
      'Before/after photos get 3x more engagement than text posts',
      'Client testimonial videos (even 15 seconds) build massive trust',
      'Behind-the-scenes content makes clients feel connected',
      'Ask questions in captions to boost comments ("Which would you pick?")',
    ],
  },
  {
    icon: Gift, emoji: '🎁', title: 'Ghana Holidays to Leverage',
    color: '#7c3aed',
    tips: [
      'Valentine\'s Day (Feb 14) — couples packages, glow-up deals',
      'Independence Day (March 6) — Ghana flag nail art, patriotic posts',
      'Easter — "New season, new look" promotions',
      'Christmas & Sallah — biggest booking seasons, plan 3 weeks ahead',
    ],
  },
  {
    icon: Users, emoji: '👥', title: 'Growing Your Following',
    color: '#4338ca',
    tips: [
      '"Tag a friend who needs this" posts expand your reach fast',
      'Referral discount ("Bring a friend, both get 10% off") works well',
      'Collaborate with popular local fashion influencers',
      'Consistent posting (3–4x/week) beats sporadic viral posts',
    ],
  },
  {
    icon: TrendingUp, emoji: '📈', title: 'Instagram Reels for Salons',
    color: '#ec4899',
    tips: [
      'Time-lapse transformation videos (15–30 sec) perform best',
      'Use trending Afrobeats audio for higher reach',
      'Show the process, not just the final result',
      'Add text overlays with the price — it drives direct bookings',
    ],
  },
  {
    icon: Hash, emoji: '#️⃣', title: 'Ghana Hashtag Strategy',
    color: '#0284c7',
    tips: [
      'Mix broad (#GhanaBeauty) with niche (#AccraBraids) tags',
      'Local hashtags: #AccraSalon #KumasiHair #GhanaHair',
      'Use 5–10 targeted hashtags — not 30 generic ones',
      'Create your own branded hashtag and use it in every post',
    ],
  },
  {
    icon: BookOpen, emoji: '📚', title: 'Client Retention Content',
    color: '#059669',
    tips: [
      'Post care tips for your services (hair, nail, skin aftercare)',
      'Birthday posts for loyal clients build deep loyalty',
      '"How to maintain your [service] at home" gets saved and shared',
      'Monthly or seasonal promotions keep repeat clients engaged',
    ],
  },
]

function TipsTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {TIPS.map(tip => (
        <div key={tip.title} className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: tip.color + '20' }}>
              <tip.icon className="h-4.5 w-4.5" style={{ color: tip.color, height: 18, width: 18 }} />
            </div>
            <div>
              <span className="text-base mr-1.5">{tip.emoji}</span>
              <span className="font-bold text-sm text-gray-900 dark:text-white">{tip.title}</span>
            </div>
          </div>
          <ul className="space-y-2">
            {tip.tips.map(t => (
              <li key={t} className="flex gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full shrink-0 mt-1.5" style={{ background: tip.color }} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/* ── main component ── */

const TABS = [
  { id: 'ideas',    label: 'AI Ideas',         Icon: Sparkles  },
  { id: 'calendar', label: 'Content Calendar', Icon: Calendar  },
  { id: 'tips',     label: 'Marketing Tips',   Icon: Lightbulb },
] as const

type Tab = typeof TABS[number]['id']

interface Props {
  initialPosts:       MarketingPost[]
  salonName:          string
  address:            string
  serviceCategories:  string[]
  hasApiKey:          boolean
}

export function MarketingView({ initialPosts, salonName, address, serviceCategories, hasApiKey }: Props) {
  const [tab, setTab]           = useState<Tab>('ideas')
  const [ideas, setIdeas]       = useState<PostIdea[]>([])
  const [loading, setLoading]   = useState(false)
  const [scheduleFor, setScheduleFor] = useState<PostIdea | null>(null)
  const [posts, setPosts]       = useState<MarketingPost[]>(initialPosts)

  async function handleGenerate() {
    setLoading(true)
    setIdeas([])
    try {
      const result = await generateContentIdeas(6)
      setIdeas(result)
    } finally {
      setLoading(false)
    }
  }

  function handleSaved(post: MarketingPost) {
    setPosts(prev => [...prev, post])
    setScheduleFor(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2dd4bf,#0d9488)' }}>
              <Megaphone className="h-4 w-4 text-white" />
            </div>
            <h1 className="page-title">Marketing Hub</h1>
          </div>
          <p className="page-subtitle">
            AI-powered content for <span className="font-semibold text-gray-700 dark:text-gray-300">{salonName}</span>
            {serviceCategories.length > 0 && (
              <> · <span className="text-teal-600 dark:text-teal-400">{serviceCategories.slice(0, 3).join(', ')}{serviceCategories.length > 3 ? ` +${serviceCategories.length - 3}` : ''} detected</span></>
            )}
          </p>
        </div>
        {tab === 'ideas' && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Sparkles className="h-4 w-4" />
            }
            {loading ? 'Generating…' : 'Generate Ideas'}
          </button>
        )}
      </div>

      {/* API key notice */}
      {!hasApiKey && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40">
          <span className="text-amber-500 text-lg shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">AI key not configured</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Add <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded font-mono">ANTHROPIC_API_KEY</code> to your environment variables for live AI generation.
              Sample ideas are shown below.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer',
              tab === id
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {id === 'calendar' && posts.filter(p => p.status !== 'posted').length > 0 && (
              <span className="h-5 min-w-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg,#14b8a6,#0d9488)' }}>
                {posts.filter(p => p.status !== 'posted').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'ideas' && (
        <div>
          {ideas.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-3xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)' }}>
                <Sparkles className="h-10 w-10 text-teal-500" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Ready to grow {salonName}?
              </h2>
              <p className="text-sm text-gray-500 max-w-md mb-6">
                Click <strong>Generate Ideas</strong> and we'll create 6 tailored social media posts
                based on your services, location in {address}, and what works for Ghana beauty salons.
              </p>
              <button onClick={handleGenerate} disabled={loading} className="btn-primary text-base px-6 py-3 h-auto">
                <Sparkles className="h-5 w-5" />
                Generate My Content Ideas
              </button>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden animate-pulse">
                  <div className="h-12 bg-gray-200 dark:bg-gray-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/3" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-full" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-5/6" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-4/6" />
                    <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {ideas.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">{ideas.length} ideas generated for {salonName}</p>
                <button onClick={handleGenerate} disabled={loading} className="btn-secondary text-xs h-8 px-3 gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Regenerate
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ideas.map((idea, i) => (
                  <IdeaCard key={i} idea={idea} onSchedule={setScheduleFor} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'calendar' && <CalendarTab posts={posts} />}
      {tab === 'tips' && <TipsTab />}

      {/* Schedule modal */}
      {scheduleFor && (
        <ScheduleModal
          idea={scheduleFor}
          onClose={() => setScheduleFor(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
