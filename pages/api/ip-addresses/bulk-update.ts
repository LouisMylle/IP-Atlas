import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import { requireAuth } from '../../../lib/api-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res)
  
  if (!user) {
    return
  }

  if (req.method === 'PATCH') {
    try {
      const { ipIds, updates } = req.body

      if (!Array.isArray(ipIds) || ipIds.length === 0) {
        return res.status(400).json({ message: 'IP IDs array is required' })
      }

      // Build update data
      const updateData: any = {}
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.hostname !== undefined) updateData.hostname = updates.hostname
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.macAddress !== undefined) updateData.macAddress = updates.macAddress
      if (updates.assignedTo !== undefined) updateData.assignedTo = updates.assignedTo
      
      // Set lastSeen if status is being set to 'used'
      if (updates.status === 'used') {
        updateData.lastSeen = new Date()
      }

      // Update multiple IP addresses
      const updatedIPs = await Promise.all(
        ipIds.map(id => 
          prisma.iPAddress.update({
            where: { id },
            data: updateData,
          })
        )
      )

      res.status(200).json({
        message: `Successfully updated ${updatedIPs.length} IP addresses`,
        updatedIPs,
      })
    } catch (error) {
      console.error('Error bulk updating IP addresses:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}