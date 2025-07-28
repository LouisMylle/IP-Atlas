import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IPAddress } from "@/types/ip-management";
import { 
  CheckSquare, 
  Square, 
  RefreshCw
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
  const handleBulkStatusChange = (status: IPAddress['status']) => {
    onBulkUpdate({ status, updated: new Date() });
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
      </div>
    </div>
  );
};