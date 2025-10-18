import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'
import { z } from 'zod'
// Avoid importing Prisma enum constants to prevent mismatches if client is stale

// Allowed roles for category admin actions
const ALLOWED_ROLES = ['ADMIN', 'MODERATOR', 'SELLER'] as const

const CreateCategorySchema = z.object({
    name: z.string().min(1).max(120),
    description: z.string().max(500).optional(),
})

function slugify(input: string) {
    return input
        .toLowerCase()
        .normalize('NFKD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
}

async function getAuthorizedUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth')?.value
    if (!token) return { status: 401 as const, error: 'Unauthorized: missing token' } as const

    const payload = verifyJwt<{ sub: number | string; email?: string }>(token)
    if (!payload) return { status: 401 as const, error: 'Unauthorized: invalid token' } as const

    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub
    if (!userId || Number.isNaN(userId)) return { status: 401 as const, error: 'Unauthorized: bad subject' } as const

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isActive) return { status: 401 as const, error: 'Unauthorized: user not found' } as const

    if (!ALLOWED_ROLES.includes(user.role as any)) return { status: 403 as const, error: 'Forbidden: insufficient role' } as const

    return { status: 200 as const, user }
}

export async function GET() {
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, slug: true, description: true, createdAt: true, updatedAt: true },
    })
    return NextResponse.json({ categories })
}

export async function POST(req: Request) {
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await req.json().catch(() => null)
    const parsed = CreateCategorySchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, description } = parsed.data
    const slug = slugify(name)

    try {
        const created = await prisma.category.create({
            data: { name, slug, description },
            select: { id: true, name: true, slug: true, description: true, createdAt: true },
        })
        return NextResponse.json({ category: created }, { status: 201 })
    } catch (err: any) {
        if (err?.code === 'P2002') {
            return NextResponse.json({ error: 'Category slug already exists' }, { status: 409 })
        }
        console.error('Create category error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
