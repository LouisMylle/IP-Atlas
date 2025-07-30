// Utility function to convert IP address to numeric value for proper sorting
export function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0)
}

// Function to sort IP addresses numerically
export function sortIPAddresses<T extends { ip: string }>(addresses: T[]): T[] {
  return addresses.sort((a, b) => ipToNumber(a.ip) - ipToNumber(b.ip))
}

// Function to sort IP addresses by the last octet only (for same subnet)
export function sortByLastOctet<T extends { ip: string }>(addresses: T[]): T[] {
  return addresses.sort((a, b) => {
    const aLastOctet = parseInt(a.ip.split('.')[3], 10)
    const bLastOctet = parseInt(b.ip.split('.')[3], 10)
    return aLastOctet - bLastOctet
  })
}