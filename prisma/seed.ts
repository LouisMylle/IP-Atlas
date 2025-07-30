import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'
import { randomBytes } from 'crypto'

function generateApiKey(): string {
  return `ipf_${randomBytes(32).toString('hex')}`
}

const prisma = new PrismaClient()

async function main() {
  // Create starter admin user
  const hashedPassword = await hashPassword('admin123')
  const apiKey = generateApiKey()
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@ipatlas.local' },
    update: {
      apiKey: apiKey, // Update existing user with API key
    },
    create: {
      email: 'admin@ipatlas.local',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      apiKey: apiKey,
    },
  })

  console.log('Created starter admin user:', user)
  console.log('Default credentials:')
  console.log('  Email: admin@ipatlas.local')
  console.log('  Password: admin123')
  console.log('  API Key:', apiKey)
  console.log('')
  console.log('⚠️  IMPORTANT: Change these credentials after first login!')
  console.log('Database seeding completed - starter admin user ready!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })