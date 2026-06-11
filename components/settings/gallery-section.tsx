'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
// storageRef aliased to avoid collision with React's useRef
import { storage } from '@/lib/firebase'
import { updateSalonSettings, getSalonSettings } from '@/lib/actions/settings'
import { ImagePlus, Trash2, Loader2 } from 'lucide-react'

export function GallerySection() {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [images, setImages]     = useState<string[]>([])
  const [loaded, setLoaded]     = useState(false)   // gates upload button
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting]  = useState<string | null>(null)
  const fileRef                  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/tenant').then(r => r.ok ? r.json() : null),
      getSalonSettings(),
    ]).then(([tenant, settings]) => {
      if (tenant?.id) setTenantId(tenant.id)
      setImages(settings.galleryImages ?? [])
      setLoaded(true)
    })
  }, [])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const name    = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const fileRef = storageRef(storage, `tenants/${tenantId}/gallery/${name}`)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)
      uploaded.push(url)
    }
    const next = [...images, ...uploaded]
    setImages(next)
    await updateSalonSettings({ galleryImages: next })
    setUploading(false)
  }

  async function remove(url: string) {
    setDeleting(url)
    const next = images.filter(u => u !== url)
    setImages(next)
    await updateSalonSettings({ galleryImages: next })
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Upload photos of your salon, work, and team. These appear on your public booking page.
      </p>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${loaded && tenantId ? 'border-gray-200 dark:border-gray-700 cursor-pointer hover:border-teal-400' : 'border-gray-100 dark:border-gray-800 opacity-50 pointer-events-none'}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 text-teal-500 animate-spin mx-auto" />
        ) : (
          <>
            <ImagePlus className="h-7 w-7 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Click or drag photos here</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · max 5 MB each</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map(url => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50">
              <Image src={url} alt="Gallery" fill className="object-cover" sizes="120px" />
              <button
                onClick={() => remove(url)}
                disabled={deleting === url}
                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                {deleting === url
                  ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                  : <Trash2 className="h-5 w-5 text-white drop-shadow" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-xs text-gray-400 text-center">No photos yet.</p>
      )}
    </div>
  )
}
