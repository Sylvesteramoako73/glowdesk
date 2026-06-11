'use client'
import { useState, useTransition, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Loader2, X, Check, Gift } from 'lucide-react'
import { createService, updateService, deleteService } from '@/lib/actions/services'
import { getPackages, createPackage, updatePackage, deletePackage } from '@/lib/actions/packages'
import type { ServicePackage, PackageItem } from '@/lib/actions/packages'
import { formatCurrency } from '@/lib/utils'

import type { ServiceWithStats } from '@/lib/types'

const CATEGORIES = ['Hair', 'Nails', 'Skin & Spa', 'Brows & Lashes', 'Packages']

const EMPTY_FORM = { name: '', category: 'Hair', description: '', duration: 60, price: 0, isPopular: false }

export function ServicesView({ services: initial }: { services: ServiceWithStats[] }) {
  const [tab, setTab]           = useState<'services' | 'packages'>('services')
  const [services, setServices] = useState(initial)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editService, setEditService] = useState<ServiceWithStats | null>(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [, startTransition]     = useTransition()
  const [saving, setSaving]     = useState(false)

  const categories = [...new Set(services.map(s => s.category))]
  const filtered   = services.filter(s =>
    (category === 'all' || s.category === category) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalBookings = services.reduce((s, sv) => s + sv.bookingsThisMonth, 0)
  const totalRevenue  = services.reduce((s, sv) => s + sv.revenueThisMonth, 0)

  function openNew() {
    setEditService(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(svc: ServiceWithStats) {
    setEditService(svc)
    setForm({
      name: svc.name, category: svc.category,
      description: svc.description ?? '', duration: svc.duration,
      price: svc.price, isPopular: svc.isPopular,
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditService(null)
    setForm(EMPTY_FORM)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    startTransition(async () => {
      if (editService) {
        const updated = await updateService(editService.id, { ...form, duration: Number(form.duration), price: Number(form.price) })
        setServices(prev => prev.map(s => s.id === editService.id ? { ...s, ...updated } : s))
      } else {
        const created = await createService({ ...form, duration: Number(form.duration), price: Number(form.price) })
        setServices(prev => [...prev, { ...created, bookingsThisMonth: 0, revenueThisMonth: 0 }])
      }
      closeForm()
      setSaving(false)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteService(id)
      setServices(prev => prev.filter(s => s.id !== id))
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">{services.length} services</p>
        </div>
        {tab === 'services'
          ? <button onClick={openNew} className="btn-primary"><Plus className="h-5 w-5" /> Add Service</button>
          : null}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('services')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'services' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Search className="h-4 w-4" /> Services
        </button>
        <button
          onClick={() => setTab('packages')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'packages' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Gift className="h-4 w-4" /> Packages
        </button>
      </div>

      {tab === 'packages' && <PackagesTab services={services} />}

      {tab === 'services' && <><div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Services',   value: String(services.length) },
          { label: 'Bookings This Mo', value: String(totalBookings) },
          { label: 'Revenue This Mo',  value: formatCurrency(totalRevenue) },
        ].map(s => (
          <div key={s.label} className="stat-box">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9 w-56" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="form-input w-40">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Service Name</th><th>Category</th><th>Duration</th>
              <th>Bookings (mo)</th><th className="text-right">Revenue (mo)</th>
              <th className="text-right">Price</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(service => (
              <tr key={service.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.name}</span>
                    {service.isPopular && <span className="badge badge-yellow">Popular</span>}
                  </div>
                  {service.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{service.description}</p>}
                </td>
                <td className="text-gray-600">{service.category}</td>
                <td className="text-gray-600">
                  {service.duration >= 60
                    ? `${Math.floor(service.duration / 60)}h${service.duration % 60 ? ` ${service.duration % 60}m` : ''}`
                    : `${service.duration}m`}
                </td>
                <td className="text-gray-700">{service.bookingsThisMonth}</td>
                <td className="text-right text-gray-700">{formatCurrency(service.revenueThisMonth)}</td>
                <td className="text-right font-medium">{formatCurrency(service.price)}</td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(service)} className="btn-ghost h-8 w-8 p-0 justify-center"><Edit2 className="h-5 w-5" /></button>
                    <button onClick={() => handleDelete(service.id)} className="btn-ghost h-8 w-8 p-0 justify-center text-red-500 hover:bg-red-50"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-500">No services found.</div>}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{editService ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={closeForm} className="btn-ghost h-8 w-8 p-0 justify-center"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input w-full" />
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-input w-full">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Duration (minutes) *</label>
                  <input type="number" required min={5} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="form-input w-full" />
                </div>
                <div>
                  <label className="form-label">Price (₵) *</label>
                  <input type="number" required min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="form-input w-full" />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Description</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input w-full" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isPopular: !f.isPopular }))}
                    className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer focus:outline-none ${form.isPopular ? 'bg-gray-900' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${form.isPopular ? 'translate-x-4' : ''}`} />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mark as popular</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  {editService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>}

    </div>
  )
}

// ─── Packages Tab ────────────────────────────────────────────────────────────

const EMPTY_PKG = { name: '', description: '', price: 0 }

function PackagesTab({ services }: { services: ServiceWithStats[] }) {
  const [packages, setPackages]   = useState<ServicePackage[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<ServicePackage | null>(null)
  const [form, setForm]           = useState(EMPTY_PKG)
  const [picked, setPicked]       = useState<string[]>([])  // serviceIds in this package
  const [saving, setSaving]       = useState(false)
  const [, startTransition]       = useTransition()

  useEffect(() => {
    getPackages().then(pkgs => { setPackages(pkgs); setLoading(false) })
  }, [])

  function openNew() {
    setEditing(null); setForm(EMPTY_PKG); setPicked([]); setShowForm(true)
  }

  function openEdit(pkg: ServicePackage) {
    setEditing(pkg)
    setForm({ name: pkg.name, description: pkg.description, price: pkg.price })
    setPicked(pkg.items.map(i => i.serviceId))
    setShowForm(true)
  }

  function toggleService(id: string) {
    setPicked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const pickedItems: PackageItem[] = picked.flatMap(id => {
    const svc = services.find(s => s.id === id)
    return svc ? [{ serviceId: svc.id, serviceName: svc.name, duration: svc.duration, originalPrice: svc.price }] : []
  })

  const originalTotal = pickedItems.reduce((s, i) => s + i.originalPrice, 0)
  const saving2 = saving

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (picked.length < 2) return
    setSaving(true)
    startTransition(async () => {
      const data = { name: form.name, description: form.description, items: pickedItems, price: Number(form.price) }
      if (editing) {
        await updatePackage(editing.id, data)
        setPackages(prev => prev.map(p => p.id === editing.id ? { ...p, ...data, totalDuration: pickedItems.reduce((s, i) => s + i.duration, 0), originalTotal } : p))
      } else {
        const created = await createPackage(data)
        setPackages(prev => [...prev, created])
      }
      setShowForm(false); setSaving(false)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePackage(id)
      setPackages(prev => prev.filter(p => p.id !== id))
    })
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-gray-400 py-8"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">Bundle services together at a special price. Packages appear on your booking page.</p>
        <button onClick={openNew} className="btn-primary"><Plus className="h-5 w-5" /> New Package</button>
      </div>

      {packages.length === 0 ? (
        <div className="card p-12 text-center">
          <Gift className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No packages yet. Create one to offer bundle deals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {packages.map(pkg => {
            const savings = pkg.originalTotal - pkg.price
            return (
              <div key={pkg.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{pkg.name}</h3>
                    {pkg.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pkg.description}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(pkg)} className="btn-ghost h-7 w-7 p-0 justify-center"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(pkg.id)} className="btn-ghost h-7 w-7 p-0 justify-center text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="space-y-1">
                  {pkg.items.map(item => (
                    <div key={item.serviceId} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>• {item.serviceName}</span>
                      <span>{formatCurrency(item.originalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(pkg.price)}</span>
                    {savings > 0 && (
                      <span className="ml-2 text-xs line-through text-gray-400">{formatCurrency(pkg.originalTotal)}</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      Save {formatCurrency(savings)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{editing ? 'Edit Package' : 'New Package'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost h-8 w-8 p-0 justify-center"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label">Package Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input w-full" placeholder="e.g. Bridal Glow Package" />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Description</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input w-full" placeholder="Short description for clients" />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Bundle Price (₵) *</label>
                  <div className="flex items-center gap-3">
                    <input type="number" required min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="form-input w-36" />
                    {originalTotal > 0 && (
                      <span className="text-xs text-gray-500">Original: {formatCurrency(originalTotal)}
                        {Number(form.price) < originalTotal && <span className="ml-1 text-green-600 font-medium">· Save {formatCurrency(originalTotal - Number(form.price))}</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Services in this package * (pick at least 2)</label>
                <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  {services.map(svc => (
                    <label key={svc.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <input type="checkbox" checked={picked.includes(svc.id)} onChange={() => toggleService(svc.id)} className="rounded" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{svc.name}</span>
                      <span className="text-xs text-gray-400">{formatCurrency(svc.price)}</span>
                    </label>
                  ))}
                </div>
                {picked.length < 2 && picked.length > 0 && <p className="text-xs text-red-500 mt-1">Select at least 2 services.</p>}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving2 || picked.length < 2} className="btn-primary">
                  {saving2 ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  {editing ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
