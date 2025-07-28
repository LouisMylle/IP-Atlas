import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IPAddress } from "@/types/ip-management";
import { 
  CheckSquare, 
  Square, 
  Edit3, 
  Trash2, 
  RefreshCw,
  Users
} from "lucide-react";

interface BulkActionsToolbarProps {
  selectedIPs: IPAddress[];
  onBulkUpdate: (updates: Partial<IPAddress>) => void;
  onBulkClear: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  totalIPs: number;
}

export const BulkActionsToolbar = ({
  selectedIPs,
  onBulkUpdate,
  onBulkClear,
  onSelectAll,
  onDeselectAll,
  totalIPs
}: BulkActionsToolbarProps) => {
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    status: '',
    assignedTo: '',
    description: '',
  });

  const handleBulkStatusChange = (status: IPAddress['status']) => {
    onBulkUpdate({ status, updated: new Date() });
    onBulkClear();
  };

  const handleBulkEdit = () => {
    const updates: Partial<IPAddress> = {
      updated: new Date(),
    };

    if (bulkEditData.status) {
      updates.status = bulkEditData.status as IPAddress['status'];
    }
    if (bulkEditData.assignedTo) {
      updates.assignedTo = bulkEditData.assignedTo;
    }
    if (bulkEditData.description) {
      updates.description = bulkEditData.description;
    }

    onBulkUpdate(updates);
    setIsBulkEditOpen(false);
    setBulkEditData({ status: '', assignedTo: '', description: '' });
    onBulkClear();
  };

  const handleMarkAvailable = () => {
    onBulkUpdate({
      status: 'available',
      hostname: undefined,
      assignedTo: undefined,
      description: undefined,
      macAddress: undefined,
      updated: new Date(),
    });
    onBulkClear();
  };

  if (selectedIPs.length === 0) {
    return (
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Square className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Select IPs to perform bulk actions
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onSelectAll}>
          <CheckSquare className="h-4 w-4 mr-2" />
          Select All ({totalIPs})
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {selectedIPs.length} IP{selectedIPs.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onDeselectAll}>
              Clear Selection
            </Button>
            
            {selectedIPs.length < totalIPs && (
              <Button variant="outline" size="sm" onClick={onSelectAll}>
                Select All ({totalIPs})
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select onValueChange={handleBulkStatusChange}>
            <SelectTrigger className="w-40">
              <RefreshCw className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Change Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsBulkEditOpen(true)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Bulk Edit
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAvailable}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </div>
      </div>

      <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Bulk Edit {selectedIPs.length} IP Address{selectedIPs.length !== 1 ? 'es' : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Selected IPs:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedIPs.slice(0, 10).map(ip => (
                  <Badge key={ip.id} variant="secondary" className="text-xs">
                    {ip.ip}
                  </Badge>
                ))}
                {selectedIPs.length > 10 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedIPs.length - 10} more
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bulk-status">Status (optional)</Label>
              <Select 
                value={bulkEditData.status} 
                onValueChange={(value) => setBulkEditData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Leave unchanged" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Leave unchanged</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bulk-assigned">Assigned To (optional)</Label>
              <Input
                id="bulk-assigned"
                value={bulkEditData.assignedTo}
                onChange={(e) => setBulkEditData(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Leave empty to keep existing values"
              />
            </div>

            <div>
              <Label htmlFor="bulk-description">Description (optional)</Label>
              <Textarea
                id="bulk-description"
                value={bulkEditData.description}
                onChange={(e) => setBulkEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Leave empty to keep existing values"
                rows={3}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Note: Empty fields will not modify existing values. Only filled fields will be updated.
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkEdit}>
                Update {selectedIPs.length} IP{selectedIPs.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};