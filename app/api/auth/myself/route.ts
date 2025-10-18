import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'
import { z } from 'zod'

// GET /api/auth/myself
// Returns the current authenticated user's profile including address details
export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const payload = verifyJwt<{ sub: number | string }>(token)
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub
        if (!userId || Number.isNaN(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                addresses: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        label: true,
                        name: true,
                        phone: true,
                        line1: true,
                        line2: true,
                        city: true,
                        state: true,
                        postalCode: true,
                        countryCode: true,
                        isDefaultShipping: true,
                        isDefaultBilling: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        })

        if (!user || !user.isActive) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        return NextResponse.json({ user })
    } catch (err) {
        console.error('myself route error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/auth/myself
// Updates the authenticated user's own profile (limited fields)
const UpdateProfileSchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    phone: z
        .string()
        .trim()
        .min(7)
        .max(20)
        .regex(/^[+0-9\-()\s]+$/)
        .optional(),
    // Email updates are usually a separate flow with verification; omit here by design
}).refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' })

export async function PATCH(req: Request) {
    try {
        // Auth: only the cookie owner can update their profile
        const cookieStore = await cookies()
        const token = cookieStore.get('auth')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const payload = verifyJwt<{ sub: number | string }>(token)
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub
        if (!userId || Number.isNaN(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Validate body
        const body = await req.json().catch(() => ({}))
        const parsed = UpdateProfileSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
        }

        const data = parsed.data

        // Update allowed fields only
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.phone !== undefined ? { phone: data.phone } : {}),
            },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return NextResponse.json({ user: updated })
    } catch (err: any) {
        // Handle common Prisma unique constraint errors (e.g., phone already used)
        if (err?.code === 'P2002') {
            return NextResponse.json({ error: 'Conflict', details: 'Phone or email already in use' }, { status: 409 })
        }
        console.error('myself PATCH error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

