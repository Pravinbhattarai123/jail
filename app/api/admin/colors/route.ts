import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    const colors = await prisma.color.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json({ colors })
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null)
    const name = String(body?.name || '').trim()
    const hex = body?.hex ? String(body.hex) : null
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    const nameLower = name.toLowerCase()
    const color = await prisma.color.upsert({
        where: { nameLower },
        update: { name, hex: hex ?? undefined },
        create: { name, nameLower, hex: hex ?? undefined },
    })
    return NextResponse.json({ color })
}
