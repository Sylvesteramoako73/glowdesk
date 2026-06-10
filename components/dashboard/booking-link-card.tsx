'use client'
import { useState, useEffect } from 'react'
import { Link2, Copy, Check, ExternalLink, MessageCircle } from 'lucide-react'

const BOOKING_APP_URL = process.env.NEXT_PUBLIC_BOOKING_APP_URL ?? 'https://book.glowdeskapp.online'

export function BookingLinkCard() {
  const [slug, setSlug]     = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/tenant')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.slug) setSlug(d.slug) })
      .catch(() => {})
  }, [])

  const bookingUrl = slug ? `${BOOKING_APP_URL}/${slug}` : null
  const waText     = bookingUrl ? encodeURIComponent(`Book your appointment with us here 👉 ${bookingUrl}`) : ''

  function copy() {
    if (!bookingUrl) return
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-teal-600" />
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Your Booking Link</h2>
      </div>

      <div className="px-4 py-3 space-y-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Share this link — clients can browse your services and book 24/7.
        </p>

        {/* URL strip */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5">
          <span className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate font-mono">
            {bookingUrl ?? 'Loading…'}
          </span>
          <button
            onClick={copy}
            disabled={!bookingUrl}
            title="Copy link"
            className="shrink-0 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="h-4 w-4 text-teal-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {/* Action buttons */}
        {bookingUrl && (
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-8 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Share on WhatsApp
            </a>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-8 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Preview
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
