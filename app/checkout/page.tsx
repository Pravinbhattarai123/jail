"use client"
import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type Line = { productId: number; title: string; imageUrl?: string; unitPrice: string; quantity: number; lineTotal: string; href: string; inStock: boolean }

function CheckoutInner() {
  const params = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lines, setLines] = useState<Line[]>([])
  const [totals, setTotals] = useState<{ subtotal: string; tax: string; shipping: string; discount: string; total: string; currency: string } | null>(null)
  const [addr, setAddr] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', countryCode: 'IN', label: 'Default' })
  const [saveDefault, setSaveDefault] = useState(true)
  const [creating, setCreating] = useState(false)

  const items = useMemo(() => {
    const from = params.get('from')
    const ids = params.get('items')
    if (from === 'cart') return { useCart: true }
    if (ids) {
      return ids.split(',').map((id) => ({ productId: Number(id), quantity: 1 })).filter((x) => x.productId)
    }
    if (from === 'wishlist') return { useWishlist: true }
    // Default: use cart first if available, otherwise wishlist
    return { useCart: true }
  }, [params])

  useEffect(() => {
    let active = true
    async function run() {
      setLoading(true)
      try {
        // Prefill address
  const addrRes = await fetch('/api/public/addresses/me', { cache: 'no-store', credentials: 'include' as RequestCredentials })
        if (addrRes.ok) {
          const data = await addrRes.json()
          if (data?.address) {
            setAddr((a) => ({ ...a, ...data.address }))
          }
        }
        // Preview items
        const prevRes = await fetch('/api/public/checkout/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' as RequestCredentials,
          body: JSON.stringify(items),
        })
        const prev = await prevRes.json()
        if (!prevRes.ok) throw new Error(prev?.error || 'Failed to load preview')
        if (!active) return
        setLines(prev.items)
        setTotals(prev.totals)
      } catch (e) {
        console.error(e)
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [items])

  async function placeOrder() {
    if (!totals) return
    setCreating(true)
    try {
      const res = await fetch('/api/public/checkout/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include' as RequestCredentials,
        body: JSON.stringify({ items: Array.isArray(items) ? items : undefined, useCart: (items as any)?.useCart === true, useWishlist: (items as any)?.useWishlist === true, shippingAddress: addr, saveAddressAsDefault: saveDefault, notes: '' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create order')
      // Dummy pay
  const payRes = await fetch('/api/public/checkout/pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include' as RequestCredentials, body: JSON.stringify({ orderId: data.orderId, method: 'dummy' }) })
      const pay = await payRes.json()
      if (!payRes.ok) throw new Error(pay?.error || 'Payment failed')
      router.push(`/checkout/confirmation?orderId=${encodeURIComponent(data.orderId)}`)
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3">Items</h2>
              <div className="space-y-3">
                {lines.map((l) => (
                  <div key={l.productId} className="flex items-center gap-3">
                    <img src={l.imageUrl || '/next.svg'} alt="" className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <a className="font-medium hover:underline" href={l.href}>{l.title}</a>
                      <div className="text-sm text-gray-600">Qty {l.quantity} × {l.unitPrice} {totals?.currency}</div>
                      {!l.inStock && (<div className="text-xs text-red-600">Out of stock</div>)}
                    </div>
                    <div className="font-semibold">{l.lineTotal} {totals?.currency}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3">Shipping address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="border p-2 rounded" placeholder="Name" value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} />
                <input className="border p-2 rounded" placeholder="Phone" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} />
                <input className="border p-2 rounded md:col-span-2" placeholder="Address line 1" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
                <input className="border p-2 rounded md:col-span-2" placeholder="Address line 2" value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
                <input className="border p-2 rounded" placeholder="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
                <input className="border p-2 rounded" placeholder="State" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} />
                <input className="border p-2 rounded" placeholder="Postal Code" value={addr.postalCode} onChange={(e) => setAddr({ ...addr, postalCode: e.target.value })} />
                <input className="border p-2 rounded" placeholder="Country Code" value={addr.countryCode} onChange={(e) => setAddr({ ...addr, countryCode: e.target.value.toUpperCase().slice(0,2) })} />
                <label className="flex items-center gap-2 md:col-span-2 text-sm">
                  <input type="checkbox" checked={saveDefault} onChange={(e) => setSaveDefault(e.target.checked)} />
                  Save as default address
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3">Order summary</h2>
              {totals && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{totals.subtotal} {totals.currency}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>{totals.tax} {totals.currency}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{totals.shipping} {totals.currency}</span></div>
                  <div className="flex justify-between"><span>Discount</span><span>-{totals.discount} {totals.currency}</span></div>
                  <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>{totals.total} {totals.currency}</span></div>
                </div>
              )}
              <button disabled={creating || !totals} onClick={placeOrder} className="mt-4 w-full bg-black text-white py-2 rounded hover:opacity-90 disabled:opacity-50">Place order</button>
              <p className="text-xs text-gray-500 mt-2">Payment is simulated (dummy). No real charge.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto p-4 md:p-8">Loading…</div>}>
      <CheckoutInner />
    </Suspense>
  )
}
