import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import prisma from '@/lib/prisma'

// NOTE: For simplicity, no admin auth guard is applied here. In production, restrict to admin roles.
export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      currency: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      items: { select: { id: true, imageUrl: true } },
      shippingAddress: true,
    },
  })

  const mapped = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    total: o.total,
    currency: o.currency,
    createdAt: o.createdAt,
    customerName: o.user?.name || o.user?.email || 'Guest',
    address: (o.shippingAddress as any)?.line1 || (o.shippingAddress as any)?.city || '',
    details: o.items.map((it, i) => ({ id: String(it.id), image: it.imageUrl || `https://placehold.co/30x30?text=${i+1}` })),
  }))

  return NextResponse.json({ orders: mapped })
}
