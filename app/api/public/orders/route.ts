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

export async function GET() {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            createdAt: true,
            status: true,
            total: true,
            items: { select: { title: true }, take: 5 },
            _count: { select: { items: true } },
        },
    })

    const mapped = orders.map((o) => ({
        id: o.id,
        createdAt: o.createdAt,
        status: o.status,
        total: o.total,
        items: o._count.items,
        itemTitles: (o.items || []).map(i => i.title).filter(Boolean),
    }))

    return NextResponse.json({ orders: mapped })
}
