import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import { requireAuth } from '../../../lib/api-auth'
import { sortIPAddresses } from '../../../utils/ip-sorting'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res)
  
  if (!user) {
    return
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid range ID' })
  }

  if (req.method === 'GET') {
    try {
      const range = await prisma.iPRange.findUnique({
        where: { id },
        include: {
          addresses: {
            orderBy: {
              ip: 'asc',
            },
          },
        },
      })

      if (!range) {
        return res.status(404).json({ message: 'IP range not found' })
      }

      const transformedRange = {
        ...range,
        addresses: sortIPAddresses(range.addresses),
        dnsServers: range.dnsServers ? JSON.parse(range.dnsServers) : undefined,
        totalIps: range.addresses.length,
        usedIps: range.addresses.filter(ip => ip.status === 'used').length,
        availableIps: range.addresses.filter(ip => ip.status === 'available').length,
      }

      res.status(200).json(transformedRange)
    } catch (error) {
      console.error('Error fetching IP range:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'PATCH') {
    try {
      const { name, description, gateway, dnsServers, includeInStats, label } = req.body

      const updatedRange = await prisma.iPRange.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          description: description !== undefined ? description : undefined,
          gateway: gateway !== undefined ? gateway : undefined,
          dnsServers: dnsServers !== undefined ? (dnsServers ? JSON.stringify(dnsServers) : null) : undefined,
          includeInStats: includeInStats !== undefined ? includeInStats : undefined,
          label: label !== undefined ? label : undefined,
        },
        include: {
          addresses: {
            orderBy: {
              ip: 'asc',
            },
          },
        },
      })

      const transformedRange = {
        ...updatedRange,
        addresses: sortIPAddresses(updatedRange.addresses),
        dnsServers: updatedRange.dnsServers ? JSON.parse(updatedRange.dnsServers) : undefined,
        totalIps: updatedRange.addresses.length,
        usedIps: updatedRange.addresses.filter(ip => ip.status === 'used').length,
        availableIps: updatedRange.addresses.filter(ip => ip.status === 'available').length,
      }

      res.status(200).json(transformedRange)
    } catch (error) {
      console.error('Error updating IP range:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.iPRange.delete({
        where: { id },
      })

      res.status(200).json({ message: 'IP range deleted successfully' })
    } catch (error) {
      console.error('Error deleting IP range:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}