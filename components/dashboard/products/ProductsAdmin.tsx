'use client'
import React, { useEffect, useState } from 'react'
import AddProductForm from './AddProductForm'

export default function ProductsAdmin() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [shipping, setShipping] = useState<any | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products')
      const json = await res.json()
      setProducts(json.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadShipping() {
    try {
      const res = await fetch('/api/admin/shipping')
      const j = await res.json()
      setShipping(j.settings)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { load(); loadShipping() }, [])

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Product list</h2>
          <button onClick={load} className="btn">Refresh</button>
        </div>
        {loading ? <div>Loading...</div> : (
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="p-3 border rounded-md flex gap-3">
                <img src={p.images?.[0]?.url || '/file.svg'} alt={p.title} className="w-24 h-24 object-cover rounded" />
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-muted">{p.subcategoryId ? `Subcategory ${p.subcategoryId}` : ''}</div>
                  <div className="text-sm">{p.currency} {p.price}</div>
                  {p.weight && (
                    <div className="text-xs text-gray-600">Weight: {p.weight}</div>
                  )}
                  {Array.isArray((p as any).materials) && (p as any).materials.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(p as any).materials.map((m: string) => (
                        <span key={m} className="px-2 py-0.5 text-[10px] rounded bg-gray-100 border">{m}</span>
                      ))}
                    </div>
                  )}
                  {Array.isArray((p as any).colorsRel) && (p as any).colorsRel.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(p as any).colorsRel.map((c: any) => (
                        <span key={c.id} className="px-2 py-0.5 text-[10px] rounded border" style={{ backgroundColor: c.hex || '#fff' }}>{c.name}</span>
                      ))}
                    </div>
                  )}
                  {Boolean((p as any).attributes) && (
                    <div className="mt-1 text-xs text-gray-600 line-clamp-1">Attrs: {JSON.stringify((p as any).attributes)}</div>
                  )}
                  {p.videoUrl && (
                    <div className="mt-1 text-xs text-gray-600">Has video: <a href={p.videoUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open</a></div>
                  )}
                  {p.sizes && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(typeof p.sizes === 'string' ? p.sizes.split(',') : p.sizes).filter(Boolean).map((s:string) => (
                        <span key={s} className="px-2 py-0.5 text-xs rounded bg-gray-100 border">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <AddProductForm onSuccess={load} />
        {/* Simple Shipping Settings card */}
        <div className="mt-6 p-4 border rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Shipping Settings</h3>
            <button onClick={loadShipping} className="btn btn-xs">Refresh</button>
          </div>
          {shipping ? (
            <form onSubmit={async (e)=>{
              e.preventDefault()
              const form = e.currentTarget as HTMLFormElement
              const payload = {
                processingDaysMin: Number((form.elements.namedItem('pmin') as any).value || 1),
                processingDaysMax: Number((form.elements.namedItem('pmax') as any).value || 2),
                transitDaysMin: Number((form.elements.namedItem('tmin') as any).value || 2),
                transitDaysMax: Number((form.elements.namedItem('tmax') as any).value || 5),
                weekendDelivery: (form.elements.namedItem('weekend') as HTMLInputElement).checked,
              }
              const res = await fetch('/api/admin/shipping', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
              const j = await res.json().catch(()=>null)
              setShipping(j?.settings || payload)
              alert('Saved')
            }}>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-sm">Proc. Min <input name="pmin" defaultValue={shipping.processingDaysMin} className="w-full border rounded px-2 py-1" /></label>
                <label className="text-sm">Proc. Max <input name="pmax" defaultValue={shipping.processingDaysMax} className="w-full border rounded px-2 py-1" /></label>
                <label className="text-sm">Transit Min <input name="tmin" defaultValue={shipping.transitDaysMin} className="w-full border rounded px-2 py-1" /></label>
                <label className="text-sm">Transit Max <input name="tmax" defaultValue={shipping.transitDaysMax} className="w-full border rounded px-2 py-1" /></label>
              </div>
              <label className="inline-flex items-center gap-2 mt-2 text-sm"><input name="weekend" type="checkbox" defaultChecked={!!shipping.weekendDelivery} /> Weekend delivery enabled</label>
              <div className="mt-3"><button className="btn btn-primary btn-sm" type="submit">Save</button></div>
            </form>
          ) : <div className="text-sm text-gray-600">Loading…</div>}
        </div>
      </div>
    </div>
  )
}
