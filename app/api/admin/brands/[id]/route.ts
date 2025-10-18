import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'
import { z } from 'zod'

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

const UpdateBrandSchema = z.object({
    name: z.string().min(1).max(200).optional(),
})

export async function GET(_req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const brand = await prisma.brand.findUnique({ where: { id }, select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true } })
    if (!brand) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ brand })
}

export async function PATCH(req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await req.json().catch(() => null)
    const parsed = UpdateBrandSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

    try {
        const updated = await prisma.brand.update({ where: { id }, data: { name: parsed.data.name } })
        return NextResponse.json({ brand: updated })
    } catch (err: any) {
        if (err?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (err?.code === 'P2002') return NextResponse.json({ error: 'Duplicate name/slug' }, { status: 409 })
        console.error('Update brand error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(_req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    try {
        await prisma.brand.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (err: any) {
        if (err?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
        console.error('Delete brand error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
