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

function asDecimal(n: any) {
    if (typeof n === 'number') return n
    if (typeof n === 'string') return parseFloat(n)
    if (n && typeof n === 'object') {
        if (typeof n.toNumber === 'function') return n.toNumber()
        if (typeof n.toString === 'function') return parseFloat(n.toString())
    }
    const num = Number(n)
    return Number.isNaN(num) ? 0 : num
}

async function recalcCart(cartId: string) {
    const items = await prisma.cartItem.findMany({ where: { cartId } })
    const subtotal = items.reduce((sum, it) => sum + asDecimal(it.unitPrice) * it.quantity, 0)
    // For now ignore discount/tax/shipping; keep simple
    const discount = 0
    const tax = 0
    const shipping = 0
    const total = subtotal - discount + tax + shipping
    const currency = items[0]?.currency || 'INR'
    await prisma.cart.update({ where: { id: cartId }, data: { subtotal: subtotal.toFixed(2), discount: discount.toFixed(2), tax: tax.toFixed(2), shipping: shipping.toFixed(2), total: total.toFixed(2), currency } })
}

export async function GET() {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const cart = await prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
        select: {
            id: true,
            status: true,
            subtotal: true,
            discount: true,
            tax: true,
            shipping: true,
            total: true,
            currency: true,
            items: {
                select: {
                    id: true,
                    productId: true,
                    quantity: true,
                    unitPrice: true,
                    currency: true,
                    product: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            price: true,
                            currency: true,
                            images: { select: { id: true, url: true, position: true } },
                        },
                    },
                },
            },
        },
    })

    return NextResponse.json({ cart })
}

export async function POST(req: Request) {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const productId = Number(body?.productId)
    const quantity = Math.max(1, parseInt(body?.quantity || '1', 10))
    const colorSnap: string | null = typeof body?.color === 'string' && body.color.trim() ? String(body.color).trim() : null
    if (!productId || Number.isNaN(productId)) {
        return NextResponse.json({ error: 'productId required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
            id: true, title: true, color: true,
            price: true, currency: true, active: true, stock: true,
            images: { select: { url: true, position: true, id: true }, orderBy: [{ position: 'asc' }, { id: 'asc' }] }
        }
    })
    if (!product || !product.active) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (product.stock <= 0) return NextResponse.json({ error: 'Out of stock' }, { status: 400 })

    const cart = await prisma.cart.upsert({ where: { userId }, update: {}, create: { userId }, select: { id: true } })

    const existing = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } } as any })
    if (existing) {
        await prisma.cartItem.update({
            where: { id: existing.id },
            data: {
                quantity: existing.quantity + quantity,
                unitPrice: product.price,
                currency: product.currency,
                title: product.title,
                color: colorSnap ?? product.color,
                productImageUrl: product.images?.[0]?.url ?? existing.productImageUrl ?? null,
            }
        })
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
                unitPrice: product.price,
                currency: product.currency,
                title: product.title,
                color: colorSnap ?? product.color,
                productImageUrl: product.images?.[0]?.url ?? null,
            }
        })
    }

    await recalcCart(cart.id)
    return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const productId = Number(body?.productId)
    if (!productId || Number.isNaN(productId)) {
        return NextResponse.json({ error: 'productId required' }, { status: 400 })
    }

    const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } })
    if (!cart) return NextResponse.json({ success: true })

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } })
    await recalcCart(cart.id)
    return NextResponse.json({ success: true })
}

export async function PATCH(req: Request) {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const productId = Number(body?.productId)
    let quantity = parseInt(body?.quantity, 10)
    if (!productId || Number.isNaN(productId)) {
        return NextResponse.json({ error: 'productId required' }, { status: 400 })
    }
    if (Number.isNaN(quantity)) return NextResponse.json({ error: 'quantity required' }, { status: 400 })

    const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } })
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, stock: true, price: true, currency: true } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // Normalize quantity
    if (quantity <= 0) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } })
        await recalcCart(cart.id)
        return NextResponse.json({ success: true })
    }
    if (product.stock >= 0) {
        quantity = Math.min(quantity, product.stock)
    }

    const item = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } } as any })
    if (!item) {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
                unitPrice: product.price,
                currency: product.currency,
                title: '',
                color: null,
                productImageUrl: null,
            }
        })
    } else {
        await prisma.cartItem.update({ where: { id: item.id }, data: { quantity, unitPrice: product.price, currency: product.currency } })
    }

    await recalcCart(cart.id)
    return NextResponse.json({ success: true })
}
