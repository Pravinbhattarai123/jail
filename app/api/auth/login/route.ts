import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signJwt } from '@/lib/auth'
import { z } from 'zod'

const LoginSchema = z.object({ email: z.string().email().toLowerCase(), password: z.string().min(6).max(100) })

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const parsed = LoginSchema.safeParse(body)
        if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        if (!user.emailVerifiedAt) {
            return NextResponse.json({ error: 'Email not verified' }, { status: 403 })
        }

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Issue a JWT cookie
        const token = signJwt({ sub: user.id, email: user.email })
        const res = NextResponse.json({ message: 'Logged in', user: { id: user.id, email: user.email, name: user.name, role: user.role } })
        res.cookies.set('auth', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        })
        return res
    } catch (err) {
        console.error('login error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
