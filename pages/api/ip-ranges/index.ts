import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/db'
import { createIPAddressesForRange } from '../../../utils/ip-utils'
import { requireAuth } from '../../../lib/api-auth'
import { sortIPAddresses } from '../../../utils/ip-utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireAuth(req, res)
  
  if (!user) {
    return
  }

  if (req.method === 'GET') {
    try {
      const ranges = await prisma.iPRange.findMany({
        include: {
          addresses: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Transform data to match frontend interface with proper IP sorting
      const transformedRanges = ranges.map(range => ({
        ...range,
        addresses: sortIPAddresses(range.addresses),
        dnsServers: range.dnsServers ? JSON.parse(range.dnsServers) : undefined,
        totalIps: range.addresses.length,
        usedIps: range.addresses.filter(ip => ip.status === 'used').length,
        availableIps: range.addresses.filter(ip => ip.status === 'available').length,
      }))

      res.status(200).json(transformedRanges)
    } catch (error) {
      console.error('Error fetching IP ranges:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, network, cidr, vlan, description, gateway, dnsServers, includeInStats, label } = req.body

      if (!name || !network || !cidr) {
        return res.status(400).json({ message: 'Name, network, and CIDR are required' })
      }

      // Create the range
      const range = await prisma.iPRange.create({
        data: {
          name,
          network,
          cidr,
          vlan,
          description,
          gateway,
          dnsServers: dnsServers ? JSON.stringify(dnsServers) : null,
          includeInStats: includeInStats !== undefined ? includeInStats : true,
          label: label || 'public',
        },
      })

      // Generate IP addresses for the range
      const addresses = createIPAddressesForRange({
        id: range.id,
        name: range.name,
        network: range.network,
        cidr: range.cidr,
        vlan: range.vlan,
        description: range.description,
        gateway: range.gateway,
        dnsServers: range.dnsServers ? JSON.parse(range.dnsServers) : undefined,
        created: range.createdAt,
        updated: range.updatedAt,
      })

      // Save all IP addresses
      await prisma.iPAddress.createMany({
        data: addresses.map(addr => ({
          rangeId: range.id,
          ip: addr.ip,
          status: addr.status,
          hostname: addr.hostname,
          description: addr.description,
          macAddress: addr.macAddress,
          assignedTo: addr.assignedTo,
          lastSeen: addr.lastSeen,
        })),
      })

      // Fetch the complete range with addresses
      const completeRange = await prisma.iPRange.findUnique({
        where: { id: range.id },
        include: { addresses: true },
      })

      const transformedRange = {
        ...completeRange,
        addresses: completeRange?.addresses ? sortIPAddresses(completeRange.addresses) : [],
        dnsServers: completeRange?.dnsServers ? JSON.parse(completeRange.dnsServers) : undefined,
        totalIps: completeRange?.addresses.length || 0,
        usedIps: completeRange?.addresses.filter(ip => ip.status === 'used').length || 0,
        availableIps: completeRange?.addresses.filter(ip => ip.status === 'available').length || 0,
      }

      res.status(201).json(transformedRange)
    } catch (error) {
      console.error('Error creating IP range:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}