import { getInventory } from '@/lib/actions/inventory'
import { getSalonSettings } from '@/lib/actions/settings'
import { ProductsView } from './view'

export default async function ProductsPage() {
  const [products, settings] = await Promise.all([
    getInventory(),
    getSalonSettings().catch(() => ({ salonName: '' })),
  ])
  return <ProductsView products={products} salonName={settings.salonName || 'Our Salon'} />
}

export const revalidate = 60
