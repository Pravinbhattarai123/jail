import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'

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

export async function GET() {
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    try {
        const [products, categories, subcategories, recentProducts] = await Promise.all([
            prisma.product.count(),
            prisma.category.count(),
            prisma.subcategory.count(),
            prisma.product.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    price: true,
                    currency: true,
                    createdAt: true,
                    subcategory: { select: { name: true, category: { select: { name: true } } } },
                    brand: { select: { name: true } },
                    images: { select: { url: true, position: true }, orderBy: { position: 'asc' } },
                },
            }),
        ])

        const payload = {
            totals: { products, categories, subcategories },
            recentProducts: recentProducts.map((p) => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                price: p.price,
                currency: p.currency,
                createdAt: p.createdAt,
                category: p.subcategory?.category?.name || null,
                subcategory: p.subcategory?.name || null,
                brand: p.brand?.name || null,
                imageUrl: p.images?.[0]?.url || null,
            })),
        }

        return NextResponse.json({ ...payload, data: payload })
    } catch (err: any) {
        console.error('Insights error', err)
        return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
    }
}
