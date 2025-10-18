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

const UpdateProductSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    price: z.union([z.number().positive(), z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/)]).optional(),
    compareAtPrice: z.union([z.number().positive(), z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/)]).optional(),
    currency: z.string().length(3).transform((s) => s.toUpperCase()).optional(),
    stock: z.number().int().min(0).optional(),
    color: z.string().max(100).optional(),
    material: z.string().max(200).optional(),
    gender: z.enum(['MALE', 'FEMALE', 'UNISEX']).optional(),
    offerType: z.enum(['PERCENT', 'FIXED']).optional(),
    offerValue: z.union([z.number().nonnegative(), z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/)]).optional(),
    colors: z.array(z.string().max(50)).optional(),
    sizes: z.array(z.string().max(50)).optional(),
    active: z.boolean().optional(),
    // relations
    subcategoryId: z.number().int().positive().optional(),
    subcategorySlug: z.string().min(1).max(200).optional(),
    brandId: z.number().int().positive().optional(),
    brandSlug: z.string().min(1).max(200).optional(),
    images: z.array(z.string().min(1)).optional(),
    videoUrl: z.string().max(2000).optional(),
})

export async function GET(_req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const product = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            price: true,
            compareAtPrice: true,
            currency: true,
            stock: true,
            color: true,
            material: true,
            offerType: true,
            offerValue: true,
            colors: true,
            sizes: true,
            gender: true,
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
            details: { select: { warranty: true, moreInfo: true, heroImageUrl: true, dimensions: true, clothesSize: true, shoesSize: true } },
            features: { select: { id: true, title: true, description: true, imageUrl: true, order: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }] },
            createdAt: true,
            updatedAt: true,
        },
    })

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ product })
}

export async function PATCH(req: Request, context: any) {
    const { params } = context as { params: { id: string } }
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await req.json().catch(() => null)
    const parsed = UpdateProductSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })

    const {
        title,
        description,
        price,
        compareAtPrice,
        currency,
        stock,
        color,
        material,
        gender,
        offerType,
        offerValue,
        colors,
        sizes,
        active,
        subcategoryId,
        subcategorySlug,
        brandId,
        brandSlug,
        images,
        videoUrl,
    } = parsed.data

    // Resolve relations if provided
    let updates: any = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (price !== undefined) updates.price = typeof price === 'number' ? price.toString() : price
    if (compareAtPrice !== undefined)
        updates.compareAtPrice = typeof compareAtPrice === 'number' ? compareAtPrice.toString() : compareAtPrice
    if (currency !== undefined) updates.currency = currency
    if (stock !== undefined) updates.stock = stock
    if (color !== undefined) updates.color = color
    if (material !== undefined) updates.material = material
    if (gender !== undefined) updates.gender = gender
    if (offerType !== undefined) updates.offerType = offerType
    if (offerValue !== undefined) updates.offerValue = typeof offerValue === 'number' ? offerValue.toString() : offerValue
    if (colors !== undefined) updates.colors = colors && colors.length ? colors.join(',') : null
    if (sizes !== undefined) updates.sizes = sizes && sizes.length ? sizes.join(',') : null
    if (active !== undefined) updates.active = active
    if (videoUrl !== undefined) updates.videoUrl = videoUrl || null

    if (subcategoryId !== undefined) updates.subcategoryId = subcategoryId
    else if (subcategorySlug) {
        const sub = await prisma.subcategory.findUnique({ where: { slug: subcategorySlug } })
        if (!sub) return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
        updates.subcategoryId = sub.id
    }

    if (brandId !== undefined) updates.brandId = brandId
    else if (brandSlug) {
        const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } })
        if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
        updates.brandId = brand.id
    }

    try {
        const updated = await prisma.$transaction(async (tx) => {
            const product = await tx.product.update({ where: { id }, data: updates })

            if (images) {
                // Replace images with the provided array
                await tx.productImage.deleteMany({ where: { productId: id } })
                if (images.length) {
                    await tx.productImage.createMany({
                        data: images.map((url, idx) => ({ productId: id, url, position: idx })),
                    })
                }
            }

            return tx.product.findUnique({
                where: { id: product.id },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    videoUrl: true,
                    price: true,
                    compareAtPrice: true,
                    currency: true,
                    stock: true,
                    color: true,
                    material: true,
                    offerType: true,
                    offerValue: true,
                    colors: true,
                    sizes: true,
                    gender: true,
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
                    createdAt: true,
                    updatedAt: true,
                } as any,
            })
        })

        return NextResponse.json({ product: updated, data: updated })
    } catch (err: any) {
        if (err?.code === 'P2002') return NextResponse.json({ error: 'Duplicate unique value' }, { status: 409 })
        if (err?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
        console.error('Update product error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(_req: Request, context: any) {
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const rawParams = (context as any)?.params
    const resolvedParams = rawParams && typeof rawParams.then === 'function' ? await rawParams : rawParams
    const id = Number(resolvedParams?.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    try {
        await prisma.$transaction(async (tx) => {
            // clean up dependent rows to avoid FK violations
            await tx.cartItem.deleteMany({ where: { productId: id } })
            await tx.wishlistItem.deleteMany({ where: { productId: id } })
            await tx.orderItem.updateMany({ where: { productId: id }, data: { productId: null } })
            await tx.productImage.deleteMany({ where: { productId: id } })
            await tx.product.delete({ where: { id } })
        })
        return NextResponse.json({ success: true })
    } catch (err: any) {
        if (err?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
        if (err?.code === 'P2003') return NextResponse.json({ error: 'Cannot delete: referenced in carts or orders' }, { status: 409 })
        console.error('Delete product error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
