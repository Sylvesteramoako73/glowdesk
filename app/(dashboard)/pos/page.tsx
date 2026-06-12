import { getClients } from '@/lib/actions/clients'
import { getServices } from '@/lib/actions/services'
import { getStaff } from '@/lib/actions/staff'
import { getInventory } from '@/lib/actions/inventory'
import { getSalonSettings } from '@/lib/actions/settings'
import { POSView } from './view'

export default async function POSPage() {
  const [clients, services, staff, products, settings] = await Promise.all([
    getClients(),
    getServices(),
    getStaff(),
    getInventory(),
    getSalonSettings().catch(() => ({ salonName: '', address: '', phone: '', email: '' })),
  ])
  return (
    <POSView
      clients={clients}
      services={services}
      staff={staff}
      products={products}
      salonSettings={{
        name:    settings.salonName || 'Our Salon',
        address: (settings as any).address || '',
        phone:   settings.phone    || '',
        email:   settings.email    || '',
      }}
    />
  )
}
