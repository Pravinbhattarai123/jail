'use client'
import React, { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'

export default function UsersPage() {
  const [items, setItems] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [isActive, setIsActive] = useState<'all' | 'true' | 'false'>('all')

  const load = async () => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (isActive !== 'all') params.set('isActive', isActive)
    const res = await fetch('/api/admin/users' + (params.toString() ? `?${params}` : ''), { cache: 'no-store' })
    const data = await res.json()
    setItems(data.users || [])
  }

  useEffect(() => { load() }, [])

  const onSuspend = async (id: number) => {
    if (!confirm('Suspend this user?')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH' })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      alert(d.error || 'Failed to suspend')
    }
    await load()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <Card
        right={(
          <div className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/email/phone" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select value={isActive} onChange={(e) => setIsActive(e.target.value as any)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Suspended</option>
            </select>
            <button onClick={load} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Apply</button>
          </div>
        )}
      >
        <div className="divide-y">
          <div className="grid grid-cols-4 gap-4 px-2 py-2 text-xs uppercase tracking-wide text-gray-500">
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div className="text-right">Status</div>
          </div>
          {items.map((u) => (
            <div key={u.id} className="grid grid-cols-4 gap-4 px-2 py-3 items-center">
              <div className="font-medium text-gray-900">{u.name || u.email}</div>
              <div className="text-gray-600">{u.email}</div>
              <div className="text-gray-600">{u.role}</div>
              <div className="text-right">
                {u.isActive ? (
                  <button onClick={() => onSuspend(u.id)} className="text-xs text-red-600 hover:underline">Suspend</button>
                ) : (
                  <span className="text-xs text-gray-400">Suspended</span>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="px-2 py-6 text-gray-500 text-sm">No users found.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
