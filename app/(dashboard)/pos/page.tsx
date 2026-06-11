import { getClients } from '@/lib/actions/clients'
import { getServices } from '@/lib/actions/services'
import { getStaff } from '@/lib/actions/staff'
import { getInventory } from '@/lib/actions/inventory'
import { POSView } from './view'

export default async function POSPage() {
  const [clients, services, staff, products] = await Promise.all([
    getClients(),
    getServices(),
    getStaff(),
    getInventory(),
  ])
  return <POSView clients={clients} services={services} staff={staff} products={products} />
}
