import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Public products listing
// Query params:
// - q or search: string (search in title and description)
// - category: id or slug
// - subcategory: id or slug
// - brand: id or slug
// - minPrice, maxPrice: number
// - color: string
// - currency: 3-letter code (optional filter)
// - inStock: '1' | 'true' to filter stock > 0
// - page, pageSize: pagination
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined // id or slug
    const subcategory = searchParams.get('subcategory') || undefined // id or slug
    const brand = searchParams.get('brand') || undefined // id or slug
    const minPriceStr = searchParams.get('minPrice')
    const maxPriceStr = searchParams.get('maxPrice')
    const color = searchParams.get('color') || undefined
    const gender = (searchParams.get('gender') || undefined)?.toLowerCase()
    const currency = (searchParams.get('currency') || undefined)?.toUpperCase()
    const inStock = ['1', 'true', 'yes'].includes((searchParams.get('inStock') || '').toLowerCase())
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))

    const where: any = { active: true }

    if (q) {
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            // subcategory name match
            { subcategory: { is: { name: { contains: q, mode: 'insensitive' } } } },
            // category name match via subcategory -> category
            { subcategory: { is: { category: { is: { name: { contains: q, mode: 'insensitive' } } } } } },
            // brand name match
            { brand: { is: { name: { contains: q, mode: 'insensitive' } } } },
        ]
    }

    if (subcategory) {
        const maybeId = Number(subcategory)
        if (!Number.isNaN(maybeId)) where.subcategoryId = maybeId
        else where.subcategory = { ...(where.subcategory || {}), slug: subcategory } as any
    }
    if (category) {
        const maybeId = Number(category)
        if (!Number.isNaN(maybeId))
            where.subcategory = { ...(where.subcategory || {}), categoryId: maybeId } as any
        else
            where.subcategory = { ...(where.subcategory || {}), category: { slug: category } } as any
    }
    if (brand) {
        const maybeId = Number(brand)
        if (!Number.isNaN(maybeId)) where.brandId = maybeId
        else where.brand = { slug: brand }
    }

    const minPrice = minPriceStr ? Number(minPriceStr) : undefined
    const maxPrice = maxPriceStr ? Number(maxPriceStr) : undefined
    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined && !Number.isNaN(minPrice)) (where.price as any).gte = minPrice
        if (maxPrice !== undefined && !Number.isNaN(maxPrice)) (where.price as any).lte = maxPrice
    }

    if (color) {
        // match either primary color or colors CSV contains
        where.OR = [
            ...(where.OR || []),
            { color: { equals: color, mode: 'insensitive' as any } },
            // runtime filter for CSV 'colors' using contains is case-sensitive in SQL; use ilike with Prisma raw is overkill here
            // Keep simple contains for now
            { colors: { contains: color } } as any,
        ]
    }
    if (currency) where.currency = currency
    if (inStock) where.stock = { gt: 0 }
    if (gender) {
        if (['men', 'man', 'male', 'm'].includes(gender)) {
            where.gender = 'MEN' as any
        } else if (['women', 'woman', 'female', 'f', 'lady', 'ladies'].includes(gender)) {
            where.gender = 'WOMEN' as any
        }
    }

    const [items, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
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
            },
        }),
        prisma.product.count({ where }),
    ])

    return NextResponse.json({ items, total, page, pageSize })
}
