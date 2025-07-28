import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IPRangeCard } from "@/components/IPRangeCard";
import { IPAddressGrid } from "@/components/IPAddressGrid";
import { AddRangeDialog } from "@/components/AddRangeDialog";
import { IPRange, IPAddress, IPRangeWithAddresses } from "@/types/ip-management";
import { createIPAddressesForRange } from "@/utils/ip-utils";
import { ArrowLeft, Network, Server, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample data
const generateSampleData = (): IPRangeWithAddresses[] => {
  const ranges: IPRange[] = [
    {
      id: "1",
      name: "Main Office Network",
      network: "192.168.1.0",
      cidr: 24,
      vlan: 100,
      description: "Primary office network for workstations and servers",
      gateway: "192.168.1.1",
      dnsServers: ["8.8.8.8", "8.8.4.4"],
      created: new Date(),
      updated: new Date(),
    },
    {
      id: "2", 
      name: "Server Network",
      network: "10.0.10.0",
      cidr: 24,
      vlan: 200,
      description: "Dedicated network for production servers",
      gateway: "10.0.10.1",
      dnsServers: ["10.0.10.2", "10.0.10.3"],
      created: new Date(),
      updated: new Date(),
    },
    {
      id: "3",
      name: "Guest WiFi",
      network: "172.16.0.0",
      cidr: 22,
      vlan: 300,
      description: "Guest wireless network with limited access",
      gateway: "172.16.0.1",
      created: new Date(),
      updated: new Date(),
    }
  ];

  return ranges.map(range => {
    const addresses = createIPAddressesForRange(range);
    
    // Add some sample used IPs
    if (range.id === "1") {
      addresses[0] = { ...addresses[0], status: 'used', hostname: 'gateway', assignedTo: 'Network Gateway', description: 'Primary gateway router' };
      addresses[4] = { ...addresses[4], status: 'used', hostname: 'file-server', assignedTo: 'IT Department', description: 'Main file server' };
      addresses[9] = { ...addresses[9], status: 'reserved', hostname: 'backup-server', description: 'Reserved for backup server' };
      addresses[14] = { ...addresses[14], status: 'used', hostname: 'printer-01', assignedTo: 'Office Printer', description: 'HP LaserJet printer' };
    } else if (range.id === "2") {
      addresses[0] = { ...addresses[0], status: 'used', hostname: 'web-server-01', assignedTo: 'Web Team', description: 'Primary web server' };
      addresses[1] = { ...addresses[1], status: 'used', hostname: 'db-server-01', assignedTo: 'Database Team', description: 'PostgreSQL database server' };
      addresses[4] = { ...addresses[4], status: 'reserved', description: 'Reserved for load balancer' };
    }

    const usedIps = addresses.filter(ip => ip.status === 'used').length;
    const availableIps = addresses.filter(ip => ip.status === 'available').length;

    return {
      ...range,
      addresses,
      totalIps: addresses.length,
      usedIps,
      availableIps,
    };
  });
};

const Index = () => {
  const [ranges, setRanges] = useState<IPRangeWithAddresses[]>([]);
  const [selectedRange, setSelectedRange] = useState<IPRangeWithAddresses | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setRanges(generateSampleData());
  }, []);

  const handleAddRange = (newRangeData: Omit<IPRange, 'id' | 'created' | 'updated'>) => {
    const newRange: IPRange = {
      ...newRangeData,
      id: Date.now().toString(),
      created: new Date(),
      updated: new Date(),
    };

    const addresses = createIPAddressesForRange(newRange);
    const newRangeWithAddresses: IPRangeWithAddresses = {
      ...newRange,
      addresses,
      totalIps: addresses.length,
      usedIps: 0,
      availableIps: addresses.length,
    };

    setRanges(prev => [...prev, newRangeWithAddresses]);
    toast({
      title: "IP Range Added",
      description: `Successfully added ${newRange.name} with ${addresses.length} IP addresses.`,
    });
  };

  const handleUpdateIP = (updatedIP: IPAddress) => {
    setRanges(prev => prev.map(range => {
      if (range.id !== updatedIP.rangeId) return range;
      
      const updatedAddresses = range.addresses.map(ip => 
        ip.id === updatedIP.id ? updatedIP : ip
      );
      
      const usedIps = updatedAddresses.filter(ip => ip.status === 'used').length;
      const availableIps = updatedAddresses.filter(ip => ip.status === 'available').length;
      
      return {
        ...range,
        addresses: updatedAddresses,
        usedIps,
        availableIps,
      };
    }));

    // Update selected range if it's the one being modified
    if (selectedRange?.id === updatedIP.rangeId) {
      const updatedRange = ranges.find(r => r.id === updatedIP.rangeId);
      if (updatedRange) {
        const updatedAddresses = updatedRange.addresses.map(ip => 
          ip.id === updatedIP.id ? updatedIP : ip
        );
        setSelectedRange({
          ...updatedRange,
          addresses: updatedAddresses,
        });
      }
    }

    toast({
      title: "IP Updated",
      description: `Successfully updated ${updatedIP.ip}`,
    });
  };

  const totalIPs = ranges.reduce((sum, range) => sum + range.totalIps, 0);
  const totalUsed = ranges.reduce((sum, range) => sum + range.usedIps, 0);
  const totalAvailable = ranges.reduce((sum, range) => sum + range.availableIps, 0);

  if (selectedRange) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedRange(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ranges
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedRange.name}</h1>
              <p className="text-muted-foreground">
                {selectedRange.network}/{selectedRange.cidr}
                {selectedRange.vlan && ` • VLAN ${selectedRange.vlan}`}
              </p>
            </div>
          </div>
          
          <IPAddressGrid 
            range={selectedRange} 
            onUpdateIP={handleUpdateIP}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">IP Range Manager</h1>
            <p className="text-muted-foreground">Manage your network IP ranges and allocations</p>
          </div>
          <AddRangeDialog onAddRange={handleAddRange} />
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ranges</CardTitle>
              <Network className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ranges.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total IPs</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIPs.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Used IPs</CardTitle>
              <Activity className="h-4 w-4 text-ip-used" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ip-used">{totalUsed}</div>
              <p className="text-xs text-muted-foreground">
                {totalIPs > 0 ? Math.round((totalUsed / totalIPs) * 100) : 0}% utilization
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available IPs</CardTitle>
              <Activity className="h-4 w-4 text-ip-available" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-ip-available">{totalAvailable}</div>
            </CardContent>
          </Card>
        </div>

        {/* IP Ranges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ranges.map((range) => (
            <IPRangeCard
              key={range.id}
              range={range}
              onViewDetails={setSelectedRange}
              onEdit={(range) => {
                toast({
                  title: "Edit Range",
                  description: "Range editing will be implemented in the next version.",
                });
              }}
            />
          ))}
        </div>

        {ranges.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Network className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No IP Ranges</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by adding your first IP range to manage your network allocations.
              </p>
              <AddRangeDialog onAddRange={handleAddRange} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
