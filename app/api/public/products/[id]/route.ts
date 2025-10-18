import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Public: Get product by numeric id or slug
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> } | any) {
    const { id: identifier } = ctx?.params && typeof ctx.params.then === 'function' ? await ctx.params : (ctx?.params || {})
    if (!identifier) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    let where: any = { active: true }
    const maybeId = Number(identifier)
    if (!Number.isNaN(maybeId)) where.id = maybeId
    else where.slug = identifier

    async function getSelect(withMeasurement: boolean) {
        return {
            id: true,
            title: true,
            slug: true,
            description: true,
            price: true,
            compareAtPrice: true,
            currency: true,
            stock: true,
            color: true,
            gender: true,
            material: true,
            weight: true,
            materials: true,
            attributes: true,
            offerType: true,
            offerValue: true,
            colors: true,
            sizes: true,
            active: true,
            subcategoryId: true,
            brandId: true,
            subcategory: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    category: { select: { id: true, name: true, slug: true } },
                },
            },
            brand: { select: { id: true, name: true, slug: true } },
            images: { select: { id: true, url: true, alt: true, position: true } },
            colorsRel: { select: { id: true, name: true, hex: true } },
            details: {
                select: withMeasurement
                    ? { clothesSize: true, shoesSize: true, dimensions: true, warranty: true, moreInfo: true, heroImageUrl: true, measurementImageUrl: true }
                    : { clothesSize: true, shoesSize: true, dimensions: true, warranty: true, moreInfo: true, heroImageUrl: true },
            },
            createdAt: true,
            updatedAt: true,
        } as const
    }

    let product = null as any
    try {
        product = await prisma.product.findFirst({ where, select: (await getSelect(true)) as any })
    } catch (e: any) {
        if (typeof e?.message === 'string' && e.message.includes('Unknown field `measurementImageUrl`')) {
            product = await prisma.product.findFirst({ where, select: (await getSelect(false)) as any })
        } else {
            throw e
        }
    }

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ product })
}

