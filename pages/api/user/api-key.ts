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
        where: { email: user.email || '' },
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
      
      // Use upsert to handle both create and update cases
      await prisma.user.upsert({
        where: { email: user.email || '' },
        update: { 
          apiKey: newApiKey,
          name: user.name || undefined, // Only update if provided
        },
        create: {
          email: user.email || '',
          name: user.name || '',
          password: '', // Required field, but empty for OAuth users
          apiKey: newApiKey,
        },
      })

      res.status(201).json({ apiKey: newApiKey })
    } catch (error) {
      console.error('Error generating API key:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      // Check if user exists first
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email || '' },
      })
      
      if (existingUser) {
        await prisma.user.update({
          where: { email: user.email || '' },
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