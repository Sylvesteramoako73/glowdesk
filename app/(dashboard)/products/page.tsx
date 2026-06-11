import { getInventory } from '@/lib/actions/inventory'
import { ProductsView } from './view'

export default async function ProductsPage() {
  const products = await getInventory()
  return <ProductsView products={products} />
}

export const revalidate = 60
