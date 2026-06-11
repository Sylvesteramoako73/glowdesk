'use client'
import { useState, useEffect, useRef } from 'react'
import { Link2, Copy, Check, ExternalLink, MessageCircle, QrCode, Download, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

const BOOKING_APP_URL = process.env.NEXT_PUBLIC_BOOKING_APP_URL ?? 'https://book.glowdeskapp.online'

export function BookingLinkCard() {
  const [slug, setSlug]       = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)
  const [showQR, setShowQR]   = useState(false)
  const qrRef                 = useRef<HTMLDivElement>(null)

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

  function downloadQR() {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 400; canvas.height = 400
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 400, 400)
      ctx.drawImage(img, 0, 0, 400, 400)
      const link = document.createElement('a')
      link.download = `${slug}-booking-qr.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)))
  }

  return (
    <>
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
            <button onClick={copy} disabled={!bookingUrl} title="Copy link"
              className="shrink-0 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors disabled:opacity-40">
              {copied ? <Check className="h-4 w-4 text-teal-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          {bookingUrl && (
            <div className="grid grid-cols-2 gap-2">
              <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 h-8 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
              <button onClick={() => setShowQR(true)}
                className="flex items-center justify-center gap-1.5 h-8 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-colors">
                <QrCode className="h-3.5 w-3.5" /> QR Code
              </button>
            </div>
          )}

          {bookingUrl && (
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-8 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium transition-colors w-full">
              <ExternalLink className="h-3.5 w-3.5" /> Preview booking page
            </a>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && bookingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowQR(false) }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Booking QR Code</h3>
              <button onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Print this and stick it at your reception. Clients scan to book instantly — no typing needed.
              </p>

              {/* QR code */}
              <div ref={qrRef} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <QRCodeSVG
                  value={bookingUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="M"
                  includeMargin={false}
                />
              </div>

              <p className="text-xs text-gray-400 font-mono text-center break-all">{bookingUrl}</p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button onClick={downloadQR}
                  className="flex items-center justify-center gap-2 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors">
                  <Download className="h-4 w-4" /> Download PNG
                </button>
                <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-10 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors">
                  <MessageCircle className="h-4 w-4" /> Share Link
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
