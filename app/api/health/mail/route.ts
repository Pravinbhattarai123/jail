import { NextResponse } from 'next/server'
import { mailerHealth } from '@/lib/mailer'

export async function GET() {
  const result = await mailerHealth()
  // Do not leak secrets; only return high-level info and error message
  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
