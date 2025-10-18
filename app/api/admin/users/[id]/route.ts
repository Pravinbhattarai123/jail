import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'

const ALLOWED_ROLES = ['ADMIN', 'MODERATOR', 'SELLER'] as const

async function getAuthorizedUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth')?.value
    if (!token) return { status: 401 as const, error: 'Unauthorized: missing token' } as const

    const payload = verifyJwt<{ sub: number | string }>(token)
    if (!payload) return { status: 401 as const, error: 'Unauthorized: invalid token' } as const

    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub
    if (!userId || Number.isNaN(userId)) return { status: 401 as const, error: 'Unauthorized: bad subject' } as const

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isActive) return { status: 401 as const, error: 'Unauthorized: user not found' } as const
    if (!ALLOWED_ROLES.includes(user.role as any)) return { status: 403 as const, error: 'Forbidden: insufficient role' } as const

    return { status: 200 as const, user }
}

export async function GET(_req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            phone: true,
            name: true,
            role: true,
            isActive: true,
            emailVerifiedAt: true,
            createdAt: true,
            updatedAt: true,
            addresses: true,
            orders: { select: { id: true, orderNumber: true, total: true, status: true, createdAt: true } },
            wishlist: { select: { id: true } },
        },
    })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ user })
}

export async function PATCH(_req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    try {
        const updated = await prisma.user.update({ where: { id }, data: { isActive: false } })
        return NextResponse.json({ user: updated })
    } catch (err: any) {
        if (err?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
        console.error('Suspend user error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
