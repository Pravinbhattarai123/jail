import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const VerifySchema = z.object({ email: z.string().email().toLowerCase(), code: z.string().min(4).max(8) })

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const parsed = VerifySchema.safeParse(body)
        if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
        const { email, code } = parsed.data

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Find latest valid OTP for email verification
        const token = await prisma.otpToken.findFirst({
            where: {
                email,
                purpose: 'EMAIL_VERIFICATION',
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        })

        if (!token) {
            return NextResponse.json({ error: 'No valid OTP found or it has expired' }, { status: 400 })
        }

        const ok = await bcrypt.compare(code, token.codeHash)
        if (!ok) {
            await prisma.otpToken.update({ where: { id: token.id }, data: { attempts: { increment: 1 } } })
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
        }

        await prisma.$transaction([
            prisma.otpToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
            prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } }),
        ])

        return NextResponse.json({ message: 'Email verified', userId: user.id })
    } catch (err) {
        console.error('verify-otp error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
