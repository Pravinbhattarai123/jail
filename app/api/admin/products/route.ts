
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'
import { z } from 'zod'

const ALLOWED_ROLES = ['ADMIN', 'MODERATOR', 'SELLER'] as const

const FeatureSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(20000).optional().nullable(),
    // Accept absolute or relative URLs; frontend may send /uploads/... paths
    imageUrl: z
        .string()
        .min(1)
        .optional()
        .nullable(),
    order: z.number().int().min(0).optional().nullable(),
})

const DetailsSchema = z.object({
    warranty: z.string().max(20000).optional().nullable(),
    moreInfo: z.string().max(50000).optional().nullable(),
    // Accept absolute or relative URLs
    heroImageUrl: z.string().min(1).optional().nullable(),
    // Optional measurement image URL
    measurementImageUrl: z.string().max(1000).optional().nullable(),
    dimensions: z
        .object({
            length: z.number().nonnegative().optional(),
            width: z.number().nonnegative().optional(),
            height: z.number().nonnegative().optional(),
            weight: z.number().nonnegative().optional(),
            unit: z.string().max(10).optional(),
            // Bags & luggage: capacity in liters
            capacityLiters: z.number().nonnegative().optional(),
        })
        .optional()
        .nullable(),
    // New arrays per schema
    clothesSize: z.array(z.string().max(50)).optional(),
    shoesSize: z.array(z.string().max(50)).optional(),
})

const CreateProductSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(50000).optional(),
    price: z.union([z.number().positive(), z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/)]),
    compareAtPrice: z
        .union([z.number().positive(), z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/)])
        .optional(),
    currency: z.string().length(3).transform((s) => s.toUpperCase()).default('INR'),
    stock: z.number().int().min(0).default(0),
    color: z.string().max(100).optional(),
    material: z.string().max(200).optional(),
    // new shared fields
    weight: z.union([z.string().min(1), z.number()]),
    materials: z.array(z.string().min(1)).min(1),
    attributes: z.record(z.string(), z.any()).optional(),
    active: z.boolean().optional(),
    // subcategory reference (one of)
    subcategoryId: z.number().int().positive().optional(),
    subcategorySlug: z.string().min(1).max(200).optional(),
    // brand optional
    brandId: z.number().int().positive().optional(),
    brandSlug: z.string().min(1).max(200).optional(),
    // images optional: array of URLs
    // allow absolute or relative URLs
    images: z.array(z.string().min(1)).optional(),
    // optional colors list
    colors: z.array(z.string().max(50)).optional(),
    // new: colors relation by IDs
    colorIds: z.array(z.number().int().positive()).optional(),
    // gender for product
    gender: z.enum(['MALE', 'FEMALE', 'UNISEX']).optional(),
    // optional sizes when sizeSet is used (labels array)
    sizes: z.array(z.string().max(50)).optional(),
    // optional product video URL
    videoUrl: z.string().max(2000).optional(),
    // offer fields per schema
    offerType: z.enum(['PERCENT', 'FIXED']).optional(),
    offerValue: z.union([z.number().nonnegative(), z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/)]).optional(),
    // legacy: accepted but ignored
    sizeSetId: z.number().int().positive().optional(),
    measurementImageUrl: z.string().max(1000).optional(),
    // rich content
    details: DetailsSchema.optional(),
    features: z.array(FeatureSchema).optional(),
    showInGallery: z.boolean().optional(),
}).refine((d) => !!d.subcategoryId || !!d.subcategorySlug, {
    message: 'Either subcategoryId or subcategorySlug is required',
    path: ['subcategory'],
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

    const payload = verifyJwt<{ sub: number | string }>(token)
    if (!payload) return { status: 401 as const, error: 'Unauthorized: invalid token' } as const

    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub
    if (!userId || Number.isNaN(userId)) return { status: 401 as const, error: 'Unauthorized: bad subject' } as const

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isActive) return { status: 401 as const, error: 'Unauthorized: user not found' } as const
    if (!ALLOWED_ROLES.includes(user.role as any)) return { status: 403 as const, error: 'Forbidden: insufficient role' } as const

    return { status: 200 as const, user }
}

export async function GET(req: Request) {
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || undefined
    const category = searchParams.get('category') || undefined // id or slug
    const subcategory = searchParams.get('subcategory') || undefined // id or slug
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))

    const where: any = {}
    if (q) {
        where.title = { contains: q, mode: 'insensitive' }
    }
    if (subcategory) {
        const maybeId = Number(subcategory)
        if (!Number.isNaN(maybeId)) where.subcategoryId = maybeId
        else where.subcategory = { slug: subcategory }
    }
    if (category) {
        const maybeId = Number(category)
        if (!Number.isNaN(maybeId)) where.subcategory = { categoryId: maybeId }
        else where.subcategory = { category: { slug: category } }
    }

    let items: any[] = []
    let total = 0
    const baseSelect: any = {
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
        weight: true,
        materials: true,
        attributes: true,
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
        colorsRel: { select: { id: true, name: true, hex: true } },
        // details intentionally omitted from list view to avoid client mismatch crashes
        features: { select: { id: true, title: true, description: true, imageUrl: true, order: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }] },
        createdAt: true,
        updatedAt: true,
    }
    try {
        items = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: { ...baseSelect, videoUrl: true, showInGallery: true },
        })
    } catch (e: any) {
        // Try fallback without showInGallery and/or videoUrl for older schemas
        try {
            items = await prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: { ...baseSelect, videoUrl: true },
            })
        } catch {
            items = await prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: baseSelect,
            })
        }
    }
    total = await prisma.product.count({ where })

    return NextResponse.json({ items, total, page, pageSize, data: items })
}

export async function POST(req: Request) {
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await req.json().catch(() => null)
    const parsed = CreateProductSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const {
        title,
        description,
        price,
        compareAtPrice,
        currency,
        stock,
        color,
        material,
        weight,
        materials: materialsArr,
        attributes,
        active,
        subcategoryId,
        subcategorySlug,
        brandId,
        brandSlug,
        images,
        details,
        features,
        sizes,
        videoUrl,
        offerType,
        offerValue,
        gender,
        colorIds,
        measurementImageUrl,
    } = parsed.data

    // Resolve subcategory
    let resolvedSubId: number | null = null
    if (typeof subcategoryId === 'number') {
        resolvedSubId = subcategoryId
    } else if (subcategorySlug) {
        const sub = await prisma.subcategory.findUnique({ where: { slug: subcategorySlug } })
        if (!sub) return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
        resolvedSubId = sub.id
    }
    if (!resolvedSubId) return NextResponse.json({ error: 'Subcategory not specified' }, { status: 400 })

    // Resolve brand if provided
    let resolvedBrandId: number | null = null
    if (typeof brandId === 'number') {
        resolvedBrandId = brandId
    } else if (brandSlug) {
        const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } })
        if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
        resolvedBrandId = brand.id
    }

    const slugBase = slugify(title)
    let slug = slugBase
    // ensure unique slug by appending -n if needed
    let i = 1
    while (await prisma.product.findUnique({ where: { slug } })) {
        i += 1
        slug = `${slugBase}-${i}`
    }

    try {
        const created = await prisma.$transaction(async (tx) => {
            // cast data to any to allow writing 'colors' (recent schema field) without strict Prisma type updates
            let product
            const baseData: any = {
                title,
                slug,
                description,
                price: typeof price === 'number' ? price.toString() : price,
                compareAtPrice: compareAtPrice
                    ? typeof compareAtPrice === 'number'
                        ? compareAtPrice.toString()
                        : compareAtPrice
                    : undefined,
                currency,
                stock,
                color,
                material,
                weight: typeof weight === 'number' ? String(weight) : weight,
                materials: materialsArr,
                attributes: attributes ?? undefined,
                // store colors as a comma-separated string in the DB
                colors: parsed.data.colors ? parsed.data.colors.join(',') : undefined,
                videoUrl: videoUrl ?? undefined,
                sizes: sizes && sizes.length ? sizes.join(',') : undefined,
                gender: gender ?? undefined,
                offerType: offerType ?? undefined,
                offerValue: offerValue ? (typeof offerValue === 'number' ? offerValue.toString() : offerValue) : undefined,
                active: active ?? true,
                subcategoryId: resolvedSubId!,
                brandId: resolvedBrandId ?? undefined,
                // if relation color IDs provided, connect
                ...(colorIds && colorIds.length ? { colorsRel: { connect: colorIds.map((id) => ({ id })) } } : {}),
            }
            try {
                product = await tx.product.create({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    data: { ...baseData, showInGallery: parsed.data.showInGallery ?? true } as any,
                })
            } catch (e: any) {
                if (typeof e?.message === 'string' && (e.message.includes('Unknown argument `showInGallery`') || e.message.includes('Unknown arg `showInGallery`'))) {
                    product = await tx.product.create({ data: baseData as any })
                } else {
                    throw e
                }
            }

            // Create details in a second step to avoid nested create client mismatch
            if (details) {
                // map breadth -> width for legacy payloads
                const dims = details.dimensions as any
                if (dims && dims.breadth && !dims.width) dims.width = dims.breadth
                const mUrl = (details as any).measurementImageUrl ?? measurementImageUrl ?? undefined
                const detailData: any = {
                    productId: product.id,
                    warranty: details.warranty ?? null,
                    moreInfo: details.moreInfo ?? null,
                    heroImageUrl: details.heroImageUrl ?? null,
                    dimensions: dims ?? undefined,
                    clothesSize: details.clothesSize ?? [],
                    shoesSize: details.shoesSize ?? [],
                }
                if (typeof mUrl === 'string' && mUrl.trim()) {
                    detailData.measurementImageUrl = mUrl
                }
                try {
                    await tx.productDetail.create({ data: detailData })
                } catch (e: any) {
                    if (typeof e?.message === 'string' && e.message.includes('Unknown argument `measurementImageUrl`')) {
                        delete detailData.measurementImageUrl
                        await tx.productDetail.create({ data: detailData })
                    } else {
                        throw e
                    }
                }
            }

            if (images && images.length) {
                await tx.productImage.createMany({
                    data: images.map((url, idx) => ({ productId: product.id, url, position: idx })),
                })
            }

            // add features
            if (features && features.length) {
                await tx.productFeature.createMany({
                    data: features.map((f, idx) => ({ productId: product.id, title: f.title, description: f.description ?? null, imageUrl: f.imageUrl ?? null, order: f.order ?? idx })),
                })
            }

            const buildSelect = (withMeasurement: boolean) => ({
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
                weight: true,
                materials: true,
                attributes: true,
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
                details: {
                    select: withMeasurement
                        ? { warranty: true, moreInfo: true, heroImageUrl: true, measurementImageUrl: true, dimensions: true, clothesSize: true, shoesSize: true }
                        : { warranty: true, moreInfo: true, heroImageUrl: true, dimensions: true, clothesSize: true, shoesSize: true },
                },
                colorsRel: { select: { id: true, name: true, hex: true } },
                features: { select: { id: true, title: true, description: true, imageUrl: true, order: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }] },
                createdAt: true,
            })

            try {
                return await tx.product.findUnique({ where: { id: product.id }, select: buildSelect(true) as any })
            } catch (e: any) {
                if (typeof e?.message === 'string') {
                    if (e.message.includes('Unknown field `measurementImageUrl`')) {
                        return await tx.product.findUnique({ where: { id: product.id }, select: buildSelect(false) as any })
                    }
                    if (e.message.includes('Unknown field `videoUrl`')) {
                        const sel = buildSelect(true) as any
                        delete sel.videoUrl
                        return await tx.product.findUnique({ where: { id: product.id }, select: sel })
                    }
                }
                throw e
            }
        })

        return NextResponse.json({ product: created, data: created }, { status: 201 })
    } catch (err: any) {
        if (err?.code === 'P2002') {
            return NextResponse.json({ error: 'Product slug already exists' }, { status: 409 })
        }
        console.error('Create product error', err)
        // Surface a safer message to help debug client-side without leaking stack traces
        return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
    }
}
