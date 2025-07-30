import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'
import { generateApiKey } from '../lib/api-auth'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await hashPassword('ipFlock2024!Admin')
  const apiKey = generateApiKey()
  
  const user = await prisma.user.upsert({
    where: { email: 'louis.mylle@upgrade-estate.be' },
    update: {
      apiKey: apiKey, // Update existing user with API key
    },
    create: {
      email: 'louis.mylle@upgrade-estate.be',
      password: hashedPassword,
      name: 'Louis Mylle',
      role: 'admin',
      apiKey: apiKey,
    },
  })

  console.log('Created admin user:', user)
  console.log('API Key for testing:', apiKey)
  console.log('Database seeding completed - admin user ready!')
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