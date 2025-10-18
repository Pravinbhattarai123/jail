import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'

const ALLOWED_ROLES = ['ADMIN', 'MODERATOR', 'SELLER'] as const

async function getAuthorizedUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth')?.value
    if (!token) return { status: 401 as const, error: 'Unauthorized: missing token' } as const

    const payload = verifyJwt<{ sub: number | string }>(token)
    if (!payload) return { status: 401 as const, error: 'Unauthorized: invalid token' } as const

    return { status: 200 as const }
}

// Helper to upload a single file buffer to Cloudinary via fetch API (video endpoint)
async function uploadToCloudinaryVideo(file: File) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName) throw new Error('Missing CLOUDINARY_CLOUD_NAME')

    const form = new FormData()
    form.append('file', file)

    // Signed uploads only: require API key/secret
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
    if (!apiKey || !apiSecret) {
        throw new Error('Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET')
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const paramsToSign = `timestamp=${timestamp}${apiSecret}`
    const signature = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(paramsToSign))
    const hex = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('')
    form.append('timestamp', String(timestamp))
    form.append('api_key', apiKey)
    form.append('signature', hex)

    const res = await fetch(url, { method: 'POST', body: form })
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Cloudinary upload failed: ${res.status} ${txt}`)
    }
    const json = await res.json()
    return json.secure_url as string
}

export async function POST(req: Request) {
    const auth = await getAuthorizedUser()
    if (auth.status !== 200) return NextResponse.json({ error: auth.error }, { status: auth.status })

    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME
        const apiKey = process.env.CLOUDINARY_API_KEY
        const apiSecret = process.env.CLOUDINARY_API_SECRET
        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json(
                { error: 'Video upload disabled: missing Cloudinary configuration' },
                { status: 400 }
            )
        }

        const contentType = req.headers.get('content-type') || ''
        if (!contentType.includes('multipart/form-data')) {
            return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
        }

        const form = await req.formData()
        const files = form.getAll('files') as File[]
        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 })
        }

        const urls: string[] = []
        for (const f of files) {
            if (!(f instanceof File)) continue
            // Basic validation — only accept video MIME types
            const type = f.type || ''
            if (!type.startsWith('video/')) {
                // skip non-video files
                console.warn('Skipping non-video file upload:', f.name, type)
                continue
            }
            const url = await uploadToCloudinaryVideo(f)
            urls.push(url)
        }

        if (urls.length === 0) {
            return NextResponse.json({ error: 'No valid video files uploaded' }, { status: 400 })
        }

        return NextResponse.json({ urls }, { status: 200 })
    } catch (err: any) {
        console.error('Video upload error', err)
        return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
    }
}
