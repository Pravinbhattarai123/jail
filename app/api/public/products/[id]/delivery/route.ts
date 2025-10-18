import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function addBusinessDays(start: Date, days: number, weekendDelivery: boolean) {
  if (weekendDelivery) {
    const d = new Date(start)
    d.setDate(d.getDate() + days)
    return d
  }
  const d = new Date(start)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay() // 0 Sun, 6 Sat
    if (day !== 0 && day !== 6) added++
  }
  return d
}

function fmt(d: Date) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> } | any) {
  const { id: identifier } = ctx?.params && typeof ctx.params.then === 'function' ? await ctx.params : (ctx?.params || {})
  if (!identifier) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // Resolve product existence (optional; we don't use product fields here)
  const where: any = {}
  const maybeId = Number(identifier)
  if (!Number.isNaN(maybeId)) where.id = maybeId
  else where.slug = identifier

  const product = await prisma.product.findFirst({ where, select: { id: true } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Read settings with graceful fallbacks when the model/table isn't present
  let settings: any = null
  try {
    settings = await (prisma as any).shippingSetting.findUnique({ where: { id: 1 } })
  } catch {}
  settings = settings || {
    processingDaysMin: 1,
    processingDaysMax: 2,
    transitDaysMin: 2,
    transitDaysMax: 5,
    weekendDelivery: false,
  }

  const now = new Date()
  const startProc = addBusinessDays(now, settings.processingDaysMin ?? 1, !!settings.weekendDelivery)
  const endProc = addBusinessDays(now, settings.processingDaysMax ?? 2, !!settings.weekendDelivery)

  const start = addBusinessDays(endProc, settings.transitDaysMin ?? 2, !!settings.weekendDelivery)
  const end = addBusinessDays(endProc, settings.transitDaysMax ?? 5, !!settings.weekendDelivery)

  return NextResponse.json({
    start: fmt(start),
    end: fmt(end),
  })
}
