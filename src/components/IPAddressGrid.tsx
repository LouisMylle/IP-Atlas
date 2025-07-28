import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IPAddress, IPRangeWithAddresses } from "@/types/ip-management";
import { Edit, Filter, Search } from "lucide-react";

interface IPAddressGridProps {
  range: IPRangeWithAddresses;
  onUpdateIP: (ip: IPAddress) => void;
}

export const IPAddressGrid = ({ range, onUpdateIP }: IPAddressGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIP, setSelectedIP] = useState<IPAddress | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredAddresses = range.addresses.filter(ip => {
    const matchesSearch = ip.ip.includes(searchTerm) || 
      ip.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ip.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: IPAddress['status']) => {
    switch (status) {
      case 'available': return 'bg-ip-available text-ip-available-foreground';
      case 'used': return 'bg-ip-used text-ip-used-foreground';
      case 'reserved': return 'bg-ip-reserved text-ip-reserved-foreground';
      case 'offline': return 'bg-ip-offline text-ip-offline-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleSaveIP = (updatedIP: IPAddress) => {
    onUpdateIP(updatedIP);
    setIsEditDialogOpen(false);
    setSelectedIP(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>IP Addresses - {range.name}</span>
            <Badge variant="outline">{range.network}/{range.cidr}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search IPs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by IP, hostname, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredAddresses.map((ip) => (
              <Card key={ip.id} className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium">{ip.ip}</span>
                    <Dialog open={isEditDialogOpen && selectedIP?.id === ip.id} onOpenChange={(open) => {
                      setIsEditDialogOpen(open);
                      if (!open) setSelectedIP(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedIP(ip)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <IPEditDialog ip={ip} onSave={handleSaveIP} />
                    </Dialog>
                  </div>
                  
                  <Badge className={`text-xs mb-2 ${getStatusColor(ip.status)}`}>
                    {ip.status.charAt(0).toUpperCase() + ip.status.slice(1)}
                  </Badge>
                  
                  {ip.hostname && (
                    <div className="text-xs text-muted-foreground mb-1">
                      <strong>Host:</strong> {ip.hostname}
                    </div>
                  )}
                  
                  {ip.assignedTo && (
                    <div className="text-xs text-muted-foreground mb-1">
                      <strong>Assigned:</strong> {ip.assignedTo}
                    </div>
                  )}
                  
                  {ip.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {ip.description}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface IPEditDialogProps {
  ip: IPAddress;
  onSave: (ip: IPAddress) => void;
}

const IPEditDialog = ({ ip, onSave }: IPEditDialogProps) => {
  const [formData, setFormData] = useState({
    status: ip.status,
    hostname: ip.hostname || '',
    description: ip.description || '',
    macAddress: ip.macAddress || '',
    assignedTo: ip.assignedTo || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...ip,
      ...formData,
      updated: new Date(),
    });
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit IP Address: {ip.ip}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: IPAddress['status']) => 
            setFormData(prev => ({ ...prev, status: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="hostname">Hostname</Label>
          <Input
            id="hostname"
            value={formData.hostname}
            onChange={(e) => setFormData(prev => ({ ...prev, hostname: e.target.value }))}
            placeholder="e.g., server-01"
          />
        </div>

        <div>
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo}
            onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
            placeholder="e.g., John Doe, Web Server"
          />
        </div>

        <div>
          <Label htmlFor="macAddress">MAC Address</Label>
          <Input
            id="macAddress"
            value={formData.macAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, macAddress: e.target.value }))}
            placeholder="e.g., 00:1B:44:11:3A:B7"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description of what this IP is used for..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </DialogContent>
  );
};