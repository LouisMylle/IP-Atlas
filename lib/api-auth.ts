import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'
import { prisma } from './db'
import { randomBytes } from 'crypto'

export function generateApiKey(): string {
  return `ipf_${randomBytes(32).toString('hex')}`
}

export async function getAuthenticatedUser(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = req.headers['x-api-key'] as string
  
  if (apiKey) {
    try {
      const user = await prisma.user.findUnique({
        where: { apiKey },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      })
      
      if (user) {
        return user
      }
    } catch (error) {
      console.error('Error validating API key:', error)
    }
  }
  
  const session = await getServerSession(req, res, authOptions)
  
  return session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    createdAt: session.user.createdAt,
  } : null
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const user = await getAuthenticatedUser(req, res)
  
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' })
    return null
  }
  
  return user
}