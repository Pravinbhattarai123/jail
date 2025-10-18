import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'dev-secret-change-me'
const JWT_EXPIRES_SEC = parseInt(process.env.JWT_EXPIRES_SEC || '604800') // 7 days

export function signJwt(payload: object) {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_SEC }
    return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyJwt<T = any>(token: string): T | null {
    try {
        return jwt.verify(token, JWT_SECRET) as T
    } catch {
        return null
    }
}
