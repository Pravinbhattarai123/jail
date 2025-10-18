import nodemailer from 'nodemailer'

function parseBool(value?: string) {
    if (!value) return false
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

export function createTransport() {
    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const secureFromEnv = parseBool(process.env.SMTP_SECURE)
    const smtpDebug = parseBool(process.env.SMTP_DEBUG)
    const requireTLS = parseBool(process.env.SMTP_REQUIRE_TLS)
    const allowSelfSigned = parseBool(process.env.SMTP_ALLOW_SELF_SIGNED)

    if (!host || !user || !pass) {
        throw new Error('SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.')
    }

    // If using Gmail on port 587 and REQUIRE_TLS not explicitly set, default to true
    const effectiveRequireTLS = requireTLS || ((host?.includes('gmail') || host === 'smtp.gmail.com') && port === 587)

    const transport = nodemailer.createTransport({
        host,
        port,
        secure: secureFromEnv || port === 465, // true for 465, false for other ports
        requireTLS: effectiveRequireTLS,
        auth: { user, pass },
        logger: smtpDebug,
        debug: smtpDebug,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: allowSelfSigned ? { rejectUnauthorized: false } : undefined,
    })

    if (smtpDebug) {
        // Minimal, safe debug info
        console.log('[mailer] Transport created', {
            host,
            port,
            secure: secureFromEnv || port === 465,
            requireTLS: effectiveRequireTLS,
            user,
        })
    }

    return transport
}

export async function sendOtpEmail(to: string, code: string) {
    const transporter = createTransport()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com'
    const appName = process.env.APP_NAME || 'JailWeb'

    console.log(`Sending OTP email to ${to} from ${from} via ${process.env.SMTP_HOST}`)

    const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 520px;">
      <h2>${appName} Email Verification</h2>
      <p>Use the code below to verify your email address. It expires in 10 minutes.</p>
      <div style="font-size: 28px; letter-spacing: 4px; font-weight: 700; margin: 16px 0;">${code}</div>
      <p>If you didn’t request this, you can safely ignore this email.</p>
    </div>
  `

    // Verify SMTP connection before sending to catch config/network issues early
    try {
        await transporter.verify()
    } catch (err: any) {
        const info = formatSmtpError(err)
        throw new Error(`SMTP verify failed: ${info}`)
    }

    try {
        await transporter.sendMail({
            from,
            to,
            subject: `${appName} verification code`,
            html,
        })
    } catch (err: any) {
        const info = formatSmtpError(err)
        throw new Error(`Failed to send OTP email: ${info}`)
    }
}

export async function sendWelcomeEmail(to: string, firstName: string, role?: string) {
    const transporter = createTransport()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com'
    const appName = process.env.APP_NAME || 'JailWeb'

    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #111827; margin: 0;">${appName}</h1>
                    <p style="color: #6B7280; margin: 5px 0;">Welcome aboard</p>
                </div>
                <div style="background: #F9FAFB; padding: 30px; border-radius: 10px;">
                    <h2 style="color: #111827; margin-bottom: 20px;">Welcome to ${appName}!</h2>
                    <p style="color: #374151; margin-bottom: 20px;">
                        Hi ${firstName},
                    </p>
                    <p style="color: #374151; margin-bottom: 20px;">
                        Your ${role ?? 'customer'} account has been created successfully.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
                             style="background: #2563EB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Go to Dashboard
                        </a>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 30px; color: #9CA3AF; font-size: 12px;">
                    <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                </div>
            </div>
        `

    try {
        await transporter.verify()
        const result = await transporter.sendMail({
            from,
            to,
            subject: `Welcome to ${appName}, ${firstName}!`,
            html,
        })
        return { success: true, messageId: result.messageId }
    } catch (err: any) {
        const info = formatSmtpError(err)
        throw new Error(`Failed to send welcome email: ${info}`)
    }
}

function formatSmtpError(err: any) {
    const parts: string[] = []
    if (err?.code) parts.push(`code=${err.code}`)
    if (err?.command) parts.push(`command=${err.command}`)
    if (err?.responseCode) parts.push(`responseCode=${err.responseCode}`)
    if (err?.response) parts.push(`response=${sanitize(err.response)}`)
    if (err?.message) parts.push(`message=${sanitize(err.message)}`)
    return parts.join(' ')
}

function sanitize(v: unknown) {
    if (!v) return ''
    return String(v).replace(/\s+/g, ' ').trim()
}

// Lightweight health check that you can call from an API route if needed
export async function mailerHealth() {
    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
    const secure = parseBool(process.env.SMTP_SECURE) || port === 465
    try {
        const tr = createTransport()
        await tr.verify()
        return { ok: true, host, port, secure }
    } catch (err: any) {
        return { ok: false, host, port, secure, error: formatSmtpError(err) }
    }
}
