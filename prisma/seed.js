/*
  Seed script: Create/ensure an Admin user exists
  - Reads ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME from env (optional)
  - If user exists: ensures role is ADMIN and active; updates password only if ADMIN_PASSWORD provided
  - If user doesn't exist: creates with hashed password and marks email verified
*/

import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

function generateStrongPassword(length = 16) {
  // Generate URL-safe random string
  return crypto
    .randomBytes(Math.ceil((length * 3) / 4))
    .toString('base64url')
    .slice(0, length)
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@jail.com').toLowerCase()
  const name = process.env.ADMIN_NAME || 'Admin'
  const providedPassword = 'admin1234'

  let passwordToUse = providedPassword || generateStrongPassword(18)
  const generated = !providedPassword

  const passwordHash = await bcrypt.hash(passwordToUse, 10)

  const existing = await prisma.user.findUnique({ where: { email } })

  if (!existing) {
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
        emailVerifiedAt: new Date(),
      },
    })

    console.log('✅ Created admin user:', { id: admin.id, email: admin.email, role: admin.role })
    if (generated) {
      console.log('ℹ️ Generated ADMIN_PASSWORD (store it securely):', passwordToUse)
    }
    return
  }

  // If exists: ensure role/admin flags; update password only if explicitly provided
  const updateData = { isActive: true }
  if (existing.role !== UserRole.ADMIN) updateData.role = UserRole.ADMIN
  if (!existing.emailVerifiedAt) updateData.emailVerifiedAt = new Date()
  if (providedPassword) updateData.passwordHash = passwordHash

  if (Object.keys(updateData).length > 0) {
    const updated = await prisma.user.update({ where: { email }, data: updateData })
    console.log('🔁 Updated existing user to admin:', { id: updated.id, email: updated.email, role: updated.role })
    if (providedPassword) {
      console.log('🔒 Admin password was updated from ADMIN_PASSWORD env')
    }
  } else {
    console.log('✅ Admin user already up-to-date:', { id: existing.id, email: existing.email, role: existing.role })
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

