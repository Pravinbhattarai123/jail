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

export async function GET() {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        select: {
            id: true,
            items: {
                select: {
                    id: true,
                    productId: true,
                    product: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            price: true,
                            currency: true,
                            images: { select: { id: true, url: true, position: true } },
                            brand: { select: { id: true, name: true, slug: true } },
                            subcategory: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    category: { select: { id: true, name: true, slug: true } },
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    return NextResponse.json({ items: wishlist?.items || [] })
}

export async function POST(req: Request) {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    const productId = Number(body?.productId)
    if (!productId || Number.isNaN(productId)) {
        return NextResponse.json({ error: 'productId required' }, { status: 400 })
    }

    // Ensure product exists and is active
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, active: true } })
    if (!product || !product.active) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // Ensure wishlist exists
    const wl = await prisma.wishlist.upsert({
        where: { userId },
        update: {},
        create: { userId },
        select: { id: true },
    })

    try {
        await prisma.wishlistItem.create({ data: { wishlistId: wl.id, productId } })
    } catch (err: any) {
        // Unique constraint on (wishlistId, productId) prevents duplicates; ignore if already exists
    }

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

    const wishlist = await prisma.wishlist.findUnique({ where: { userId }, select: { id: true } })
    if (!wishlist) return NextResponse.json({ success: true })

    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } })
    return NextResponse.json({ success: true })
}
