import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import { requireAuth } from '../../../lib/api-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res)
  
  if (!user) {
    return
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid IP address ID' })
  }

  if (req.method === 'PATCH') {
    try {
      const { status, hostname, description, macAddress, assignedTo } = req.body

      const updatedIP = await prisma.iPAddress.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(hostname !== undefined && { hostname }),
          ...(description !== undefined && { description }),
          ...(macAddress !== undefined && { macAddress }),
          ...(assignedTo !== undefined && { assignedTo }),
          ...(status === 'used' && { lastSeen: new Date() }),
        },
      })

      res.status(200).json(updatedIP)
    } catch (error) {
      console.error('Error updating IP address:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}