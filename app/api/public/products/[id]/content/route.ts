import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Public: Get product rich content by numeric id or slug
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> } | any) {
    const { id: identifier } = ctx?.params && typeof ctx.params.then === 'function' ? await ctx.params : (ctx?.params || {})
    if (!identifier) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    let where: any = { active: true }
    const maybeId = Number(identifier)
    if (!Number.isNaN(maybeId)) where.id = maybeId
    else where.slug = identifier

    const product = await prisma.product.findFirst({
        where,
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            images: { select: { id: true, url: true, alt: true, position: true } },
            details: { select: { warranty: true, moreInfo: true, heroImageUrl: true, dimensions: true } },
            features: { select: { id: true, title: true, description: true, imageUrl: true, order: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }] },
        },
    })

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ product })
}
