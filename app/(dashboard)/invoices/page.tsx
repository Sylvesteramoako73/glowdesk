import { requireRole } from '@/lib/auth'
import { getInvoices, getInvoiceStats } from '@/lib/actions/invoices'
import { getSalonSettings } from '@/lib/actions/settings'
import { InvoicesView } from './view'

export default async function InvoicesPage() {
  await requireRole('owner', 'manager')
  const [invoices, stats, settings] = await Promise.all([
    getInvoices(),
    getInvoiceStats(),
    getSalonSettings(),
  ])
  return <InvoicesView invoices={invoices} stats={stats} salonName={settings.salonName || 'Your Salon'} />
}

export const revalidate = 60
