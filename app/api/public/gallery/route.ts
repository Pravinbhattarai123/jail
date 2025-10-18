import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Return most recent products where showInGallery = true (when available), with first image
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const take = Math.min(100, Math.max(1, parseInt(searchParams.get('take') || '20', 10)))

  const baseWhere: any = { active: true }

  const select = {
    id: true,
    title: true,
    slug: true,
    price: true,
    currency: true,
    images: { select: { url: true, position: true }, orderBy: { position: 'asc' as const }, take: 1 },
  }

  let items: any[] = []
  // Try with showInGallery flag first; if the client or DB doesn't have the column yet, gracefully fall back
  try {
    items = await prisma.product.findMany({
      where: { ...baseWhere, showInGallery: true } as any,
      orderBy: { createdAt: 'desc' },
      take,
      select: select as any,
    })
  } catch (err: any) {
    const msg = String(err?.message || err)
    const isUnknownArg = msg.includes('Unknown arg') || msg.includes('Unknown argument')
    const isMissingColumn = msg.includes('column') && msg.includes('showInGallery') && msg.includes('does not exist')
    if (isUnknownArg || isMissingColumn) {
      // Fallback: ignore the flag and just fetch recent active products
      console.warn('[gallery] showInGallery not available yet; falling back without filter')
      items = await prisma.product.findMany({
        where: baseWhere as any,
        orderBy: { createdAt: 'desc' },
        take,
        select: select as any,
      })
    } else {
      throw err
    }
  }

  const data = items.map((p: any) => ({
    id: p.id,
    title: p.title,
    href: `/leather-goods/${p.slug}`,
    price: `₹${Number(p.price || 0).toLocaleString('en-IN')}`,
    productImageUrl: (p.images && p.images[0]?.url) || '/assets/Hero/jail.png'
  }))

  return NextResponse.json({ items: data })
}
