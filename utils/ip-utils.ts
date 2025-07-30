export function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => acc * 256 + parseInt(octet), 0);
}

export function sortIPAddresses<T extends { ip: string }>(addresses: T[]): T[] {
  return [...addresses].sort((a, b) => ipToNumber(a.ip) - ipToNumber(b.ip));
}

export function createIPAddressesForRange(range: any) {
  const network = range.network;
  const cidr = parseInt(range.cidr);
  const networkParts = network.split('.').map(Number);
  const totalHosts = Math.pow(2, 32 - cidr) - 2; // Subtract network and broadcast
  
  const addresses = [];
  
  for (let i = 1; i <= totalHosts; i++) {
    const ip = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.${networkParts[3] + i}`;
    
    addresses.push({
      ip,
      status: 'available' as const,
      hostname: null,
      description: null,
      macAddress: null,
      assignedTo: null,
      lastSeen: null,
    });
  }
  
  return addresses;
}