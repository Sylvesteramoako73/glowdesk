import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GlowDesk — Salon Management Software',
  description: 'Run your salon smarter. Appointments, clients, staff, inventory, payroll and analytics — all in one place. Start your 14-day free trial.',
  openGraph: {
    title: 'GlowDesk — Salon Management Software',
    description: 'Run your salon smarter. Start your 14-day free trial.',
    url: 'https://glowdeskapp.online',
    siteName: 'GlowDesk',
  },
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
