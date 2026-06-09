import { getServices } from '@/lib/actions/services'
import { getStaff } from '@/lib/actions/staff'
import { getLocations } from '@/lib/actions/locations'
import { getSalonSettings } from '@/lib/actions/settings'
import { BookingView } from './view'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSalonSettings()
  const name = s.salonName || 'Our Salon'
  return {
    title: `Book an Appointment — ${name}`,
    description: `Book your next appointment at ${name}.`,
  }
}

export default async function BookPage() {
  const [services, staff, locations, settings] = await Promise.all([
    getServices(), getStaff(), getLocations(), getSalonSettings(),
  ])
  const salonName = settings.salonName || 'Our Salon'
  const phone     = settings.phone     || ''

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900 dark:text-gray-100 text-xl">{salonName}</span>
          {phone && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Questions? Call us</p>
              <a href={`tel:${phone}`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline">{phone}</a>
            </div>
          )}
        </div>
      </header>

      <div className="bg-gray-900 text-white py-10 px-6 text-center">
        <h1 className="text-2xl font-semibold">Book an Appointment</h1>
        <p className="text-gray-400 text-sm mt-1">Choose your services and we'll confirm within 1 hour</p>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-4">
        <BookingView services={services} staff={staff} locations={locations} />
      </div>

      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-200 dark:border-gray-800 mt-4">
        © {new Date().getFullYear()} {salonName} · Powered by GlowDesk
      </footer>
    </div>
  )
}
