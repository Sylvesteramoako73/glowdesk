'use client'
import { useState, useTransition } from 'react'
import {
  Plus, Search, Edit2, Trash2, Loader2, X, Check,
  AlertTriangle, Package, ShoppingCart, ArrowUp, ArrowDown,
} from 'lucide-react'
import Link from 'next/link'
import {
  createProduct, updateProduct, adjustStock, deleteProduct,
  type Product,
} from '@/lib/actions/inventory'
import { formatCurrency, cn } from '@/lib/utils'

const CATEGORIES = [
  'Hair Care', 'Skin Care', 'Nail Care', 'Styling',
  'Tools & Equipment', 'Supplies', 'Other',
]

const EMPTY_FORM = {
  name: '', brand: '', category: 'Hair Care', sku: '',
  stockLevel: 10, lowStockThreshold: 3, unit: 'units',
  costPrice: 0, sellingPrice: 0,
}

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock === 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
      Out of stock
    </span>
  )
  if (stock <= threshold) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
      <AlertTriangle className="h-3 w-3" /> Low stock
    </span>
  )
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
      In stock
    </span>
  )
}

export function ProductsView({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editProd, setEditProd] = useState<Product | null>(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [adjId, setAdjId]       = useState<string | null>(null)
  const [adjDelta, setAdjDelta] = useState('')
  const [adjNote, setAdjNote]   = useState('')
  const [, startTransition]     = useTransition()

  const active = products.filter(p => p.isActive)
  const filtered = active.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = p.name.toLowerCase().includes(q) ||
      (p.brand ?? '').toLowerCase().includes(q)
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  const inStock    = active.filter(p => p.stockLevel > 0).length
  const lowStock   = active.filter(p => p.stockLevel > 0 && p.stockLevel <= p.lowStockThreshold).length
  const outOfStock = active.filter(p => p.stockLevel === 0).length

  function openNew() {
    setEditProd(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }
  function openEdit(p: Product) {
    setEditProd(p)
    setForm({
      name: p.name, brand: p.brand ?? '', category: p.category, sku: p.sku ?? '',
      stockLevel: p.stockLevel, lowStockThreshold: p.lowStockThreshold, unit: p.unit,
      costPrice: p.costPrice, sellingPrice: p.sellingPrice,
    })
    setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditProd(null) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const data = {
      ...form,
      brand: form.brand || null,
      sku: form.sku || null,
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      stockLevel: Number(form.stockLevel),
      lowStockThreshold: Number(form.lowStockThreshold),
    }
    if (editProd) {
      const updated = await updateProduct(editProd.id, data)
      setProducts(prev => prev.map(p => p.id === editProd.id ? updated : p))
    } else {
      const created = await createProduct(data as Parameters<typeof createProduct>[0])
      setProducts(prev => [...prev, created])
    }
    closeForm()
    setSaving(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Remove this product?')) return
    startTransition(async () => {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    })
  }

  async function handleAdjust(id: string) {
    const delta = parseInt(adjDelta)
    if (isNaN(delta) || delta === 0) return
    const newLevel = await adjustStock(id, delta, adjNote || undefined)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stockLevel: newLevel } : p))
    setAdjId(null); setAdjDelta(''); setAdjNote('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog and sell at the POS</p>
        </div>
        <button onClick={openNew} className="btn-primary shrink-0">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-box">
          <p className="text-xs text-gray-500 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{active.length}</p>
        </div>
        <div className="stat-box">
          <p className="text-xs text-gray-500 mb-1">In Stock</p>
          <p className="text-2xl font-bold text-green-600">{inStock}</p>
        </div>
        <div className="stat-box">
          <p className="text-xs text-gray-500 mb-1">Low / Out</p>
          <p className="text-2xl font-bold">
            <span className={lowStock > 0 ? 'text-amber-500' : 'text-gray-400'}>{lowStock}</span>
            <span className="text-gray-300 dark:text-gray-600 mx-1">/</span>
            <span className={outOfStock > 0 ? 'text-red-500' : 'text-gray-400'}>{outOfStock}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-9 w-full"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                category === cat
                  ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No products yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Add your first product to start selling</p>
          <button onClick={openNew} className="btn-primary mx-auto">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div
              key={product.id}
              className={cn(
                'card p-4 flex flex-col gap-3 transition-all duration-150',
                product.stockLevel === 0 ? 'opacity-70' : 'hover:-translate-y-0.5'
              )}
            >
              {/* Icon + actions */}
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 flex items-center justify-center">
                  <Package className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(product)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors cursor-pointer"
                    title="Edit product"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    title="Remove product"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">{product.name}</p>
                {product.brand && <p className="text-xs text-gray-500 truncate">{product.brand}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
              </div>

              {/* Price + stock */}
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(product.sellingPrice)}</p>
                  <p className="text-xs text-gray-400">{product.stockLevel} {product.unit} left</p>
                </div>
                <StockBadge stock={product.stockLevel} threshold={product.lowStockThreshold} />
              </div>

              {/* Stock adjust */}
              {adjId === product.id ? (
                <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setAdjDelta(d => String((parseInt(d) || 0) - 1))} className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number" value={adjDelta} placeholder="±qty"
                      onChange={e => setAdjDelta(e.target.value)}
                      className="form-input flex-1 text-center text-sm h-7 px-2"
                    />
                    <button onClick={() => setAdjDelta(d => String((parseInt(d) || 0) + 1))} className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    value={adjNote} onChange={e => setAdjNote(e.target.value)}
                    placeholder="Reason (optional)"
                    className="form-input w-full text-xs h-7 px-2"
                  />
                  <div className="flex gap-1.5">
                    <button onClick={() => handleAdjust(product.id)} className="btn-primary flex-1 h-7 text-xs px-2">
                      <Check className="h-3 w-3" /> Apply
                    </button>
                    <button onClick={() => { setAdjId(null); setAdjDelta(''); setAdjNote('') }} className="btn-secondary h-7 text-xs px-2">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setAdjId(product.id); setAdjDelta('') }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-colors cursor-pointer"
                  >
                    Adjust Stock
                  </button>
                  <Link
                    href="/pos"
                    className={cn(
                      'flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-colors',
                      product.stockLevel > 0
                        ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 cursor-pointer'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed pointer-events-none'
                    )}
                  >
                    <ShoppingCart className="h-3 w-3 inline mr-1" />
                    Sell
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl">
              <h2 className="font-bold text-gray-900 dark:text-white">
                {editProd ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeForm} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Product Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. Keracare Hydrating Shampoo"
                />
              </div>

              <div>
                <label className="form-label">Brand</label>
                <input
                  value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. Keracare"
                />
              </div>

              <div>
                <label className="form-label">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="form-input w-full"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="form-label">SKU / Barcode</label>
                <input
                  value={form.sku}
                  onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. SKU-001"
                />
              </div>

              <div>
                <label className="form-label">Unit</label>
                <input
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="form-input w-full"
                  placeholder="e.g. bottles, pcs, ml"
                />
              </div>

              <div>
                <label className="form-label">Stock Quantity *</label>
                <input
                  type="number" min={0} required
                  value={form.stockLevel}
                  onChange={e => setForm(f => ({ ...f, stockLevel: Number(e.target.value) }))}
                  className="form-input w-full"
                />
              </div>

              <div>
                <label className="form-label">Low Stock Alert At</label>
                <input
                  type="number" min={0}
                  value={form.lowStockThreshold}
                  onChange={e => setForm(f => ({ ...f, lowStockThreshold: Number(e.target.value) }))}
                  className="form-input w-full"
                />
              </div>

              <div>
                <label className="form-label">Cost Price (GHS)</label>
                <input
                  type="number" min={0} step={0.01}
                  value={form.costPrice}
                  onChange={e => setForm(f => ({ ...f, costPrice: Number(e.target.value) }))}
                  className="form-input w-full"
                />
              </div>

              <div>
                <label className="form-label">Selling Price (GHS)</label>
                <input
                  type="number" min={0} step={0.01}
                  value={form.sellingPrice}
                  onChange={e => setForm(f => ({ ...f, sellingPrice: Number(e.target.value) }))}
                  className="form-input w-full"
                />
              </div>

              {form.sellingPrice > 0 && form.costPrice > 0 && (
                <div className="col-span-2 bg-teal-50 dark:bg-teal-900/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">Profit margin</p>
                  <p className="text-sm font-bold text-teal-700 dark:text-teal-300">
                    {Math.round((form.sellingPrice - form.costPrice) / form.sellingPrice * 100)}%
                    &nbsp;·&nbsp;{formatCurrency(form.sellingPrice - form.costPrice)} per unit
                  </p>
                </div>
              )}

              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editProd ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
