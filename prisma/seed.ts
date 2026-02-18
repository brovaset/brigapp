import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  const password = await hashPassword('Test123!')
  const testUser = await prisma.user.upsert({
    where: { email: 'test@brigap.com' },
    update: { password },
    create: {
      email: 'test@brigap.com',
      password,
      firstName: 'Test',
      lastName: 'User',
      role: 'BOTH',
    },
  })
  console.log('Test user created:', testUser.email)
  console.log('  Email: test@brigap.com')
  console.log('  Password: Test123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
