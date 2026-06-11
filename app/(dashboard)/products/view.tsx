'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, Package, AlertTriangle, TrendingUp } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'
import type { Product } from '@/lib/actions/inventory'

const CATEGORIES = ['All', 'Hair Care', 'Skin Care', 'Nail Care', 'Styling', 'Tools & Equipment', 'Supplies', 'Other']

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock === 0)            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">Out of stock</span>
  if (stock <= threshold)     return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"><AlertTriangle className="h-3 w-3" /> Low stock</span>
  return                             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">In stock</span>
}

export function ProductsView({ products }: { products: Product[] }) {
  const [search, setSearch]   = useState('')
  const [category, setCategory] = useState('All')

  const active = products.filter(p => p.isActive)
  const filtered = active.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  const inStock    = active.filter(p => p.stockLevel > 0).length
  const lowStock   = active.filter(p => p.stockLevel > 0 && p.stockLevel <= p.lowStockThreshold).length
  const outOfStock = active.filter(p => p.stockLevel === 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Browse your product catalog for in-store sales</p>
        </div>
        <Link href="/pos" className="btn-primary">
          <ShoppingCart className="h-4 w-4" /> New Sale
        </Link>
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
        <div className="stat-box flex flex-col">
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
          {CATEGORIES.map(cat => (
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
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div
              key={product.id}
              className={cn(
                'card p-4 flex flex-col gap-3 transition-all duration-150',
                product.stockLevel === 0 ? 'opacity-60' : 'hover:-translate-y-0.5'
              )}
            >
              {/* Icon area */}
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white leading-snug truncate">{product.name}</p>
                {product.brand && <p className="text-xs text-gray-500 truncate">{product.brand}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
              </div>

              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(product.sellingPrice)}</p>
                  <p className="text-xs text-gray-400">{product.stockLevel} {product.unit} left</p>
                </div>
                <StockBadge stock={product.stockLevel} threshold={product.lowStockThreshold} />
              </div>

              <Link
                href="/pos"
                className={cn(
                  'w-full text-center py-2 rounded-lg text-xs font-medium transition-colors',
                  product.stockLevel > 0
                    ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed pointer-events-none'
                )}
              >
                {product.stockLevel > 0 ? 'Sell in POS' : 'Unavailable'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
