import { notFound } from 'next/navigation'
import { MapPin, Phone, MessageCircle, Scissors } from 'lucide-react'
import { getPublicSalonData } from '@/lib/actions/public-booking'
import { PublicBookingView } from './view'
import { BookingGallery } from './gallery'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getPublicSalonData(params.slug)
  if (!data) return { title: 'Salon Not Found' }
  return {
    title: `Book at ${data.salonName}`,
    description: `Book your next appointment at ${data.salonName}. Choose your services, pick a time and confirm instantly.`,
  }
}

export default async function PublicBookingPage({ params }: { params: { slug: string } }) {
  const data = await getPublicSalonData(params.slug)
  if (!data) notFound()

  const { tenantId, salonName, settings, services, staff, locations, packages } = data
  const hasWhatsApp = !!settings.whatsappNumber
  const hasPhone    = !!settings.phone
  const hasAddress  = !!settings.address

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">{salonName}</span>
          </div>
          <span className="text-xs text-gray-400">Powered by GlowDesk</span>
        </div>
      </header>

      {/* ── Salon info hero ── */}
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Scissors className="h-8 w-8 text-teal-200" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{salonName}</h1>
              {settings.tagline && (
                <p className="text-teal-200 text-sm mt-0.5">{settings.tagline}</p>
              )}
            </div>
          </div>

          {(hasAddress || hasPhone || hasWhatsApp) && (
            <div className="flex flex-wrap gap-4 mt-6">
              {hasAddress && (
                <div className="flex items-center gap-1.5 text-sm text-teal-100">
                  <MapPin className="h-4 w-4 text-teal-300 shrink-0" />
                  {settings.address}
                </div>
              )}
              {hasPhone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 text-sm text-teal-100 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 text-teal-300 shrink-0" />
                  {settings.phone}
                </a>
              )}
              {hasWhatsApp && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-teal-100 hover:text-white transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-teal-300 shrink-0" />
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Gallery ── */}
      {(settings.galleryImages ?? []).length > 0 && (
        <BookingGallery images={settings.galleryImages!} salonName={salonName} />
      )}

      {/* ── Booking flow ── */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {services.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Scissors className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">This salon hasn&apos;t listed any services yet.</p>
            {hasWhatsApp && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
              </a>
            )}
          </div>
        ) : (
          <PublicBookingView
            tenantId={tenantId}
            salonName={salonName}
            services={services}
            staff={staff}
            locations={locations}
            packages={packages}
            depositPct={settings.depositPct ?? 0}
          />
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-100 mt-4">
        <p>
          © {new Date().getFullYear()} {salonName} &nbsp;·&nbsp;
          <span>Booking powered by <a href="https://glowdeskapp.online" className="text-teal-600 hover:underline">GlowDesk</a></span>
        </p>
      </footer>
    </div>
  )
}
