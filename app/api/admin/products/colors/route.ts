import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // collect colors from product.color and product.colors (comma list)
    const products = await prisma.product.findMany({ select: { id: true, color: true, /* colors may be present */ } as any })
    const set = new Set<string>()
    for (const p of products) {
      if (p.color) set.add(String(p.color).toLowerCase())
      // runtime-safe attempt to access p['colors']
      const raw = (p as any)['colors']
      if (raw && typeof raw === 'string') {
        raw.split(',').map((s: string) => s.trim()).filter(Boolean).forEach((s: string) => set.add(s.toLowerCase()))
      }
    }
    const colors = Array.from(set).sort()
    return NextResponse.json({ data: colors })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ data: [] })
  }
}
