import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendOtpEmail } from '@/lib/mailer'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

function generateOtp(length = 6) {
    const min = 10 ** (length - 1)
    const max = 10 ** length - 1
    return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

const ResendSchema = z.object({ email: z.string().email().toLowerCase() })

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const parsed = ResendSchema.safeParse(body)
        if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
        const { email } = parsed.data

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
        if (user.emailVerifiedAt) return NextResponse.json({ error: 'Already verified' }, { status: 400 })

        // Basic throttle: allow if no OTP in last 60 seconds
        const recent = await prisma.otpToken.findFirst({
            where: { email, purpose: 'EMAIL_VERIFICATION' },
            orderBy: { createdAt: 'desc' },
        })
        if (recent && Date.now() - recent.createdAt.getTime() < 60_000) {
            return NextResponse.json({ error: 'Please wait before requesting another code' }, { status: 429 })
        }

        const code = generateOtp(6)
        const codeHash = await bcrypt.hash(code, 10)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await prisma.otpToken.create({
            data: { userId: user.id, email, codeHash, purpose: 'EMAIL_VERIFICATION', expiresAt },
        })
        await sendOtpEmail(email, code)


        return NextResponse.json({ message: 'OTP resent' })
    } catch (err) {
        console.error('resend-otp error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
