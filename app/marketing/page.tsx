import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar, Users, BarChart2, CreditCard, Zap, Package,
  Check, ArrowRight, Star, Scissors, MessageSquare, Clock,
  Shield, Globe, Smartphone,
} from 'lucide-react'

const APP_URL = 'https://app.glowdeskapp.online'

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="GlowDesk" width={140} height={46} className="h-10 w-auto object-contain" priority />
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#pricing"  className="hover:text-gray-900 transition-colors">Pricing</a>
          <a href="#faq"      className="hover:text-gray-900 transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href={`${APP_URL}/login`} className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link href={`${APP_URL}/signup`}
            className="flex items-center gap-1.5 h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 pt-24 pb-32 px-4 sm:px-6 text-center">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
          Built for salons in Ghana &amp; West Africa
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Run your salon.<br />
          <span className="text-teal-400">Not spreadsheets.</span>
        </h1>

        <p className="text-lg text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed">
          GlowDesk brings appointments, clients, staff, inventory, payroll and analytics together — so you spend less time managing and more time growing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={`${APP_URL}/signup`}
            className="flex items-center gap-2 h-12 px-6 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-teal-900/40">
            Start 14-day free trial <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`${APP_URL}/login`}
            className="flex items-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm transition-colors border border-white/10">
            Sign in to your account
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-4">No credit card required · Cancel anytime</p>
      </div>

      {/* Stats strip */}
      <div className="relative max-w-2xl mx-auto mt-16 grid grid-cols-3 gap-4">
        {[
          { value: '500+', label: 'Salons onboarded' },
          { value: '14 days', label: 'Free trial' },
          { value: '24/7', label: 'Support' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Calendar, color: 'bg-teal-100 text-teal-600',
    title: 'Smart Appointments',
    desc: 'Online booking, walk-in management, automatic reminders. No double-bookings, ever.',
  },
  {
    icon: Users, color: 'bg-blue-100 text-blue-600',
    title: 'Client Management',
    desc: 'Full client history, notes, loyalty tracking and a self-service portal for every customer.',
  },
  {
    icon: CreditCard, color: 'bg-violet-100 text-violet-600',
    title: 'Point of Sale',
    desc: 'Sell services, products and gift cards. Accept cash or Paystack — invoices generated instantly.',
  },
  {
    icon: Users, color: 'bg-amber-100 text-amber-600',
    title: 'Staff & Payroll',
    desc: 'Roles, schedules, commission tracking and payroll reports — all in one place.',
  },
  {
    icon: BarChart2, color: 'bg-rose-100 text-rose-600',
    title: 'Analytics',
    desc: 'Daily revenue, staff performance, top services and client retention — always up to date.',
  },
  {
    icon: Package, color: 'bg-green-100 text-green-600',
    title: 'Inventory',
    desc: 'Track product stock, get low-stock alerts, and manage supplier orders without a spreadsheet.',
  },
  {
    icon: Zap, color: 'bg-indigo-100 text-indigo-600',
    title: 'Automations',
    desc: 'Automatic appointment reminders and re-engagement messages via WhatsApp or SMS.',
  },
  {
    icon: Globe, color: 'bg-cyan-100 text-cyan-600',
    title: 'Online Booking Page',
    desc: 'Every salon gets a public booking page. Share the link — clients book themselves.',
  },
  {
    icon: Smartphone, color: 'bg-orange-100 text-orange-600',
    title: 'Multi-location',
    desc: 'Manage multiple branches from one dashboard. Staff and data separated per location.',
  },
]

function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">Everything you need</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">One tool for your whole salon</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Stop juggling WhatsApp, notebooks and Excel. GlowDesk replaces all of it.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-10 w-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Sign up in 2 minutes', desc: 'Enter your salon name, phone number and email. No credit card needed.' },
    { n: '02', title: 'Set up your services & staff', desc: 'Add your menu, staff members and working hours. Takes about 10 minutes.' },
    { n: '03', title: 'Share your booking link', desc: 'Clients book online. You get notified. Everyone shows up on time.' },
  ]
  return (
    <section className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">Quick setup</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Up and running today</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(s => (
            <div key={s.n} className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-teal-600 text-white text-xl font-bold mb-5 shadow-lg shadow-teal-200">
                {s.n}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Abena M.',
    role: 'Owner · Glow Beauty Studio, Accra',
    body: 'I used to manage everything on WhatsApp and a notebook. GlowDesk changed everything — I can see my revenue, my staff and my clients all in one place.',
  },
  {
    name: 'Kwame A.',
    role: 'Manager · Prestige Cuts, Kumasi',
    body: 'The automatic appointment reminders alone saved us from at least 10 no-shows a month. Worth every pesewa.',
  },
  {
    name: 'Ama S.',
    role: 'Owner · The Lash Studio, Takoradi',
    body: 'Setup was incredibly fast. Within an hour I had my services, staff and booking page all ready. My clients love it.',
  },
]

function Testimonials() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">Loved by salons</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What salon owners say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">"{t.body}"</p>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Starter',
    price: 150,
    desc: 'For small salons just getting started.',
    features: ['Up to 3 staff', 'Appointments & clients', 'Point of sale', 'Basic analytics', 'Online booking page'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: 350,
    desc: 'For growing salons that need more power.',
    features: ['Unlimited staff', 'Everything in Starter', 'Payroll & expenses', 'Automations & SMS', 'Inventory management', 'Multi-location (up to 3)', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 700,
    desc: 'For salon chains and franchise businesses.',
    features: ['Everything in Pro', 'Unlimited locations', 'Apprenticeship tracking', 'Custom integrations', 'Dedicated account manager', 'SLA support'],
    highlight: false,
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-3">Simple pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Pay as you grow</h2>
          <p className="text-gray-500 mt-3">All plans include a 14-day free trial. No credit card required.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map(p => (
            <div key={p.name} className={`rounded-2xl p-7 border ${p.highlight ? 'bg-teal-600 border-teal-600 shadow-xl shadow-teal-200' : 'bg-white border-gray-200 shadow-sm'}`}>
              {p.highlight && (
                <span className="inline-block text-xs font-semibold text-teal-600 bg-white px-2.5 py-1 rounded-full mb-4">Most popular</span>
              )}
              <h3 className={`font-bold text-lg mb-1 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
              <p className={`text-xs mb-5 ${p.highlight ? 'text-teal-100' : 'text-gray-500'}`}>{p.desc}</p>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${p.highlight ? 'text-white' : 'text-gray-900'}`}>GHS {p.price}</span>
                <span className={`text-sm ml-1 ${p.highlight ? 'text-teal-200' : 'text-gray-400'}`}>/mo</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.highlight ? 'text-teal-200' : 'text-teal-600'}`} />
                    <span className={p.highlight ? 'text-teal-50' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={`${APP_URL}/signup`}
                className={`flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm font-semibold transition-colors ${
                  p.highlight
                    ? 'bg-white text-teal-700 hover:bg-teal-50'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}>
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Do I need a credit card to start?', a: 'No. Your 14-day trial is completely free — no card required. You only pay when you decide to subscribe.' },
  { q: 'Can I import my existing client data?', a: 'Yes. You can import clients via CSV, or add them one by one as they book.' },
  { q: 'Does GlowDesk work for barbershops?', a: 'Absolutely. GlowDesk works for any appointment-based beauty business — salons, barbershops, spas, nail studios and more.' },
  { q: 'Is my data safe?', a: 'Yes. All data is encrypted and stored securely on Google Cloud (Firebase). We never share your data with third parties.' },
  { q: 'Can my clients book online?', a: 'Yes. Every salon gets a free public booking page. Share the link on WhatsApp or Instagram and clients book themselves.' },
  { q: 'What payment methods do you accept?', a: 'We accept Paystack (cards, Mobile Money). GHS pricing — no foreign exchange surprises.' },
]

function FAQ() {
  return (
    <section id="faq" className="py-24 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Frequently asked questions</h2>
        </div>
        <div className="space-y-4">
          {FAQS.map(f => (
            <div key={f.q} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{f.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-teal-600">
      <div className="max-w-2xl mx-auto text-center">
        <Scissors className="h-10 w-10 text-teal-200 mx-auto mb-6" />
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to grow your salon?</h2>
        <p className="text-teal-100 mb-8 leading-relaxed">Join hundreds of salons across Ghana and West Africa already using GlowDesk to run smarter businesses.</p>
        <Link href={`${APP_URL}/signup`}
          className="inline-flex items-center gap-2 h-12 px-8 bg-white text-teal-700 font-bold rounded-xl text-sm hover:bg-teal-50 transition-colors shadow-lg">
          Start your free trial <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="text-teal-200 text-xs mt-4">14 days free · No credit card · Cancel anytime</p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-900 px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-10 border-b border-slate-700">
          <div className="max-w-xs">
            <Image src="/logo.png" alt="GlowDesk" width={130} height={44} className="h-9 w-auto object-contain brightness-0 invert mb-4" />
            <p className="text-slate-400 text-sm leading-relaxed">Salon management software built for West African beauty businesses.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <p className="text-white font-semibold mb-3">Product</p>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing"  className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href={`${APP_URL}/signup`} className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href={`${APP_URL}/login`}  className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Company</p>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Contact</p>
              <ul className="space-y-2 text-slate-400">
                <li><a href="mailto:hello@glowdeskapp.online" className="hover:text-white transition-colors">hello@glowdeskapp.online</a></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="text-slate-500 text-xs text-center mt-8">© {new Date().getFullYear()} GlowDesk. All rights reserved.</p>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="font-sans bg-white text-gray-900">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
