"use client"
import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function ConfirmationInner() {
  const params = useSearchParams()
  const orderId = params.get('orderId')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function run() {
      if (!orderId) { setLoading(false); return }
      try {
        const res = await fetch(`/api/public/orders/${orderId}`)
        const json = await res.json()
        if (res.ok && active) setData(json)
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [orderId])

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Thank you for your order!</h1>
      <p className="text-gray-600 mb-6">Your payment was successful. A confirmation email will be sent shortly.</p>
      {loading ? (
        <div>Loading…</div>
      ) : data ? (
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex justify-between"><span>Order #</span><span className="font-mono">{data.orderNumber}</span></div>
          <div className="flex justify-between"><span>Status</span><span>{data.status}</span></div>
          <div className="flex justify-between"><span>Total</span><span>{data.total} {data.currency}</span></div>
          <div>
            <h2 className="font-semibold mt-2 mb-1">Items</h2>
            <div className="space-y-2">
              {data.items?.map((it: any) => (
                <div key={it.id} className="flex items-center gap-3">
                  <img src={it.imageUrl || '/next.svg'} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1">
                    <div className="font-medium">{it.title}</div>
                    <div className="text-sm text-gray-600">Qty {it.quantity} × {Number(it.unitPrice).toFixed(2)} {data.currency}</div>
                  </div>
                  <div className="font-semibold">{Number(it.lineTotal).toFixed(2)} {data.currency}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>Order not found.</div>
      )}
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-6">Loading…</div>}>
      <ConfirmationInner />
    </Suspense>
  )
}
