'use client'
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'

export default function BrandsPage() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async (q?: string) => {
    setError('')
    const res = await fetch('/api/admin/brands' + (q ? `?q=${encodeURIComponent(q)}` : ''), { cache: 'no-store' })
    if (!res.ok) { setError('Failed to load brands'); return }
    const data = await res.json()
    setItems(data.brands || [])
  }

  useEffect(() => { load() }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
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
    if (!confirm('Delete brand?')) return
    const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error || 'Failed to delete')
    }
    await load()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Brands</h1>
      <Card
        title="Add Brand"
        right={(
          <form onSubmit={onCreate} className="flex gap-2 items-center">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
          {items.map((b) => (
            <div key={b.id} className="grid grid-cols-3 gap-4 px-2 py-3 items-center">
              <div className="font-medium text-black">{b.name}</div>
              <div className="text-gray-600">{b.slug}</div>
              <div className="text-right">
                <button onClick={() => onDelete(b.id)} className="text-xs text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="px-2 py-6 text-gray-500 text-sm">No brands yet.</div>}
        </div>
      </Card>
    </div>
  )
}
