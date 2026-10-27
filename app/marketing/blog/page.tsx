import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatDate, getPosts, readingMinutes } from '@/lib/marketing/blog'
import { SITE_URL, pageMetadata } from '@/lib/marketing/site'
import { CTA } from '@/components/marketing/chrome'
import { Breadcrumbs, JsonLd } from '@/components/marketing/shared'

export const metadata: Metadata = pageMetadata({
  path: '/blog',
  title: 'Salon Business Blog | GlowDesk',
  description:
    'Practical guides for salon, barbershop and spa owners in Ghana on bookings, no shows, stylist commission, pricing and choosing salon software.',
})

export default function BlogIndex() {
  const posts = getPosts()
  return (
    <>
      <JsonLd
        breadcrumbs={[{ name: 'Blog', path: '/blog' }]}
        items={[{
          '@type': 'Blog',
          name: 'GlowDesk Blog',
          url: `${SITE_URL}/blog`,
          publisher: { '@id': `${SITE_URL}/#organization` },
          blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.date })),
        }]}
      />
      <section className="pt-12 pb-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs trail={[{ name: 'Blog', path: '/blog' }]} />
          <div className="max-w-3xl mb-12">
            <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">Blog</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">Guides for running a busier, more profitable salon</h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Practical advice for salon, barbershop and spa owners in Ghana, from cutting no shows to paying your stylists fairly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <article key={p.slug} className="group rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex flex-col hover:shadow-lg transition-shadow">
                <Link href={`/blog/${p.slug}`} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/9] bg-gray-100 overflow-hidden">
                  <Image src={p.image} alt="" fill priority={i === 0} sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs text-gray-400 mb-3"><time dateTime={p.date}>{formatDate(p.date)}</time> · {readingMinutes(p)} min read</p>
                  <h2 className="text-lg font-bold text-gray-900 leading-snug mb-3">
                    <Link href={`/blog/${p.slug}`} className="hover:text-teal-700">{p.title}</Link>
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">{p.description}</p>
                  <Link href={`/blog/${p.slug}`} aria-label={`Read ${p.title}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
                    Read the guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  )
}
