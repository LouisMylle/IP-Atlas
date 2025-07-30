import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import { requireAuth, generateApiKey } from '../../../lib/api-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res)
  
  if (!user) {
    return
  }

  if (req.method === 'GET') {
    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { apiKey: true },
      })

      res.status(200).json({ apiKey: userData?.apiKey || null })
    } catch (error) {
      console.error('Error fetching API key:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const newApiKey = generateApiKey()
      
      // First check if user exists, if not create it
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      })
      
      if (!existingUser) {
        // Create user if it doesn't exist
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email || '',
            name: user.name || '',
            password: '', // Required field, but empty for OAuth users
            apiKey: newApiKey,
          },
        })
      } else {
        // Update existing user
        await prisma.user.update({
          where: { id: user.id },
          data: { apiKey: newApiKey },
        })
      }

      res.status(201).json({ apiKey: newApiKey })
    } catch (error) {
      console.error('Error generating API key:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      // Check if user exists first
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      })
      
      if (existingUser) {
        await prisma.user.update({
          where: { id: user.id },
          data: { apiKey: null },
        })
      }

      res.status(200).json({ message: 'API key revoked successfully' })
    } catch (error) {
      console.error('Error revoking API key:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}