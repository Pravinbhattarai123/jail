"use client"
import React from 'react'
import Link from 'next/link'
import { useWishlist } from '@/components/contexts/WishlistContext'

export default function WishlistDropdown() {
  const { state, toggleWishlist, removeFromWishlist, clearWishlist } = useWishlist()

  if (!state.isOpen) return null

  const addToCart = async (productId: number) => {
    try {
      await fetch('/api/public/cart', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      // Optionally remove from wishlist after adding to cart
      await removeFromWishlist(productId)
      // Trigger a simple fly animation to cart if desired (handled by product page for now)
    } catch {
      // ignore
    }
  }

  const addAllToCart = async () => {
    try {
      for (const it of state.items) {
        await fetch('/api/public/cart', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: it.id, quantity: 1 }),
        })
      }
      // Optionally clear wishlist after adding all
      await clearWishlist()
    } catch {
      // ignore errors for batch add
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={toggleWishlist} />
      {/* Position at the top-right like the cart dropdown */}
  <div className="absolute right-4 top-16 w-80 sm:w-96 max-w-[90vw] max-h-[70vh] overflow-auto bg-white text-black rounded-lg shadow-lg ring-1 ring-black/10">
        <div className="p-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Your Wishlist</h4>
          <button onClick={toggleWishlist} className="text-sm text-gray-600 hover:text-gray-800">Close</button>
        </div>
        <div className="px-3 pb-3">
          {state.items.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-600">Your wishlist is empty.</div>
          ) : (
            <div className="space-y-3">
              {state.items.map((it) => (
                <div key={`${it.id}-${it.selectedColor || 'default'}`} className="flex items-center rounded-md p-2 hover:bg-gray-50">
                  <Link href={it.href} className="flex items-center flex-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.imageUrl} alt={it.name} className="w-16 h-16 object-cover rounded mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{it.name}</p>
                      <p className="text-sm text-gray-600">₹{it.price.toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                  <div className="ml-3 flex-shrink-0 space-x-2">
                    <button onClick={() => addToCart(it.id)} className="inline-block bg-black text-white px-3 py-2 text-xs rounded hover:bg-gray-900">Add to Cart</button>
                    <button onClick={() => removeFromWishlist(it.id)} className="inline-block bg-white border border-gray-200 px-3 py-2 text-xs rounded hover:bg-gray-50">Remove</button>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t mt-2">
                <div className="px-3 py-2 flex items-center justify-between">
                  <button onClick={clearWishlist} className="text-xs text-gray-700 hover:underline">Clear all</button>
                  <button onClick={addAllToCart} className="inline-block bg-black text-white px-3 py-2 text-xs rounded hover:bg-gray-900">Add all to Cart</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
