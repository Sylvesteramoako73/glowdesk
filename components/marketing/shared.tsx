import Link from 'next/link'
import { Calendar, ChevronRight, CreditCard, Heart, MessageCircle, Users } from 'lucide-react'
import type { FeatureIcon as IconName } from '@/lib/marketing/features'
import { organizationLd, websiteLd, breadcrumbLd, type JsonLd as Ld } from '@/lib/marketing/site'

/** Structured data for a page. Organization and WebSite are always included. */
export function JsonLd({ items = [], breadcrumbs }: { items?: Ld[]; breadcrumbs?: { name: string; path: string }[] }) {
  const graph = [organizationLd, websiteLd, ...(breadcrumbs ? [breadcrumbLd(breadcrumbs)] : []), ...items]
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c') }}
    />
  )
}

export function Breadcrumbs({ trail, dark = false }: { trail: { name: string; path: string }[]; dark?: boolean }) {
  const items = [{ name: 'Home', path: '/' }, ...trail]
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className={`flex flex-wrap items-center gap-1.5 text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {last
                ? <span aria-current="page" className={dark ? 'text-slate-200' : 'text-gray-700'}>{c.name}</span>
                : <Link href={c.path} className={dark ? 'hover:text-white' : 'hover:text-gray-900'}>{c.name}</Link>}
              {!last && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

const ICONS = { calendar: Calendar, card: CreditCard, users: Users, heart: Heart, message: MessageCircle }
const COLORS: Record<IconName, string> = {
  calendar: 'bg-teal-100 text-teal-600',
  card: 'bg-violet-100 text-violet-600',
  users: 'bg-amber-100 text-amber-600',
  heart: 'bg-rose-100 text-rose-600',
  message: 'bg-indigo-100 text-indigo-600',
}

export function FeatureIcon({ name }: { name: IconName }) {
  const Icon = ICONS[name]
  return (
    <div className={`h-10 w-10 rounded-xl ${COLORS[name]} flex items-center justify-center shrink-0`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
  )
}
