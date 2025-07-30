"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Eye, EyeOff, Wifi, Trash2, BarChart3, Edit } from "lucide-react";
import { IPRangeWithAddresses } from "../types/ip-management";
import { EditRangeDialog } from "./EditRangeDialog";
import { getLabelStyle } from "../utils/label-utils";

interface IPRangeCardProps {
  range: IPRangeWithAddresses;
  onViewDetails: (range: IPRangeWithAddresses) => void;
  onToggleVisibility: (range: IPRangeWithAddresses) => void;
  onToggleStats: (range: IPRangeWithAddresses) => void;
  onUpdateRange: (rangeId: string, updates: any) => void;
  onRemove: (range: IPRangeWithAddresses) => void;
  isHidden?: boolean;
}

export const IPRangeCard = ({ range, onViewDetails, onToggleVisibility, onToggleStats, onUpdateRange, onRemove, isHidden = false }: IPRangeCardProps) => {
  const utilizationPercentage = Math.round((range.usedIps / range.totalIps) * 100);
  const labelStyle = getLabelStyle(range.label);
  const LabelIcon = labelStyle.icon;
  
  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <>
      <Card className={`border-border/20 shadow-elevated !bg-white hover:shadow-xl hover:border-border/40 transition-all duration-200 ${isHidden ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              {range.name}
              {isHidden && <span className="text-sm text-muted-foreground">(Hidden)</span>}
              {range.includeInStats === false && (
                <Badge variant="outline" className="text-xs">
                  Excluded from stats
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${labelStyle.className}`}>
                <LabelIcon className="h-3 w-3 mr-1" />
                {labelStyle.displayText}
              </Badge>
              {range.vlan && range.vlan > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  VLAN {range.vlan}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {range.network}/{range.cidr}
          </div>
        </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Utilization</span>
            <span className="font-medium">{range.usedIps}/{range.totalIps} ({utilizationPercentage}%)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(utilizationPercentage)}`}
              style={{ width: `${utilizationPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="font-semibold text-ip-available">{range.availableIps}</div>
            <div className="text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-ip-used">{range.usedIps}</div>
            <div className="text-muted-foreground">Used</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-ip-reserved">
              {range.addresses.filter(ip => ip.status === 'reserved').length}
            </div>
            <div className="text-muted-foreground">Reserved</div>
          </div>
        </div>

        {range.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {range.description}
          </p>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(range)}
            className="button-modern flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
            disabled={isHidden}
          >
            <Eye className="h-4 w-4 mr-2" />
            View IPs
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onToggleVisibility(range)}
            className="button-modern hover:bg-slate-100 hover:border-slate-300"
            title={isHidden ? 'Show range' : 'Hide range'}
          >
            {isHidden ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <EditRangeDialog
            range={range}
            onUpdateRange={onUpdateRange}
            trigger={
              <Button 
                variant="outline" 
                size="sm" 
                className="button-modern hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                title="Edit range"
              >
                <Edit className="h-4 w-4" />
              </Button>
            }
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onToggleStats(range)}
            className={`button-modern ${range.includeInStats === false ? 'text-muted-foreground hover:bg-muted/50' : 'text-primary hover:bg-primary/10 hover:border-primary/20'}`}
            title={range.includeInStats === false ? 'Include in statistics' : 'Exclude from statistics'}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onRemove(range)}
            className="button-modern hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 text-destructive"
            title="Delete range"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      </Card>
    </>
  );
};