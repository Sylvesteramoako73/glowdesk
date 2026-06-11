'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Calendar, Users, CreditCard, BarChart2, Smartphone, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const APP_URL = 'https://app.glowdeskapp.online'

const SLIDES = [
  {
    tag: 'Sound familiar?',
    title: 'Still running your salon with WhatsApp & a notebook?',
    body: 'Missed bookings. Forgotten clients. No way to track revenue. Hours of admin every week. You deserve better tools.',
    bg: 'from-slate-900 via-slate-800 to-zinc-900',
    pains: ['Double-bookings with no-show clients', 'No record of who owes what', 'Staff schedules on paper', 'Revenue you can\'t track'],
  },
  {
    tag: 'Meet GlowDesk',
    title: 'One platform for your whole salon',
    body: 'Appointments, clients, staff, payments and analytics — all in one place. Built specifically for beauty businesses in Ghana & West Africa.',
    bg: 'from-teal-900 via-slate-900 to-slate-900',
    features: [
      { icon: Calendar,   label: 'Smart booking',       color: 'bg-teal-500'   },
      { icon: Users,      label: 'Client management',   color: 'bg-blue-500'   },
      { icon: CreditCard, label: 'Payments & POS',      color: 'bg-violet-500' },
      { icon: BarChart2,  label: 'Revenue analytics',   color: 'bg-amber-500'  },
      { icon: Smartphone, label: 'Online booking page', color: 'bg-rose-500'   },
      { icon: Zap,        label: 'SMS automations',     color: 'bg-indigo-500' },
    ],
  },
  {
    tag: 'Online booking',
    title: 'Clients book themselves, 24/7',
    body: 'Share your booking link on WhatsApp or Instagram. Clients pick their service, choose a time, and pay a deposit — all without calling you.',
    bg: 'from-blue-900 via-slate-900 to-slate-900',
    stats: [
      { value: '80%', label: 'fewer no-shows' },
      { value: '24/7', label: 'bookings accepted' },
      { value: '2 min', label: 'to set up' },
    ],
  },
  {
    tag: 'Get paid faster',
    title: 'Accept Mobile Money deposits at booking',
    body: 'Salons on GlowDesk collect deposits via MTN MoMo, Vodafone Cash or AirtelTigo. Money goes straight to the salon. No bank account needed.',
    bg: 'from-violet-900 via-slate-900 to-slate-900',
    stats: [
      { value: 'MoMo', label: 'MTN · Vodafone · AirtelTigo' },
      { value: 'GHS', label: 'Local currency pricing' },
      { value: '0%', label: 'Platform cut on deposits' },
    ],
  },
  {
    tag: 'Start today',
    title: 'Ready to grow your salon?',
    body: '14-day free trial. No credit card. Cancel anytime. Join hundreds of salons in Ghana already running smarter with GlowDesk.',
    bg: 'from-teal-900 via-teal-800 to-slate-900',
    isCta: true,
  },
]

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false)
  const [slide, setSlide]     = useState(0)

  useEffect(() => {
    if (!localStorage.getItem('gd_intro_seen')) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem('gd_intro_seen', '1')
    setVisible(false)
  }

  if (!visible) return null

  const s      = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={dismiss} />

      <div className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl shadow-black/60 bg-gradient-to-br ${s.bg}`}>

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors cursor-pointer"
          aria-label="Skip intro"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pt-8 pb-7 flex flex-col min-h-[460px]">

          {/* Logo on CTA slide */}
          {s.isCta && (
            <div className="mb-5">
              <Image src="/logo.png" alt="GlowDesk" width={150} height={50} className="h-10 w-auto brightness-0 invert opacity-90" />
            </div>
          )}

          {/* Tag */}
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3">{s.tag}</span>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white leading-snug mb-3">{s.title}</h2>

          {/* Body */}
          <p className="text-sm text-white/60 leading-relaxed mb-5">{s.body}</p>

          {/* Pain points (slide 1) */}
          {'pains' in s && s.pains && (
            <ul className="space-y-2 mb-4">
              {s.pains.map(p => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          )}

          {/* Feature grid (slide 2) */}
          {'features' in s && s.features && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {s.features.map(f => {
                const Icon = f.icon
                return (
                  <div key={f.label} className="flex items-center gap-2.5 bg-white/8 rounded-xl px-3 py-2.5">
                    <div className={`h-7 w-7 rounded-lg ${f.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-white/80 text-xs font-medium">{f.label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Stats (slides 3 & 4) */}
          {'stats' in s && s.stats && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {s.stats.map(st => (
                <div key={st.label} className="bg-white/8 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-white">{st.value}</p>
                  <p className="text-[11px] text-white/50 leading-tight mt-0.5">{st.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* CTA buttons (last slide) */}
          {s.isCta && (
            <div className="flex flex-col gap-2.5 mb-4">
              <Link href={`${APP_URL}/signup`} onClick={dismiss}
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-teal-400 hover:bg-teal-300 text-teal-900 font-bold text-sm transition-colors cursor-pointer">
                Start free 14-day trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`${APP_URL}/login`} onClick={dismiss}
                className="flex items-center justify-center h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-sm font-medium transition-colors cursor-pointer">
                Sign in to existing account
              </Link>
            </div>
          )}

          <div className="flex-1" />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === slide ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/25 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              {slide > 0 && (
                <button onClick={() => setSlide(s => s - 1)}
                  className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition-colors cursor-pointer">
                  Back
                </button>
              )}
              {!isLast && (
                <button onClick={() => setSlide(s => s + 1)}
                  className="h-9 px-5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-white/90 transition-colors cursor-pointer flex items-center gap-1.5">
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
