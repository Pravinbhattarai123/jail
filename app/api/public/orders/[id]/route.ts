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

export async function GET(_: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params.id
    const order = await prisma.order.findUnique({
        where: { id },
        select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            subtotal: true,
            discount: true,
            tax: true,
            shipping: true,
            total: true,
            currency: true,
            createdAt: true,
            shippingAddress: true,
            items: { select: { id: true, title: true, quantity: true, unitPrice: true, lineTotal: true, imageUrl: true } },
            userId: true,
        },
    })
    if (!order || (order.userId && order.userId !== userId)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(order)
}
