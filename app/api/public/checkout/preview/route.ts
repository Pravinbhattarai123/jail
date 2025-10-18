import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'

async function getUserIdFromCookie() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth')?.value
    if (!token) return null
    const payload = verifyJwt<{ sub: number | string }>(token)
    if (!payload) return null
    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub
    if (!userId || Number.isNaN(userId)) return null
    return userId
}

type PreviewItem = { productId: number; quantity?: number }

export async function POST(req: Request) {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { items?: PreviewItem[]; useWishlist?: boolean; useCart?: boolean }

    let items: PreviewItem[] = Array.isArray(body.items) ? body.items : []
    if ((!items || items.length === 0) && body.useWishlist) {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
            select: { items: { select: { productId: true } } },
        })
        items = (wishlist?.items || []).map((i) => ({ productId: i.productId, quantity: 1 }))
    }
    if ((!items || items.length === 0) && body.useCart) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            select: {
                id: true,
                items: { select: { productId: true, quantity: true } },
            },
        })
        items = (cart?.items || []).map((i) => ({ productId: i.productId, quantity: i.quantity }))
    }

    if (!items || items.length === 0) {
        return NextResponse.json({ error: 'No items to checkout' }, { status: 400 })
    }

    const productIds = [...new Set(items.map((i) => i.productId))]
    const products = await prisma.product.findMany({
        where: { id: { in: productIds }, active: true },
        select: {
            id: true, title: true, price: true, currency: true, stock: true, slug: true,
            images: { select: { url: true, position: true }, orderBy: { position: 'asc' } },
            subcategory: { select: { slug: true, category: { select: { slug: true } } } },
        },
    })

    const byId = new Map(products.map((p) => [p.id, p]))
    const lines = [] as Array<{
        productId: number
        title: string
        imageUrl?: string
        unitPrice: string
        quantity: number
        lineTotal: string
        href: string
        inStock: boolean
    }>

    let subtotal = 0
    let currency = 'INR'
    for (const it of items) {
        const p = byId.get(it.productId)
        if (!p) continue
        const qty = Math.max(1, Number(it.quantity) || 1)
        const unit = Number(p.price)
        const total = unit * qty
        subtotal += total
        currency = p.currency || currency
        const imageUrl = p.images?.[0]?.url
        const href = `/leather-goods/${p.subcategory.category.slug}/${p.subcategory.slug}/${p.slug || p.id}`
        lines.push({
            productId: p.id,
            title: p.title,
            imageUrl,
            unitPrice: unit.toFixed(2),
            quantity: qty,
            lineTotal: total.toFixed(2),
            href,
            inStock: p.stock >= qty,
        })
    }

    const tax = 0
    const shipping = 0
    const discount = 0
    const total = subtotal + tax + shipping - discount

    return NextResponse.json({
        items: lines,
        totals: {
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            shipping: shipping.toFixed(2),
            discount: discount.toFixed(2),
            total: total.toFixed(2),
            currency,
        },
    })
}
