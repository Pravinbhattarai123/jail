import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // simple roundtrip: count users
        const count = await prisma.user.count()
        return NextResponse.json({ ok: true, users: count })
    } catch (err: any) {
        console.error('DB check failed:', err)
        return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 })
    }
}
