'use client'
import { formatCurrency } from '@/lib/utils'

interface Day { date: string; label: string; revenue: number }

export function RevenueChart({ days }: { days: Day[] }) {
  const max = Math.max(...days.map(d => d.revenue), 1)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="flex items-end justify-between gap-1.5 h-28">
      {days.map(day => {
        const heightPct = Math.max((day.revenue / max) * 100, day.revenue > 0 ? 8 : 3)
        const isToday   = day.date === today
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group">
            {/* Tooltip */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[10px] font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-lg px-2 py-1 shadow-sm whitespace-nowrap pointer-events-none">
              {formatCurrency(day.revenue)}
            </div>
            {/* Bar */}
            <div className="w-full flex flex-col justify-end" style={{ height: 80 }}>
              <div
                className="w-full rounded-t-lg transition-all duration-700"
                style={{
                  height:     `${heightPct}%`,
                  background: isToday
                    ? 'linear-gradient(to top, #0d9488, #2dd4bf)'
                    : 'linear-gradient(to top, #d1fae5, #a7f3d0)',
                  opacity:    day.revenue === 0 ? 0.35 : 1,
                }}
              />
            </div>
            {/* Label */}
            <p className={`text-[10px] font-semibold ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`}>
              {day.label}
            </p>
          </div>
        )
      })}
    </div>
  )
}
