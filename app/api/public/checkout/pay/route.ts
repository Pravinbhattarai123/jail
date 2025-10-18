import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'

async function getUserIdFromCookie() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth')?.value
    if (!token) return null
    const payload = verifyJwt<{ sub: number | string }>(token)
    if (!payload) return null
    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub
    if (!userId || Number.isNaN(userId)) return null
    return userId
}

export async function POST(req: Request) {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null) as { orderId?: string; method?: string } | null
    const orderId = body?.orderId
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, userId: true, status: true, paymentStatus: true } })
    if (!order || (order.userId && order.userId !== userId)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Dummy payment: mark succeeded instantly
    const paidAt = new Date()
    await prisma.$transaction([
        prisma.payment.update({ where: { orderId }, data: { status: 'SUCCEEDED', provider: 'MANUAL', method: body?.method || 'dummy', paidAt } }),
        prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'SUCCEEDED', status: 'CONFIRMED' } }),
    ])

    return NextResponse.json({ success: true, paidAt })
}
