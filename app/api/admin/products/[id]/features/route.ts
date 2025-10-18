import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'
import { z } from 'zod'

const ALLOWED_ROLES = ['ADMIN'] as const

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

const FeatureSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional().nullable(),
    // accept absolute or relative URL
    imageUrl: z.string().min(1).optional().nullable(),
    order: z.number().int().min(0).optional().nullable(),
})

export async function GET(_req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const productId = Number(params.id)
    if (!productId || Number.isNaN(productId)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
    const items = await prisma.productFeature.findMany({ where: { productId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
    return NextResponse.json({ items })
}

// Create one feature
export async function POST(req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const productId = Number(params.id)
    if (!productId || Number.isNaN(productId)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
    const body = await req.json().catch(() => null)
    const parsed = FeatureSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    const exists = await prisma.product.findUnique({ where: { id: productId } })
    if (!exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    const { title, description, imageUrl, order } = parsed.data
    const created = await prisma.productFeature.create({ data: { productId, title, description: description ?? null, imageUrl: imageUrl ?? null, order: order ?? null } })
    return NextResponse.json({ feature: created }, { status: 201 })
}

// Replace entire features list (reorder)
export async function PUT(req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const productId = Number(params.id)
    if (!productId || Number.isNaN(productId)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
    const body = await req.json().catch(() => null)
    const arr = z.array(FeatureSchema.extend({ id: z.number().int().optional() })).safeParse(body)
    if (!arr.success) return NextResponse.json({ error: 'Invalid input', details: arr.error.flatten() }, { status: 400 })
    const exists = await prisma.product.findUnique({ where: { id: productId } })
    if (!exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    const items = arr.data
    const result = await prisma.$transaction(async (tx) => {
        await tx.productFeature.deleteMany({ where: { productId } })
        await tx.productFeature.createMany({
            data: items.map((f, idx) => ({ productId, title: f.title, description: f.description ?? null, imageUrl: f.imageUrl ?? null, order: f.order ?? idx })),
        })
        return tx.productFeature.findMany({ where: { productId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
    })
    return NextResponse.json({ items: result })
}
