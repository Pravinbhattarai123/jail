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

    const address = await prisma.address.findFirst({ where: { userId, isDefaultShipping: true } })
    return NextResponse.json({ address })
}

export async function POST(req: Request) {
    const userId = await getUserIdFromCookie()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null) as any
    if (!body?.line1 || !body?.city || !body?.postalCode || !body?.countryCode) {
        return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    const existing = await prisma.address.findFirst({ where: { userId, isDefaultShipping: true } })
    if (existing) {
        const updated = await prisma.address.update({
            where: { id: existing.id }, data: {
                name: body.name,
                phone: body.phone,
                line1: body.line1,
                line2: body.line2,
                city: body.city,
                state: body.state,
                postalCode: body.postalCode,
                countryCode: body.countryCode,
                label: body.label ?? existing.label ?? 'Default',
                isDefaultShipping: true,
                isDefaultBilling: true,
            }
        })
        return NextResponse.json({ address: updated })
    }
    const created = await prisma.address.create({
        data: {
            userId,
            name: body.name,
            phone: body.phone,
            line1: body.line1,
            line2: body.line2,
            city: body.city,
            state: body.state,
            postalCode: body.postalCode,
            countryCode: body.countryCode,
            label: body.label ?? 'Default',
            isDefaultShipping: true,
            isDefaultBilling: true,
        }
    })
    return NextResponse.json({ address: created })
}
