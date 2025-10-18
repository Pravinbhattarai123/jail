"use client"
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type WishlistItem = {
  id: number // productId for delete API
  name: string
  imageUrl: string
  price: number
  selectedColor?: string | null
  href: string
}

type WishlistState = {
  isOpen: boolean
  items: WishlistItem[]
  totalItems: number
}

type WishlistContextType = {
  state: WishlistState
  toggleWishlist: () => void
  addToWishlist: (productId: number) => Promise<boolean>
  removeFromWishlist: (productId: number) => Promise<void>
  clearWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

async function fetchWishlistItems(): Promise<WishlistItem[]> {
  try {
    const res = await fetch('/api/public/wishlist', { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    const items = Array.isArray(data?.items) ? data.items : []
    return items.map((it: any) => {
      const p = it.product || {}
  let href = `/leather-goods/${p.slug}`
      if (p?.subcategory?.category?.slug && p?.subcategory?.slug) {
  href = `/leather-goods/${p.subcategory.category.slug}/${p.subcategory.slug}/${p.slug}`
      }
      return {
        id: Number(it.productId),
        name: String(p.title || 'Unknown'),
        imageUrl: String(p.images?.[0]?.url || '/assets/Hero/jail.png'),
        price: Number(p.price || 0),
        selectedColor: p.color || null,
        href,
      } as WishlistItem
    })
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<WishlistItem[]>([])

  const load = useCallback(async () => {
    const list = await fetchWishlistItems()
    setItems(list)
  }, [])

  const toggleWishlist = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        // Load when opening
        load()
      }
      return next
    })
  }, [load])

  const addToWishlist = useCallback(async (productId: number) => {
    try {
      const res = await fetch('/api/public/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok) return false
      // Refresh list to update badge/count
      const list = await fetchWishlistItems()
      setItems(list)
      return true
    } catch {
      // ignore
      return false
    }
  }, [])

  const removeFromWishlist = useCallback(async (productId: number) => {
    setItems((prev) => prev.filter((x) => x.id !== productId))
    try {
      await fetch('/api/public/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
    } catch {
      // ignore
    }
  }, [])

  const clearWishlist = useCallback(async () => {
    const ids = items.map((x) => x.id)
    setItems([])
    for (const id of ids) {
      try {
        await fetch('/api/public/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id }),
        })
      } catch {
        // ignore
      }
    }
  }, [items])

  const value = useMemo<WishlistContextType>(() => ({
    state: { isOpen, items, totalItems: items.length },
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
  }), [isOpen, items, toggleWishlist, removeFromWishlist, clearWishlist])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
