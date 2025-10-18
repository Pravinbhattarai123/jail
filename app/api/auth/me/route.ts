import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { verifyJwt } from '@/lib/auth'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyJwt<{ sub: number | string }>(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub
    if (!userId || Number.isNaN(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, isActive: true },
    })
    if (!user || !user.isActive) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    return NextResponse.json({ user })
}
