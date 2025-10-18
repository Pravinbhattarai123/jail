import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'
import { z } from 'zod'

const ALLOWED_ROLES = ['ADMIN', 'MODERATOR', 'SELLER'] as const

const CreateSubcategorySchema = z.object({
    name: z.string().min(1).max(120),
    // Allow user to pass either categoryId or categorySlug
    categoryId: z.number().int().positive().optional(),
    categorySlug: z.string().min(1).max(200).optional(),
}).refine((d) => !!d.categoryId || !!d.categorySlug, {
    message: 'Either categoryId or categorySlug is required',
    path: ['category'],
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

    const payload = verifyJwt<{ sub: number | string; email?: string }>(token)
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
    const category = searchParams.get('category') // can be id or slug

    let where: any = {}
    if (category) {
        const maybeId = Number(category)
        if (!Number.isNaN(maybeId)) {
            where = { categoryId: maybeId }
        } else {
            where = { category: { slug: category } }
        }
    }

    const subcategories = await prisma.subcategory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            slug: true,
            categoryId: true,
            category: { select: { id: true, name: true, slug: true } },
            createdAt: true,
            updatedAt: true,
        },
    })

    return NextResponse.json({ subcategories })
}

export async function POST(req: Request) {
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await req.json().catch(() => null)
    const parsed = CreateSubcategorySchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { name, categoryId, categorySlug } = parsed.data

    // Resolve category
    let resolvedCategoryId: number | null = null
    if (typeof categoryId === 'number') {
        resolvedCategoryId = categoryId
    } else if (categorySlug) {
        const cat = await prisma.category.findUnique({ where: { slug: categorySlug } })
        if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        resolvedCategoryId = cat.id
    }

    if (!resolvedCategoryId) {
        return NextResponse.json({ error: 'Category not specified' }, { status: 400 })
    }

    const slug = slugify(name)

    try {
        const created = await prisma.subcategory.create({
            data: { name, slug, categoryId: resolvedCategoryId },
            select: {
                id: true,
                name: true,
                slug: true,
                categoryId: true,
                createdAt: true,
            },
        })
        return NextResponse.json({ subcategory: created }, { status: 201 })
    } catch (err: any) {
        if (err?.code === 'P2002') {
            return NextResponse.json({ error: 'Subcategory slug already exists' }, { status: 409 })
        }
        console.error('Create subcategory error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
