'use client'
import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  salonName: string
}

export function BookingGallery({ images, salonName }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  function prev() {
    setLightbox(i => (i === null ? null : (i - 1 + images.length) % images.length))
  }
  function next() {
    setLightbox(i => (i === null ? null : (i + 1) % images.length))
  }

  return (
    <>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Our Work</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
            {images.map((url, i) => (
              <button
                key={url}
                onClick={() => setLightbox(i)}
                className="relative shrink-0 w-28 h-28 rounded-xl overflow-hidden border border-gray-100 snap-start hover:opacity-90 transition-opacity"
              >
                <Image src={url} alt={`${salonName} photo ${i + 1}`} fill className="object-cover" sizes="112px" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="relative max-w-lg w-full aspect-square rounded-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <Image src={images[lightbox]} alt={`${salonName} photo ${lightbox + 1}`} fill className="object-contain" sizes="512px" />
          </div>

          <button
            onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs">
            {lightbox + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  )
}
