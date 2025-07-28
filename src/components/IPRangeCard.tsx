import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Eye, EyeOff, Wifi } from "lucide-react";
import { IPRangeWithAddresses } from "@/types/ip-management";

interface IPRangeCardProps {
  range: IPRangeWithAddresses;
  onViewDetails: (range: IPRangeWithAddresses) => void;
  onToggleVisibility: (range: IPRangeWithAddresses) => void;
  isHidden?: boolean;
}

export const IPRangeCard = ({ range, onViewDetails, onToggleVisibility, isHidden = false }: IPRangeCardProps) => {
  const utilizationPercentage = Math.round((range.usedIps / range.totalIps) * 100);
  
  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return "bg-ip-available";
    if (percentage < 80) return "bg-ip-reserved";
    return "bg-ip-used";
  };

  return (
    <Card className={`shadow-card hover:shadow-technical transition-all duration-200 ${isHidden ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            {range.name}
            {isHidden && <span className="text-sm text-muted-foreground">(Hidden)</span>}
          </CardTitle>
          {range.vlan && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              VLAN {range.vlan}
            </Badge>
          )}
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
            className="flex-1"
            disabled={isHidden}
          >
            <Eye className="h-4 w-4 mr-2" />
            View IPs
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onToggleVisibility(range)}
          >
            {isHidden ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};