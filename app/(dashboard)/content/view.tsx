'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Sparkles, Calendar, Lightbulb, Copy, CalendarPlus, Check,
  Loader2, Trash2, MessageCircle, Clock,
  TrendingUp, Hash, ChevronDown, ChevronUp, Megaphone, X,
  Gift, Star, Users, BookOpen, Share2, Link2,
  Wifi, WifiOff, Send, AlertCircle,
} from 'lucide-react'

function IGIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function FBIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}
import {
  generateContentIdeas, saveMarketingPost, updatePostStatus,
  deleteMarketingPost, type PostIdea, type MarketingPost,
} from '@/lib/actions/marketing'
import {
  disconnectSocialAccount, publishToFacebook,
  type SocialConnections,
} from '@/lib/actions/social'
import { cn } from '@/lib/utils'

/* ── Platform config ── */

const PLATFORM_CONFIG = {
  instagram: {
    label: 'Instagram',
    Icon:  IGIcon,
    bg:    'linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)',
    badge: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-700',
  },
  facebook: {
    label: 'Facebook',
    Icon:  FBIcon,
    bg:    'linear-gradient(135deg,#1877f2,#42b0ff)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  },
  whatsapp: {
    label: 'WhatsApp',
    Icon:  MessageCircle,
    bg:    'linear-gradient(135deg,#25d366,#128c7e)',
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

function fullText(idea: Pick<PostIdea, 'caption' | 'hashtags'>) {
  return `${idea.caption}\n\n${idea.hashtags.map(h => '#' + h.replace(/^#/, '')).join(' ')}`
}

/* ── Share menu ── */

function ShareMenu({ idea }: { idea: Pick<PostIdea, 'caption' | 'hashtags' | 'platform'> }) {
  const [open, setOpen]   = useState(false)
  const [copied, setCopied] = useState(false)
  const text = fullText(idea)

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    setOpen(false)
  }
  function shareFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(idea.caption)}`,
      '_blank', 'width=620,height=440'
    )
    setOpen(false)
  }
  function shareInstagram() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    window.open('https://www.instagram.com/', '_blank')
    setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
  }
  function copyText() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
  }

  return (
    <div className="relative flex-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
      >
        <Share2 className="h-3.5 w-3.5" /> Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-1.5 left-0 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl z-20 overflow-hidden">
            <button
              onClick={shareWhatsApp}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="h-5 w-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
                <MessageCircle className="h-3 w-3 text-white" />
              </div>
              Share to WhatsApp
            </button>
            <button
              onClick={shareFacebook}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="h-5 w-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1877f2,#42b0ff)' }}>
                <FBIcon className="h-3 w-3 text-white" />
              </div>
              Share to Facebook
            </button>
            <button
              onClick={shareInstagram}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="h-5 w-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)' }}>
                <IGIcon className="h-3 w-3 text-white" />
              </div>
              {copied ? 'Copied! Paste in IG' : 'Copy for Instagram'}
            </button>
            <div className="border-t border-gray-100 dark:border-white/[0.06]" />
            <button
              onClick={copyText}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy caption + tags'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Idea card ── */

function IdeaCard({ idea, onSchedule }: { idea: PostIdea; onSchedule: (idea: PostIdea) => void }) {
  const cfg      = PLATFORM_CONFIG[idea.platform]
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform duration-200"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: cfg.bg }}>
        <cfg.Icon className="h-4 w-4 text-white shrink-0" />
        <span className="text-xs font-bold text-white">{cfg.label}</span>
        <span className="ml-auto text-xl">{idea.emoji}</span>
      </div>

      <div className="flex-1 p-4 space-y-3">
        <div>
          <span className={cn('badge border text-[10px] capitalize mb-1.5', cfg.badge)}>{idea.category}</span>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{idea.title}</h3>
        </div>

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

        <div className="flex flex-wrap gap-1">
          {idea.hashtags.slice(0, 5).map(tag => (
            <span key={tag} className="text-[10px] text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-1.5 py-0.5 rounded-full font-medium">
              #{tag.replace(/^#/, '')}
            </span>
          ))}
          {idea.hashtags.length > 5 && <span className="text-[10px] text-gray-400 px-1.5 py-0.5">+{idea.hashtags.length - 5}</span>}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <Clock className="h-3 w-3 shrink-0" />Best time: {idea.bestTime}
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <ShareMenu idea={idea} />
        <button
          onClick={() => onSchedule(idea)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-xl text-white transition-all cursor-pointer hover:-translate-y-px"
          style={{ background: 'linear-gradient(135deg,#14b8a6,#0d9488)', boxShadow: '0 2px 8px rgba(13,148,136,0.3)' }}
        >
          <CalendarPlus className="h-3.5 w-3.5" /> Schedule
        </button>
      </div>
    </div>
  )
}

/* ── Schedule modal ── */

function ScheduleModal({ idea, onClose, onSaved }: {
  idea: PostIdea
  onClose: () => void
  onSaved: (post: MarketingPost) => void
}) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('19:00')
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
          <div><label className="form-label">Date</label><input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="form-input" /></div>
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

/* ── Calendar tab ── */

function CalendarTab({ posts: initial, socialConnections }: { posts: MarketingPost[]; socialConnections: SocialConnections }) {
  const [posts, setPosts]     = useState<MarketingPost[]>(initial)
  const [pending, setPending] = useState<string | null>(null)
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null)

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

  async function postToFacebook(post: MarketingPost) {
    setPending(post.id)
    const result = await publishToFacebook(post.caption, post.hashtags)
    if (result.success) {
      setToast({ msg: 'Posted to Facebook!', ok: true })
      setPosts(p => p.map(pp => pp.id === post.id ? { ...pp, status: 'posted' } : pp))
      await updatePostStatus(post.id, 'posted')
    } else {
      setToast({ msg: result.error ?? 'Failed to post', ok: false })
    }
    setPending(null)
    setTimeout(() => setToast(null), 4000)
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
      {toast && (
        <div className={cn('flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold', toast.ok ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300')}>
          {toast.ok ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Upcoming ({upcoming.length})</h3>
          {upcoming.map(post => {
            const cfg = PLATFORM_CONFIG[post.platform]
            return (
              <div key={post.id} className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-4 flex gap-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                  <cfg.Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{post.title}</p>
                      {post.scheduledDate && (
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(post.scheduledDate)}{post.scheduledTime && ` · ${post.scheduledTime}`}</p>
                      )}
                    </div>
                    <span className={cn('badge border text-[10px]', STATUS_BADGE[post.status])}>{post.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.caption}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
                    {/* Quick share buttons */}
                    <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(fullText(post))}`, '_blank')}
                      className="flex items-center gap-1 text-[10px] font-semibold text-green-700 dark:text-green-400 hover:underline cursor-pointer">
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </button>
                    <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(post.caption)}`, '_blank', 'width=620,height=440')}
                      className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      <FBIcon className="h-3 w-3" /> Facebook
                    </button>
                    {/* Auto-post if Facebook connected */}
                    {socialConnections.facebook && post.platform === 'facebook' && (
                      <button onClick={() => postToFacebook(post)} disabled={pending === post.id}
                        className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer disabled:opacity-50">
                        {pending === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        Auto-post
                      </button>
                    )}
                    <span className="text-gray-200 dark:text-gray-700">·</span>
                    <button onClick={() => markPosted(post.id)} disabled={pending === post.id}
                      className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:underline cursor-pointer disabled:opacity-50">
                      {pending === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Mark posted
                    </button>
                    <button onClick={() => handleDelete(post.id)} disabled={pending === post.id}
                      className="flex items-center gap-1 text-[10px] font-semibold text-red-500 hover:underline cursor-pointer disabled:opacity-50">
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
              <div key={post.id} className="bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.04] p-4 flex gap-4 opacity-60">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                  <cfg.Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.caption}</p>
                </div>
                <button onClick={() => handleDelete(post.id)} className="p-1 text-gray-300 hover:text-red-400 cursor-pointer shrink-0">
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

/* ── Social Accounts tab ── */

function SocialAccountsTab({ connections: initial, hasFbAppId }: { connections: SocialConnections; hasFbAppId: boolean }) {
  const [connections, setConnections] = useState<SocialConnections>(initial)
  const [disconnecting, setDisconnecting] = useState(false)
  const searchParams = useSearchParams()
  const connected = searchParams.get('connected')
  const error     = searchParams.get('error')

  const fb = connections.facebook

  async function handleDisconnect() {
    setDisconnecting(true)
    await disconnectSocialAccount('facebook')
    setConnections(c => ({ ...c, facebook: undefined }))
    setDisconnecting(false)
  }

  const ERROR_MESSAGES: Record<string, string> = {
    access_denied:      'You cancelled the Facebook connection.',
    token_exchange:     'Could not exchange the authorisation code. Try again.',
    no_pages:           'No Facebook Pages found. Make sure you have a Business Page.',
    no_app_id:          'Facebook App ID not configured. Contact support.',
    not_authenticated:  'Session expired. Please log in again.',
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Connect your social media accounts to post content directly from GlowDesk.
      </p>

      {connected === 'facebook' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/40 text-sm font-semibold text-green-700 dark:text-green-300">
          <Check className="h-4 w-4" /> Facebook{fb?.instagramUsername ? ' & Instagram' : ''} connected successfully!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-sm font-semibold text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4" /> {ERROR_MESSAGES[error] ?? 'Something went wrong. Try again.'}
        </div>
      )}

      {/* Facebook / Instagram */}
      <div className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#1877f2,#42b0ff)' }}>
            <FBIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 dark:text-white">Facebook & Instagram</h3>
              {fb ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <Wifi className="h-3 w-3" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <WifiOff className="h-3 w-3" /> Not connected
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Auto-post to your Facebook Page and linked Instagram Business account.
            </p>

            {fb ? (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Page:</span> {fb.pageName}
                </p>
                {fb.instagramUsername && (
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Instagram:</span> @{fb.instagramUsername}
                  </p>
                )}
                {!fb.instagramUsername && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    No Instagram Business account linked to this Page.
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1">Connected {formatDate(fb.connectedAt)}</p>
                <button onClick={handleDisconnect} disabled={disconnecting}
                  className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer disabled:opacity-50">
                  {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <WifiOff className="h-3.5 w-3.5" />}
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="mt-3">
                {!hasFbAppId ? (
                  <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                    Add <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">FACEBOOK_APP_ID</code> and{' '}
                    <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">FACEBOOK_APP_SECRET</code> to enable this.
                  </div>
                ) : (
                  <a
                    href="/api/social/connect/facebook"
                    className="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold text-white rounded-xl transition-all hover:-translate-y-px"
                    style={{ background: 'linear-gradient(135deg,#1877f2,#42b0ff)', boxShadow: '0 2px 10px rgba(24,119,242,0.35)' }}
                  >
                    <FBIcon className="h-4 w-4" /> Connect Facebook
                  </a>
                )}
                <p className="text-[11px] text-gray-400 mt-2">
                  Requires a Facebook Business Page. Meta app review needed for full auto-posting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-white">WhatsApp</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <Check className="h-3 w-3" /> Ready
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Share content to WhatsApp Status or send to your client broadcast list. No login needed.
            </p>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>✅ One-tap share from any post idea or scheduled post</p>
              <p>✅ Opens WhatsApp with caption + hashtags pre-filled</p>
              <p>✅ Works with WhatsApp Status (Instagram Stories equivalent)</p>
            </div>
          </div>
        </div>
      </div>

      {/* TikTok — coming soon */}
      <div className="bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.04] p-5 opacity-60">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-black">
            <span className="text-white text-sm font-black">TK</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-white">TikTok</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">Coming soon</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Auto-post Reels and short-form videos to TikTok.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Tips tab ── */

const TIPS = [
  { icon: Clock,         emoji: '⏰', color: '#0d9488', title: 'Best Times to Post in Ghana',    tips: ['Evenings 7pm–10pm are peak engagement (after-work scrolling)', 'Lunch break 12pm–2pm gets good reach on Facebook', 'Saturday 10am–12pm is ideal for weekend promotions', 'Avoid posting before 8am or after 11pm'] },
  { icon: MessageCircle, emoji: '💬', color: '#25d366', title: 'WhatsApp First Strategy',        tips: ['WhatsApp is the #1 platform for Ghana beauty clients — use it daily', 'Broadcast lists for promotions to opted-in clients', 'WhatsApp Status works like Instagram Stories — post transformations', 'Use voice notes for a personal touch with loyal clients'] },
  { icon: Star,          emoji: '⭐', color: '#f59e0b', title: 'Content That Performs',           tips: ['Before/after photos get 3x more engagement than text posts', 'Client testimonial videos (even 15 seconds) build massive trust', 'Behind-the-scenes content makes clients feel connected', 'Ask questions in captions to boost comments ("Which would you pick?")'] },
  { icon: Gift,          emoji: '🎁', color: '#7c3aed', title: 'Ghana Holidays to Leverage',     tips: ["Valentine's Day (Feb 14) — couples packages, glow-up deals", 'Independence Day (March 6) — Ghana flag nail art, patriotic posts', 'Easter — "New season, new look" promotions', 'Christmas & Sallah — biggest booking seasons, plan 3 weeks ahead'] },
  { icon: Users,         emoji: '👥', color: '#4338ca', title: 'Growing Your Following',          tips: ['"Tag a friend who needs this" posts expand your reach fast', 'Referral discount ("Bring a friend, both get 10% off") works well', 'Collaborate with popular local fashion influencers', 'Consistent posting (3–4x/week) beats sporadic viral posts'] },
  { icon: TrendingUp,    emoji: '📈', color: '#ec4899', title: 'Instagram Reels for Salons',      tips: ['Time-lapse transformation videos (15–30 sec) perform best', 'Use trending Afrobeats audio for higher reach', 'Show the process, not just the final result', 'Add text overlays with the price — it drives direct bookings'] },
  { icon: Hash,          emoji: '#️⃣', color: '#0284c7', title: 'Ghana Hashtag Strategy',          tips: ['Mix broad (#GhanaBeauty) with niche (#AccraBraids) tags', 'Local hashtags: #AccraSalon #KumasiHair #GhanaHair', 'Use 5–10 targeted hashtags — not 30 generic ones', 'Create your own branded hashtag and use it in every post'] },
  { icon: BookOpen,      emoji: '📚', color: '#059669', title: 'Client Retention Content',        tips: ['Post care tips for your services (hair, nail, skin aftercare)', 'Birthday posts for loyal clients build deep loyalty', '"How to maintain your [service] at home" gets saved and shared', 'Monthly or seasonal promotions keep repeat clients engaged'] },
]

function TipsTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {TIPS.map(tip => (
        <div key={tip.title} className="bg-white dark:bg-[#111115] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: tip.color + '20' }}>
              <tip.icon style={{ color: tip.color, height: 18, width: 18 }} />
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

/* ── Main component ── */

const TABS = [
  { id: 'ideas',    label: 'AI Ideas',         Icon: Sparkles  },
  { id: 'calendar', label: 'Content Calendar', Icon: Calendar  },
  { id: 'accounts', label: 'Social Accounts',  Icon: Link2     },
  { id: 'tips',     label: 'Marketing Tips',   Icon: Lightbulb },
] as const

type Tab = typeof TABS[number]['id']

interface Props {
  initialPosts:       MarketingPost[]
  salonName:          string
  address:            string
  serviceCategories:  string[]
  hasApiKey:          boolean
  hasFbAppId:         boolean
  socialConnections:  SocialConnections
}

export function MarketingView({
  initialPosts, salonName, address, serviceCategories,
  hasApiKey, hasFbAppId, socialConnections,
}: Props) {
  const searchParams = useSearchParams()
  const [tab, setTab]           = useState<Tab>((searchParams.get('tab') as Tab) ?? 'ideas')
  const [ideas, setIdeas]       = useState<PostIdea[]>([])
  const [loading, setLoading]   = useState(false)
  const [scheduleFor, setScheduleFor] = useState<PostIdea | null>(null)
  const [posts, setPosts]       = useState<MarketingPost[]>(initialPosts)

  async function handleGenerate() {
    setLoading(true)
    setIdeas([])
    try {
      const result = await generateContentIdeas(6, Date.now())
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
          <button onClick={handleGenerate} disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Generating…' : 'Generate Ideas'}
          </button>
        )}
      </div>

      {!hasApiKey && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">AI key not configured</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Add <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded font-mono">ANTHROPIC_API_KEY</code> to your environment for live AI generation. Sample ideas shown below.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap',
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
            {id === 'accounts' && socialConnections.facebook && (
              <span className="h-2 w-2 rounded-full bg-green-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'ideas' && (
        <div>
          {ideas.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-3xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)' }}>
                <Sparkles className="h-10 w-10 text-teal-500" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Ready to grow {salonName}?</h2>
              <p className="text-sm text-gray-500 max-w-md mb-6">
                Click <strong>Generate Ideas</strong> and we'll create 6 tailored social media posts
                based on your services, location in {address}, and what works for Ghana beauty salons.
              </p>
              <button onClick={handleGenerate} disabled={loading} className="btn-primary px-6 h-11 text-base">
                <Sparkles className="h-5 w-5" /> Generate My Content Ideas
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

      {tab === 'calendar' && <CalendarTab posts={posts} socialConnections={socialConnections} />}
      {tab === 'accounts' && <SocialAccountsTab connections={socialConnections} hasFbAppId={hasFbAppId} />}
      {tab === 'tips'     && <TipsTab />}

      {scheduleFor && (
        <ScheduleModal idea={scheduleFor} onClose={() => setScheduleFor(null)} onSaved={handleSaved} />
      )}
    </div>
  )
}
