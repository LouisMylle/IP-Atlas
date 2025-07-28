export interface IPRange {
  id: string;
  name: string;
  network: string;
  cidr: number;
  vlan?: number;
  description?: string;
  gateway?: string;
  dnsServers?: string[];
  created: Date;
  updated: Date;
}

export interface IPAddress {
  id: string;
  rangeId: string;
  ip: string;
  status: 'available' | 'used' | 'reserved' | 'offline';
  hostname?: string;
  description?: string;
  macAddress?: string;
  assignedTo?: string;
  lastSeen?: Date;
  created: Date;
  updated: Date;
}

export interface IPRangeWithAddresses extends IPRange {
  addresses: IPAddress[];
  totalIps: number;
  usedIps: number;
  availableIps: number;
}