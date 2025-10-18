import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> } | any) {
  const { id: identifier } = ctx?.params && typeof ctx.params.then === 'function' ? await ctx.params : (ctx?.params || {})
  if (!identifier) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const maybeId = Number(identifier)
  if (Number.isNaN(maybeId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  // Fetch product with sizes and details
  const product = await prisma.product.findUnique({
    where: { id: maybeId },
    select: {
      id: true,
      stock: true,
      sizes: true,
      details: { select: { clothesSize: true, shoesSize: true } },
      attributes: true,
      title: true,
      subcategory: { select: { slug: true } },
    },
  })

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // If attributes provide explicit per-size stock map, use it
  try {
    const attr = product.attributes as any
    if (attr && attr.sizeStock && typeof attr.sizeStock === 'object') {
      return NextResponse.json({ sizes: attr.sizeStock })
    }
  } catch (e) {
    // ignore
  }

  // Build candidate sizes list from details or csv sizes
  const sizesFromDetails: string[] = Array.isArray(product.details?.clothesSize)
    ? product.details!.clothesSize
    : []
  const sizesFromCsv: string[] = product.sizes ? String(product.sizes).split(',').map(s => s.trim()).filter(Boolean) : []
  const sizes = sizesFromDetails.length ? sizesFromDetails : sizesFromCsv.length ? sizesFromCsv : []

  // If no explicit sizes, return empty map
  if (!sizes.length) {
    return NextResponse.json({ sizes: {} })
  }

  // Heuristic: fetch recent order items for this product and try to infer ordered quantities per size
  const items = await prisma.orderItem.findMany({ where: { productId: product.id }, select: { quantity: true, title: true, sku: true } })

  const lowerSizes = sizes.map(s => s.toLowerCase())
  const orderedBySize: Record<string, number> = {}
  for (const s of sizes) orderedBySize[s] = 0

  for (const it of items) {
    const title = (it.title || '').toLowerCase()
    const sku = (it.sku || '').toLowerCase()
    for (let i = 0; i < sizes.length; i++) {
      const s = sizes[i]
      const sLow = s.toLowerCase()
      // match if size token appears in title or sku (naive but practical)
      if (sLow && (title.includes(sLow) || sku.includes(sLow))) {
        orderedBySize[s] += it.quantity || 0
        break
      }
    }
  }

  // Remaining per size = max(0, product.stock - orderedBySize[size]) (simple heuristic)
  const remaining: Record<string, number> = {}
  for (const s of sizes) {
    const used = orderedBySize[s] || 0
    const rem = Math.max(0, (product.stock || 0) - used)
    remaining[s] = rem
  }

  return NextResponse.json({ sizes: remaining })
}
