import { NextResponse } from 'next/server'

export async function POST() {
    const res = NextResponse.json({ message: 'Logged out' })
    // Clear the auth cookie
    res.cookies.set({
        name: 'auth',
        value: '',
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    })
    return res
}
