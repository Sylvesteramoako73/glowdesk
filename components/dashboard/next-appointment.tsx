'use client'
import { useEffect, useState } from 'react'
import { Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Props {
  clientName: string
  services: string
  startTime: string
}

function minutesUntil(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 60000))
}

export function NextAppointmentBanner({ clientName, services, startTime }: Props) {
  const [mins, setMins] = useState(minutesUntil(startTime))

  useEffect(() => {
    const id = setInterval(() => setMins(minutesUntil(startTime)), 30000)
    return () => clearInterval(id)
  }, [startTime])

  const urgent = mins <= 10

  return (
    <Link
      href="/appointments"
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all hover:-translate-y-0.5 duration-200 group"
      style={{
        background: urgent
          ? 'linear-gradient(135deg,#fef3c7,#fde68a)'
          : 'linear-gradient(135deg,#f0fdfa,#ccfbf1)',
        borderColor: urgent ? '#fbbf24' : '#5eead4',
        boxShadow: urgent
          ? '0 4px 16px rgba(251,191,36,0.25)'
          : '0 4px 16px rgba(13,148,136,0.15)',
      }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: urgent ? '#f59e0b' : '#0d9488' }}
      >
        <Clock className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: urgent ? '#92400e' : '#0f766e' }}>
          Next up
        </p>
        <p className="text-sm font-bold text-gray-900 truncate">{clientName}</p>
        <p className="text-xs text-gray-500 truncate">{services}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xl font-black" style={{ color: urgent ? '#b45309' : '#0d9488' }}>
          {mins}m
        </p>
        <p className="text-[10px] text-gray-400">{startTime}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  )
}
