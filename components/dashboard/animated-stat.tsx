'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string   // e.g. "GH₵ 1,240" or "7"
  duration?: number
}

function extractNumber(str: string): { prefix: string; num: number; suffix: string } {
  const match = str.match(/^([^\d]*)(\d[\d,.]*)(.*)$/)
  if (!match) return { prefix: '', num: 0, suffix: str }
  return {
    prefix: match[1],
    num:    parseFloat(match[2].replace(/,/g, '')),
    suffix: match[3],
  }
}

function formatLike(original: string, n: number): string {
  // Preserve comma-formatting if original had it
  if (original.includes(',') || original.includes('.')) {
    return n.toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }
  return String(Math.round(n))
}

export function AnimatedStat({ value, duration = 1200 }: Props) {
  const { prefix, num, suffix } = extractNumber(value)
  const [display, setDisplay] = useState('0')
  const startRef = useRef<number | null>(null)
  const rafRef   = useRef<number | null>(null)

  useEffect(() => {
    if (num === 0) { setDisplay('0'); return }
    startRef.current = null

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const elapsed  = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplay(formatLike(value, num * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [num, duration, value])

  return <span>{prefix}{display}{suffix}</span>
}
