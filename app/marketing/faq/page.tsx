import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/marketing/site'
import { FAQS, faqPageLd } from '@/lib/marketing/faqs'
import { CTA } from '@/components/marketing/chrome'
import { FAQ } from '@/components/marketing/faq'
import { JsonLd } from '@/components/marketing/shared'

export const metadata: Metadata = pageMetadata({
  path: '/faq',
  title: 'Salon Software FAQs | GlowDesk',
  description:
    'Answers about GlowDesk: pricing, the free trial, online booking and deposits, Mobile Money payments, WhatsApp reminders, importing clients and data security.',
})

export default function FaqPage() {
  return (
    <>
      <JsonLd breadcrumbs={[{ name: 'FAQ', path: '/faq' }]} items={[faqPageLd(FAQS)]} />
      <FAQ asPage />
      <CTA />
    </>
  )
}
