"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { IPAddress } from "../types/ip-management";
import { 
  CheckSquare, 
  Square, 
  RefreshCw,
  Settings2
} from "lucide-react";

interface BulkActionsToolbarProps {
  selectedIPs: IPAddress[];
  onBulkUpdate: (updates: Partial<IPAddress>) => void;
  onBulkClear: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectFirst: (count: number) => void;
  onSelectLast: (count: number) => void;
  onSelectRange: (start: number, end: number) => void;
  totalIPs: number;
}

export const BulkActionsToolbar = ({
  selectedIPs,
  onBulkUpdate,
  onBulkClear,
  onSelectAll,
  onDeselectAll,
  onSelectFirst,
  onSelectLast,
  onSelectRange,
  totalIPs
}: BulkActionsToolbarProps) => {
  const [isAdvancedDialogOpen, setIsAdvancedDialogOpen] = useState(false);
  const [firstCount, setFirstCount] = useState(10);
  const [lastCount, setLastCount] = useState(10);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(10);

  const handleBulkStatusChange = (status: IPAddress['status']) => {
    onBulkUpdate({ status, updated: new Date() });
    onBulkClear();
  };

  const handleAdvancedSelect = (type: 'first' | 'last' | 'range') => {
    switch (type) {
      case 'first':
        onSelectFirst(firstCount);
        break;
      case 'last':
        onSelectLast(lastCount);
        break;
      case 'range':
        onSelectRange(rangeStart, rangeEnd);
        break;
    }
    setIsAdvancedDialogOpen(false);
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
          
          <Dialog open={isAdvancedDialogOpen} onOpenChange={setIsAdvancedDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Advanced Selection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select First N IPs</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={firstCount}
                      onChange={(e) => setFirstCount(parseInt(e.target.value) || 1)}
                      min="1"
                      max={totalIPs}
                      className="flex-1"
                    />
                    <Button onClick={() => handleAdvancedSelect('first')}>
                      Select First {firstCount}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Last N IPs</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={lastCount}
                      onChange={(e) => setLastCount(parseInt(e.target.value) || 1)}
                      min="1"
                      max={totalIPs}
                      className="flex-1"
                    />
                    <Button onClick={() => handleAdvancedSelect('last')}>
                      Select Last {lastCount}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                      min="1"
                      max={totalIPs}
                      placeholder="From"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(parseInt(e.target.value) || 1)}
                      min="1"
                      max={totalIPs}
                      placeholder="To"
                      className="flex-1"
                    />
                    <Button onClick={() => handleAdvancedSelect('range')}>
                      Select Range
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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