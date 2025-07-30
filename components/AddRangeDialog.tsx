"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { IPRange } from "@/types/ip-management";

interface AddRangeDialogProps {
  onAddRange: (range: Omit<IPRange, 'id' | 'created' | 'updated'>) => void;
}

export const AddRangeDialog = ({ onAddRange }: AddRangeDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    network: '',
    cidr: 24,
    vlan: '',
    description: '',
    gateway: '',
    dnsServers: '',
    includeInStats: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dnsArray = formData.dnsServers
      .split(',')
      .map(dns => dns.trim())
      .filter(dns => dns.length > 0);

    onAddRange({
      name: formData.name,
      network: formData.network,
      cidr: formData.cidr,
      vlan: formData.vlan ? parseInt(formData.vlan) : undefined,
      description: formData.description || undefined,
      gateway: formData.gateway || undefined,
      dnsServers: dnsArray.length > 0 ? dnsArray : undefined,
      includeInStats: formData.includeInStats,
    });

    // Reset form
    setFormData({
      name: '',
      network: '',
      cidr: 24,
      vlan: '',
      description: '',
      gateway: '',
      dnsServers: '',
      includeInStats: true,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="button-primary text-white font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Add IP Range
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white shadow-elevated">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Add New IP Range</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Range Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Main Office Network"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="network">Network Address *</Label>
              <Input
                id="network"
                value={formData.network}
                onChange={(e) => setFormData(prev => ({ ...prev, network: e.target.value }))}
                placeholder="e.g., 192.168.1.0"
                required
              />
            </div>
            <div>
              <Label htmlFor="cidr">CIDR</Label>
              <Input
                id="cidr"
                type="number"
                min="8"
                max="30"
                value={formData.cidr}
                onChange={(e) => setFormData(prev => ({ ...prev, cidr: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vlan">VLAN ID</Label>
              <Input
                id="vlan"
                type="number"
                min="1"
                max="4094"
                value={formData.vlan}
                onChange={(e) => setFormData(prev => ({ ...prev, vlan: e.target.value }))}
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <Label htmlFor="gateway">Gateway</Label>
              <Input
                id="gateway"
                value={formData.gateway}
                onChange={(e) => setFormData(prev => ({ ...prev, gateway: e.target.value }))}
                placeholder="e.g., 192.168.1.1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dnsServers">DNS Servers</Label>
            <Input
              id="dnsServers"
              value={formData.dnsServers}
              onChange={(e) => setFormData(prev => ({ ...prev, dnsServers: e.target.value }))}
              placeholder="e.g., 8.8.8.8, 8.8.4.4"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate multiple DNS servers with commas</p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose of this IP range..."
              rows={3}
            />
          </div>

          <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg border">
            <Checkbox
              id="includeInStats"
              checked={formData.includeInStats}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeInStats: !!checked }))}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label htmlFor="includeInStats" className="text-sm font-medium cursor-pointer">
                Include in Statistics
              </Label>
              <p className="text-xs text-muted-foreground">
                Include this range in global statistics calculations on the dashboard overview
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="button-modern">
              Cancel
            </Button>
            <Button type="submit" className="button-primary text-white font-semibold">Add Range</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};