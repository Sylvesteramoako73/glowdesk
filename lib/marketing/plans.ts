import { SITE_URL, type JsonLd } from './site'

export const PLANS = [
  { name: 'Starter', price: 150, highlight: false, desc: 'For small salons just getting started.',
    features: ['Up to 3 staff', 'Appointments & clients', 'Point of sale', 'Basic analytics', 'Online booking page'] },
  { name: 'Pro', price: 350, highlight: true, desc: 'For growing salons that need more power.',
    features: ['Unlimited staff', 'Everything in Starter', 'Payroll & expenses', 'Automations & SMS', 'Inventory management', 'Multi-location (up to 3)', 'Priority support'] },
  { name: 'Enterprise', price: 700, highlight: false, desc: 'For salon chains and franchise businesses.',
    features: ['Everything in Pro', 'Unlimited locations', 'Apprenticeship tracking', 'Custom integrations', 'Dedicated account manager', 'SLA support'] },
]

export const softwareApplicationLd: JsonLd = {
  '@type': 'SoftwareApplication',
  name: 'GlowDesk',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Salon management software',
  operatingSystem: 'Web, Android, iOS',
  url: `${SITE_URL}/`,
  description:
    'Salon management software for beauty businesses in Ghana and West Africa: online booking, point of sale with Mobile Money, client records and loyalty, staff commission and payroll, inventory, and WhatsApp and SMS reminders.',
  publisher: { '@id': `${SITE_URL}/#organization` },
  offers: PLANS.map(p => ({
    '@type': 'Offer',
    name: p.name,
    description: p.desc,
    url: `${SITE_URL}/pricing`,
    priceSpecification: { '@type': 'UnitPriceSpecification', price: String(p.price), priceCurrency: 'GHS', unitText: 'MONTH' },
  })),
}
