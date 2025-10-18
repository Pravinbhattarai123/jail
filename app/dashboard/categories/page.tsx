'use client'
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'

export default function CategoriesPage() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    const res = await fetch('/api/admin/categories', { cache: 'no-store' })
    if (!res.ok) { setError('Failed to load categories'); return }
    const data = await res.json()
    setItems(data.categories || [])
  }

  useEffect(() => { load() }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setName(''); setDescription('')
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const onDelete = async (id: number) => {
    if (!confirm('Delete category?')) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error || 'Failed to delete')
    }
    await load()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Categories</h1>
      <Card
        title="Add Category"
        right={(
          <form onSubmit={onCreate} className="flex gap-2 items-center">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">{loading ? 'Adding…' : 'Add'}</button>
          </form>
        )}
      >
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="divide-y">
          <div className="grid grid-cols-3 gap-4 px-2 py-2 text-xs uppercase tracking-wide text-gray-500">
            <div>Name</div>
            <div>Slug</div>
            <div className="text-right">Actions</div>
          </div>
          {items.map((c) => (
            <div key={c.id} className="grid grid-cols-3 gap-4 px-2 py-3 items-center">
              <div className="font-medium text-black">{c.name}</div>
              <div className="text-gray-600">{c.slug}</div>
              <div className="text-right">
                <button onClick={() => onDelete(c.id)} className="text-xs text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="px-2 py-6 text-gray-500 text-sm">No categories yet.</div>}
        </div>
      </Card>
    </div>
  )
}
