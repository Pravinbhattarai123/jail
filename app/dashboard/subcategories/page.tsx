'use client'
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'

export default function SubcategoriesPage() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('') // selected category id (string) or slug
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    const qs = category ? `?category=${encodeURIComponent(category)}` : ''
    const res = await fetch('/api/admin/subcategories' + qs, { cache: 'no-store' })
    if (!res.ok) { setError('Failed to load subcategories'); return }
    const data = await res.json()
    setItems(data.subcategories || [])
  }

  useEffect(() => { load() }, [category])

  // Load categories for dropdown
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/admin/categories', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load categories')
        const data = await res.json()
        setCategories(data.categories || [])
      } catch (e: any) {
        // Surface error but don't block subcategory list interactions
        setError((prev) => prev || e.message)
      }
    }
    run()
  }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (!category) {
        throw new Error('Please select a category')
      }
      const body: any = { name }
      const maybeId = Number(category)
      if (!Number.isNaN(maybeId)) body.categoryId = maybeId
      else if (category) body.categorySlug = category

      const res = await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setName('')
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const onDelete = async (id: number) => {
    if (!confirm('Delete subcategory?')) return
    const res = await fetch(`/api/admin/subcategories/${id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error || 'Failed to delete')
    }
    await load()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Subcategories</h1>
      <Card
        title="Add Subcategory"
        right={(
          <form onSubmit={onCreate} className="flex gap-2 items-center">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All categories (no filter)</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} ({c.slug})
                </option>
              ))}
            </select>
            <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">{loading ? 'Adding…' : 'Add'}</button>
          </form>
        )}
      >
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="divide-y">
          <div className="grid grid-cols-3 gap-4 px-2 py-2 text-xs uppercase tracking-wide text-gray-500">
            <div>Name</div>
            <div>Slug · Category</div>
            <div className="text-right">Actions</div>
          </div>
          {items.map((s) => (
            <div key={s.id} className="grid grid-cols-3 gap-4 px-2 py-3 items-center">
              <div className="font-medium text-black">{s.name}</div>
              <div className="text-gray-600">{s.slug} • {s.category?.name}</div>
              <div className="text-right">
                <button onClick={() => onDelete(s.id)} className="text-xs text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="px-2 py-6 text-gray-500 text-sm">No subcategories yet.</div>}
        </div>
      </Card>
    </div>
  )
}
