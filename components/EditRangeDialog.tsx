"use client"

import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { IPRangeWithAddresses } from "../types/ip-management";
import { getLabelStyle } from "../utils/label-utils";

interface EditRangeDialogProps {
  range: IPRangeWithAddresses;
  onUpdateRange: (rangeId: string, updates: any) => void;
  trigger?: React.ReactNode;
}

export const EditRangeDialog = ({ range, onUpdateRange, trigger }: EditRangeDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gateway: '',
    dnsServers: '',
    includeInStats: true,
    label: 'public',
    customLabel: '',
  });


  // Initialize form data when range changes or dialog opens
  useEffect(() => {
    if (range) {
      const dnsString = range.dnsServers ? range.dnsServers.join(', ') : '';
      const isCustomLabel = range.label && !['public', 'private'].includes(range.label);
      
      setFormData({
        name: range.name || '',
        description: range.description || '',
        gateway: range.gateway || '',
        dnsServers: dnsString,
        includeInStats: range.includeInStats !== false,
        label: isCustomLabel ? 'custom' : (range.label || 'public'),
        customLabel: isCustomLabel ? range.label || '' : '',
      });
    }
  }, [range, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dnsArray = formData.dnsServers
      .split(',')
      .map(dns => dns.trim())
      .filter(dns => dns.length > 0);

    const updates = {
      name: formData.name,
      description: formData.description || undefined,
      gateway: formData.gateway || undefined,
      dnsServers: dnsArray.length > 0 ? dnsArray : undefined,
      includeInStats: formData.includeInStats,
      label: formData.label === 'custom' ? formData.customLabel : formData.label,
    };

    onUpdateRange(range.id, updates);
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="button-modern hover:bg-primary/10 hover:text-primary hover:border-primary/20">
      <Edit className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit IP Range</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Range Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Main Office Network"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
              <div className="font-medium mb-1">Network Information (Read-only)</div>
              <div>Network: {range.network}/{range.cidr}</div>
              {range.vlan && <div>VLAN: {range.vlan}</div>}
              <div className="text-xs mt-1">Network settings cannot be changed after creation</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-gateway">Gateway</Label>
              <Input
                id="edit-gateway"
                value={formData.gateway}
                onChange={(e) => setFormData(prev => ({ ...prev, gateway: e.target.value }))}
                placeholder="e.g., 192.168.1.1"
              />
            </div>
            <div>
              <Label htmlFor="edit-label">Label</Label>
              <Select value={formData.label} onValueChange={(value) => setFormData(prev => ({ ...prev, label: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-orange-500"></div>
                      Private
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500"></div>
                      Custom
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          {formData.label === 'custom' && (
            <div>
              <Label htmlFor="edit-customLabel">Custom Label</Label>
              <Input
                id="edit-customLabel"
                value={formData.customLabel}
                onChange={(e) => setFormData(prev => ({ ...prev, customLabel: e.target.value }))}
                placeholder="Enter custom label"
              />
            </div>
          )}

          <div>
            <Label htmlFor="edit-dnsServers">DNS Servers</Label>
            <Input
              id="edit-dnsServers"
              value={formData.dnsServers}
              onChange={(e) => setFormData(prev => ({ ...prev, dnsServers: e.target.value }))}
              placeholder="e.g., 8.8.8.8, 8.8.4.4"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate multiple DNS servers with commas</p>
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose of this IP range..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-includeInStats"
              checked={formData.includeInStats}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeInStats: !!checked }))}
            />
            <Label htmlFor="edit-includeInStats" className="text-sm font-medium cursor-pointer">
              Include in Statistics
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Range</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};