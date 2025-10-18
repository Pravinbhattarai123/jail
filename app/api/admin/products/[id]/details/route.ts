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

const UpsertDetailsSchema = z.object({
    warranty: z.string().max(10000).optional().nullable(),
    moreInfo: z.string().max(20000).optional().nullable(),
    // accept absolute or relative URL
    heroImageUrl: z.string().min(1).optional().nullable(),
    dimensions: z
        .object({
            length: z.number().nonnegative().optional(),
            width: z.number().nonnegative().optional(),
            height: z.number().nonnegative().optional(),
            weight: z.number().nonnegative().optional(),
            unit: z.string().max(10).optional(),
        })
        .optional()
        .nullable(),
    clothesSize: z.array(z.string().max(50)).optional(),
    shoesSize: z.array(z.string().max(50)).optional(),
})

export async function GET(_req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const id = Number(params.id)
    if (!id || Number.isNaN(id)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
    const details = await prisma.productDetail.findUnique({ where: { productId: id } })
    return NextResponse.json({ details })
}

export async function PUT(req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const productId = Number(params.id)
    if (!productId || Number.isNaN(productId)) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })
    const body = await req.json().catch(() => null)
    const parsed = UpsertDetailsSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

    const exists = await prisma.product.findUnique({ where: { id: productId } })
    if (!exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    const { warranty, moreInfo, heroImageUrl, dimensions, clothesSize, shoesSize } = parsed.data
    const updated = await prisma.productDetail.upsert({
        where: { productId },
        update: { warranty: warranty ?? null, moreInfo: moreInfo ?? null, heroImageUrl: heroImageUrl ?? null, dimensions: dimensions ?? undefined, clothesSize: clothesSize ?? [], shoesSize: shoesSize ?? [] },
        create: { productId, warranty: warranty ?? null, moreInfo: moreInfo ?? null, heroImageUrl: heroImageUrl ?? null, dimensions: dimensions ?? undefined, clothesSize: clothesSize ?? [], shoesSize: shoesSize ?? [] },
    })
    return NextResponse.json({ details: updated })
}
