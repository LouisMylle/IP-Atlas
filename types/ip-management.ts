export interface IPAddress {
  id: string
  rangeId: string
  ip: string
  status: 'available' | 'used' | 'reserved'
  hostname?: string
  description?: string
  macAddress?: string
  assignedTo?: string
  lastSeen?: Date
}

export interface IPRange {
  id: string
  name: string
  network: string
  cidr: string
  vlan?: string
  description?: string
  gateway?: string
  dnsServers?: string[]
  includeInStats?: boolean
  label?: string
  createdAt: Date
  updatedAt: Date
}

export interface IPRangeWithAddresses extends IPRange {
  addresses: IPAddress[]
  totalIps: number
  usedIps: number
  availableIps: number
}