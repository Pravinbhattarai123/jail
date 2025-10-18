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

type CreateOrderBody = {
    items?: Array<{ productId: number; quantity?: number }>
    useWishlist?: boolean
    useCart?: boolean
    shippingAddress: {
        name?: string
        phone?: string
        line1: string
        line2?: string
        city: string
        state?: string
        postalCode: string
        countryCode: string
        label?: string
    }
    saveAddressAsDefault?: boolean
    notes?: string
}

export async function POST(req: Request) {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await req.json().catch(() => null)) as CreateOrderBody | null
    if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    const addr = body.shippingAddress
    if (!addr || !addr.line1 || !addr.city || !addr.postalCode || !addr.countryCode) {
        return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    let items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0 && body.useWishlist) {
        const wl = await prisma.wishlist.findUnique({ where: { userId }, select: { items: { select: { productId: true } } } })
        items = (wl?.items || []).map((i) => ({ productId: i.productId, quantity: 1 }))
    }
    if (items.length === 0 && body.useCart) {
        const cart = await prisma.cart.findUnique({ where: { userId }, select: { items: { select: { productId: true, quantity: true } } } })
        items = (cart?.items || []).map((i) => ({ productId: i.productId, quantity: i.quantity }))
    }
    if (items.length === 0) return NextResponse.json({ error: 'No items to checkout' }, { status: 400 })

    const productIds = [...new Set(items.map((i) => i.productId))]
    const products = await prisma.product.findMany({
        where: { id: { in: productIds }, active: true },
        select: {
            id: true, title: true, price: true, currency: true, stock: true, slug: true,
            images: { select: { url: true, position: true }, orderBy: { position: 'asc' } },
        },
    })
    const byId = new Map(products.map((p) => [p.id, p]))

    let subtotal = 0
    let currency = 'INR'
    const orderItems: Array<{ productId?: number; sku?: string | null; title: string; color?: string | null; quantity: number; unitPrice: number; lineTotal: number; imageUrl?: string | null }> = []
    for (const it of items) {
        const p = byId.get(it.productId)
        if (!p) continue
        const qty = Math.max(1, Number(it.quantity) || 1)
        const unit = Number(p.price)
        const total = unit * qty
        subtotal += total
        currency = p.currency || currency
        orderItems.push({
            productId: p.id,
            sku: null,
            title: p.title,
            color: null,
            quantity: qty,
            unitPrice: unit,
            lineTotal: total,
            imageUrl: p.images?.[0]?.url || null,
        })
    }
    if (orderItems.length === 0) return NextResponse.json({ error: 'No valid items' }, { status: 400 })

    const tax = 0
    const shipping = 0
    const discount = 0
    const total = subtotal + tax + shipping - discount

    // Persist address optionally (no unique constraint on userId, so find-or-create default)
    if (body.saveAddressAsDefault) {
        const existing = await prisma.address.findFirst({ where: { userId, isDefaultShipping: true } })
        if (existing) {
            await prisma.address.update({
                where: { id: existing.id },
                data: {
                    name: addr.name,
                    phone: addr.phone,
                    line1: addr.line1,
                    line2: addr.line2,
                    city: addr.city,
                    state: addr.state,
                    postalCode: addr.postalCode,
                    countryCode: addr.countryCode,
                    label: addr.label ?? existing.label ?? 'Default',
                    isDefaultShipping: true,
                    isDefaultBilling: true,
                },
            })
        } else {
            await prisma.address.create({
                data: {
                    userId,
                    name: addr.name,
                    phone: addr.phone,
                    line1: addr.line1,
                    line2: addr.line2,
                    city: addr.city,
                    state: addr.state,
                    postalCode: addr.postalCode,
                    countryCode: addr.countryCode,
                    label: addr.label ?? 'Default',
                    isDefaultShipping: true,
                    isDefaultBilling: true,
                },
            })
        }
    }

    // Create order and items in a transaction
    const result = await prisma.$transaction(async (tx) => {
        const orderCount = await tx.order.count()
        const orderNumber = String(1000 + orderCount)
        const order = await tx.order.create({
            data: {
                orderNumber,
                userId,
                subtotal: subtotal.toFixed(2) as any,
                discount: discount.toFixed(2) as any,
                tax: tax.toFixed(2) as any,
                shipping: shipping.toFixed(2) as any,
                total: total.toFixed(2) as any,
                currency,
                shippingAddress: addr as any,
                billingAddress: addr as any,
                items: {
                    create: orderItems.map((i) => ({
                        productId: i.productId,
                        sku: i.sku || undefined,
                        title: i.title,
                        color: i.color || undefined,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice as any,
                        lineTotal: i.lineTotal as any,
                        imageUrl: i.imageUrl || undefined,
                    }))
                },
                notes: body.notes,
            },
            select: { id: true, orderNumber: true, total: true, currency: true },
        })
        await tx.payment.create({
            data: {
                orderId: order.id,
                amount: total.toFixed(2) as any,
                currency,
                provider: 'MANUAL',
                status: 'PENDING',
                method: 'dummy',
            },
        })
        return order
    })

    return NextResponse.json({ orderId: result.id, orderNumber: result.orderNumber, total: result.total, currency: result.currency })
}
