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

const SignUpSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().toLowerCase(),
    phone: z.string().min(6).max(20).optional().or(z.literal('')).transform(v => v || undefined),
    password: z.string().min(6).max(100),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const parsed = SignUpSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
        }
        const { name, email, phone, password } = parsed.data

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing && existing.emailVerifiedAt) {
            return NextResponse.json({ error: 'User already exists and is verified' }, { status: 409 })
        }

        const passwordHash = await bcrypt.hash(password, 12)

        const user = await prisma.user.upsert({
            where: { email },
            update: { name, phone, passwordHash },
            create: { name, email, phone, passwordHash },
        })

        // Create a fresh OTP
        const code = generateOtp(6)
        const codeHash = await bcrypt.hash(code, 10)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

        await prisma.otpToken.create({
            data: {
                userId: user.id,
                email,
                codeHash,
                purpose: 'EMAIL_VERIFICATION',
                expiresAt,
            },
        })

        await sendOtpEmail(email, code)

        return NextResponse.json({ message: 'OTP sent to email', userId: user.id })
    } catch (err: any) {
        console.error('sign-up error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
