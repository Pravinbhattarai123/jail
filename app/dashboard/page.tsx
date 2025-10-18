"use client"
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'

type Insights = {
  totals: { products: number; categories: number; subcategories: number }
  recentProducts: Array<{
    id: number
    title: string
    slug: string
    price: string | number | null
    currency: string | null
    createdAt: string
    category: string | null
    subcategory: string | null
    brand: string | null
    imageUrl: string | null
  }>
}

export default function DashboardOverviewPage() {
  const [data, setData] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const r = await fetch('/api/admin/insights', { cache: 'no-store' })
        const j = await r.json()
        if (!cancelled) {
          if (r.ok) setData(j.data || j)
          else setError(j?.error || 'Failed to load insights')
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load insights')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <div className="text-sm text-gray-500">Loading dashboard…</div>
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!data) return null

  const { totals, recentProducts } = data

  return (
    <div className="space-y-6">
      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Total Products">
          <div className="text-3xl font-semibold text-gray-900">{totals.products}</div>
          <div className="text-xs text-gray-500 mt-1">All products in catalog</div>
        </Card>
        <Card title="Total Categories">
          <div className="text-3xl font-semibold text-gray-900">{totals.categories}</div>
          <div className="text-xs text-gray-500 mt-1">Top-level categories</div>
        </Card>
        <Card title="Total Subcategories">
          <div className="text-3xl font-semibold text-gray-900">{totals.subcategories}</div>
          <div className="text-xs text-gray-500 mt-1">Subdivisions under categories</div>
        </Card>
      </div>

      {/* Recent products */}
      <Card title="Recently Added Products" subtitle="Latest 5 by creation date">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Subcategory</th>
                <th className="py-2 pr-4">Brand</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="py-2 pr-4 flex items-center gap-3">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.title} className="h-9 w-9 rounded object-cover" />
                    ) : (
                      <div className="h-9 w-9 rounded bg-gray-100" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{p.title}</div>
                      <div className="text-xs text-gray-500">/{p.slug}</div>
                    </div>
                  </td>
                  <td className="py-2 pr-4">{p.category || '-'}</td>
                  <td className="py-2 pr-4">{p.subcategory || '-'}</td>
                  <td className="py-2 pr-4">{p.brand || '-'}</td>
                  <td className="py-2 pr-4">{p.price ? `${p.currency || ''} ${p.price}` : '-'}</td>
                  <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

