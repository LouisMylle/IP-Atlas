import { IPAddress, IPRange } from "@/types/ip-management";

export const generateIPAddresses = (network: string, cidr: number): string[] => {
  const [baseIP, ] = network.split('/');
  const [a, b, c, d] = baseIP.split('.').map(Number);
  
  const hostBits = 32 - cidr;
  const totalHosts = Math.pow(2, hostBits);
  
  // Calculate network and broadcast addresses
  const networkInt = (a << 24) | (b << 16) | (c << 8) | d;
  const mask = 0xFFFFFFFF << hostBits;
  const networkAddr = networkInt & mask;
  
  const ips: string[] = [];
  
  for (let i = 1; i < totalHosts - 1; i++) { // Skip network and broadcast
    const ipInt = networkAddr + i;
    const ip = [
      (ipInt >>> 24) & 0xFF,
      (ipInt >>> 16) & 0xFF,
      (ipInt >>> 8) & 0xFF,
      ipInt & 0xFF
    ].join('.');
    ips.push(ip);
  }
  
  return ips;
};

export const createIPAddressesForRange = (range: IPRange): IPAddress[] => {
  const ips = generateIPAddresses(range.network, range.cidr);
  
  return ips.map((ip, index) => ({
    id: `${range.id}-ip-${index}`,
    rangeId: range.id,
    ip,
    status: 'available' as const,
    created: new Date(),
    updated: new Date(),
  }));
};

export const isValidIPv4 = (ip: string): boolean => {
  const regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(regex);
  
  if (!match) return false;
  
  return match.slice(1).every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
};

export const calculateSubnetInfo = (network: string, cidr: number) => {
  const hostBits = 32 - cidr;
  const totalIps = Math.pow(2, hostBits) - 2; // Subtract network and broadcast
  
  return {
    totalIps,
    hostBits,
    subnetMask: ((0xFFFFFFFF << hostBits) >>> 0).toString(2).match(/.{1,8}/g)?.map(b => parseInt(b, 2)).join('.') || '',
  };
};