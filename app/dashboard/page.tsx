'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { IPRangeCard } from "../../components/IPRangeCard"
import { IPAddressGrid } from "../../components/IPAddressGrid"
import { AddRangeDialog } from "../../components/AddRangeDialog"
import { IPRange, IPAddress, IPRangeWithAddresses } from "../../types/ip-management"
import { ArrowLeft, Network, Server, Activity, EyeOff, Code, LogOut, Settings, Wifi } from "lucide-react"
import { getLabelStyle } from "../../utils/label-utils"
import { useToast } from "../../hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signOut } from "next-auth/react"
import Link from "next/link"

const Dashboard = () => {
  const [ranges, setRanges] = useState<IPRangeWithAddresses[]>([])
  const [selectedRange, setSelectedRange] = useState<IPRangeWithAddresses | null>(null)
  const [hiddenRanges, setHiddenRanges] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [includeReservedInUsed, setIncludeReservedInUsed] = useState(true)
  const [includeReservedInAvailable, setIncludeReservedInAvailable] = useState(false)
  const { toast } = useToast()

  // Fetch IP ranges from API
  const fetchRanges = async () => {
    try {
      const response = await fetch('/api/ip-ranges')
      if (response.ok) {
        const data = await response.json()
        setRanges(data)
      } else {
        throw new Error('Failed to fetch ranges')
      }
    } catch (error) {
      console.error('Error fetching ranges:', error)
      toast({
        title: "Error",
        description: "Failed to load IP ranges",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRanges()
  }, [])

  const handleAddRange = async (newRangeData: Omit<IPRange, 'id' | 'created' | 'updated'>) => {
    try {
      const response = await fetch('/api/ip-ranges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRangeData),
      })

      if (response.ok) {
        const newRange = await response.json()
        setRanges(prev => [...prev, newRange])
        toast({
          title: "IP Range Added",
          description: `Successfully added ${newRange.name} with ${newRange.totalIps} IP addresses.`,
        })
      } else {
        throw new Error('Failed to create range')
      }
    } catch (error) {
      console.error('Error creating range:', error)
      toast({
        title: "Error",
        description: "Failed to create IP range",
        variant: "destructive",
      })
    }
  }

  const handleUpdateIP = async (updatedIP: IPAddress) => {
    try {
      const response = await fetch(`/api/ip-addresses/${updatedIP.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updatedIP.status,
          hostname: updatedIP.hostname,
          description: updatedIP.description,
          macAddress: updatedIP.macAddress,
          assignedTo: updatedIP.assignedTo,
        }),
      })

      if (response.ok) {
        // Update local state
        setRanges(prev => prev.map(range => {
          if (range.id !== updatedIP.rangeId) return range
          
          const updatedAddresses = range.addresses.map(ip => 
            ip.id === updatedIP.id ? updatedIP : ip
          )
          
          const usedIps = updatedAddresses.filter(ip => ip.status === 'used').length
          const availableIps = updatedAddresses.filter(ip => ip.status === 'available').length
          
          return {
            ...range,
            addresses: updatedAddresses,
            usedIps,
            availableIps,
          }
        }))

        // Update selected range if it's the one being modified
        if (selectedRange?.id === updatedIP.rangeId) {
          const updatedAddresses = selectedRange.addresses.map(ip => 
            ip.id === updatedIP.id ? updatedIP : ip
          )
          setSelectedRange({
            ...selectedRange,
            addresses: updatedAddresses,
          })
        }

        toast({
          title: "IP Updated",
          description: `Successfully updated ${updatedIP.ip}`,
        })
      } else {
        throw new Error('Failed to update IP')
      }
    } catch (error) {
      console.error('Error updating IP:', error)
      toast({
        title: "Error",
        description: "Failed to update IP address",
        variant: "destructive",
      })
    }
  }

  const handleBulkUpdateIPs = async (ipIds: string[], updates: Partial<IPAddress>) => {
    // Store the previous state for potential rollback
    const previousRanges = ranges;

    // Apply optimistic updates immediately
    setRanges(prev => prev.map(range => {
      const hasUpdates = range.addresses.some(ip => ipIds.includes(ip.id))
      if (!hasUpdates) return range
      
      const updatedAddresses = range.addresses.map(ip => {
        if (!ipIds.includes(ip.id)) return ip
        
        return { ...ip, ...updates }
      })
      
      const usedIps = updatedAddresses.filter(ip => ip.status === 'used').length
      const availableIps = updatedAddresses.filter(ip => ip.status === 'available').length
      
      return {
        ...range,
        addresses: updatedAddresses,
        usedIps,
        availableIps,
      }
    }))

    // Update selectedRange if it's affected
    if (selectedRange) {
      setSelectedRange(prev => {
        if (!prev) return prev
        const hasUpdates = prev.addresses.some(ip => ipIds.includes(ip.id))
        if (!hasUpdates) return prev
        
        const updatedAddresses = prev.addresses.map(ip => {
          if (!ipIds.includes(ip.id)) return ip
          return { ...ip, ...updates }
        })
        
        return {
          ...prev,
          addresses: updatedAddresses,
        }
      })
    }

    try {
      const response = await fetch('/api/ip-addresses/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ipIds, updates }),
      })

      if (response.ok) {
        toast({
          title: "Bulk Update Complete",
          description: `Successfully updated ${ipIds.length} IP address${ipIds.length !== 1 ? 'es' : ''}`,
        })
      } else {
        // Rollback optimistic updates on failure
        setRanges(previousRanges)
        if (selectedRange) {
          const originalRange = previousRanges.find(r => r.id === selectedRange.id)
          if (originalRange) setSelectedRange(originalRange)
        }
        throw new Error('Failed to bulk update IPs')
      }
    } catch (error) {
      console.error('Error bulk updating IPs:', error)
      
      // Rollback optimistic updates on error
      setRanges(previousRanges)
      if (selectedRange) {
        const originalRange = previousRanges.find(r => r.id === selectedRange.id)
        if (originalRange) setSelectedRange(originalRange)
      }
      
      toast({
        title: "Error",
        description: "Failed to update IP addresses",
        variant: "destructive",
      })
    }
  }

  const handleToggleVisibility = (range: IPRangeWithAddresses) => {
    setHiddenRanges(prev => {
      const newSet = new Set(prev)
      const wasHidden = newSet.has(range.id)
      
      if (wasHidden) {
        newSet.delete(range.id)
      } else {
        newSet.add(range.id)
      }
      
      // Schedule toast for next tick to avoid setState during render
      setTimeout(() => {
        toast({
          title: wasHidden ? "Range Shown" : "Range Hidden",
          description: `${range.name} is now ${wasHidden ? 'visible' : 'hidden'}.`,
        })
      }, 0)
      
      return newSet
    })
  }

  const handleToggleStats = async (range: IPRangeWithAddresses) => {
    try {
      const newIncludeInStats = !range.includeInStats
      const response = await fetch(`/api/ip-ranges/${range.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeInStats: newIncludeInStats,
        }),
      })

      if (response.ok) {
        setRanges(prev => prev.map(r => 
          r.id === range.id ? { ...r, includeInStats: newIncludeInStats } : r
        ))
        toast({
          title: newIncludeInStats ? "Included in Statistics" : "Excluded from Statistics",
          description: `${range.name} is now ${newIncludeInStats ? 'included in' : 'excluded from'} global statistics.`,
        })
      } else {
        throw new Error('Failed to update range')
      }
    } catch (error) {
      console.error('Error updating range:', error)
      toast({
        title: "Error",
        description: "Failed to update range statistics setting",
        variant: "destructive",
      })
    }
  }

  const handleUpdateRange = async (rangeId: string, updates: any) => {
    try {
      const response = await fetch(`/api/ip-ranges/${rangeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedRange = await response.json()
        setRanges(prev => prev.map(range => 
          range.id === rangeId ? { 
            ...updatedRange,
            addresses: updatedRange.addresses || range.addresses,
            totalIps: updatedRange.totalIps || range.totalIps,
            usedIps: updatedRange.usedIps || range.usedIps,
            availableIps: updatedRange.availableIps || range.availableIps,
          } : range
        ))
        toast({
          title: "Range Updated",
          description: `Successfully updated ${updatedRange.name || 'IP range'}.`,
        })
      } else {
        throw new Error('Failed to update range')
      }
    } catch (error) {
      console.error('Error updating range:', error)
      toast({
        title: "Error",
        description: "Failed to update IP range",
        variant: "destructive",
      })
    }
  }

  const handleRemoveRange = async (range: IPRangeWithAddresses) => {
    try {
      const response = await fetch(`/api/ip-ranges/${range.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setRanges(prev => prev.filter(r => r.id !== range.id))
        setHiddenRanges(prev => {
          const newSet = new Set(prev)
          newSet.delete(range.id)
          return newSet
        })
        toast({
          title: "Range Removed",
          description: `Successfully removed ${range.name} and all its IP addresses.`,
        })
      } else {
        throw new Error('Failed to delete range')
      }
    } catch (error) {
      console.error('Error deleting range:', error)
      toast({
        title: "Error",
        description: "Failed to remove IP range",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const visibleRanges = ranges.filter(range => !hiddenRanges.has(range.id))
  const hiddenRangesList = ranges.filter(range => hiddenRanges.has(range.id))

  const statsRanges = ranges.filter(range => range.includeInStats !== false)
  const totalIPs = statsRanges.reduce((sum, range) => sum + range.totalIps, 0)
  const totalUsed = statsRanges.reduce((sum, range) => {
    const usedCount = range.usedIps
    const reservedCount = includeReservedInUsed 
      ? range.addresses.filter(ip => ip.status === 'reserved').length 
      : 0
    return sum + usedCount + reservedCount
  }, 0)
  const totalAvailable = statsRanges.reduce((sum, range) => {
    const availableCount = range.availableIps
    const reservedCount = includeReservedInAvailable 
      ? range.addresses.filter(ip => ip.status === 'reserved').length 
      : 0
    return sum + availableCount + reservedCount
  }, 0)

  if (selectedRange) {
    const selectedLabelStyle = getLabelStyle(selectedRange.label);
    const SelectedLabelIcon = selectedLabelStyle.icon;
    
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="container mx-auto py-6 space-y-6">
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedRange(null)}
              className="button-modern flex items-center gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ranges
            </Button>
            
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{selectedRange.name}</h1>
                  <Badge className={selectedLabelStyle.className}>
                    <SelectedLabelIcon className="h-4 w-4 mr-1" />
                    {selectedLabelStyle.displayText}
                  </Badge>
                  {selectedRange.vlan && selectedRange.vlan > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Wifi className="h-4 w-4" />
                      VLAN {selectedRange.vlan}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-lg text-muted-foreground font-medium">
                    {selectedRange.network}/{selectedRange.cidr}
                  </p>
                  {selectedRange.gateway && (
                    <p className="text-sm text-muted-foreground">
                      Gateway: {selectedRange.gateway}
                    </p>
                  )}
                  {selectedRange.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedRange.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {selectedRange.usedIps}/{selectedRange.totalIps}
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round((selectedRange.usedIps / selectedRange.totalIps) * 100)}% used
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedRange.availableIps} available
                </div>
              </div>
            </div>
          </div>
          
          <IPAddressGrid 
            range={selectedRange} 
            onUpdateIP={handleUpdateIP}
            onBulkUpdateIPs={handleBulkUpdateIPs}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              IP Atlas
            </h1>
            <p className="text-muted-foreground text-lg font-medium">Manage your network IP ranges and allocations</p>
          </div>
          <div className="flex items-center gap-3">
            <AddRangeDialog onAddRange={handleAddRange} />
            <div className="h-6 w-px bg-border"></div>
            <Link href="/settings">
              <Button variant="outline" className="button-modern flex items-center gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/20">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Link href="/api-docs">
              <Button variant="outline" className="button-modern flex items-center gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/20">
                <Code className="h-4 w-4" />
                API Docs
              </Button>
            </Link>
            <div className="h-6 w-px bg-border"></div>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="button-modern flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-elevated border-l-4 border-l-primary !bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Ranges</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Network className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{ranges.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active network ranges</p>
            </CardContent>
          </Card>

          <Card className="shadow-elevated border-l-4 border-l-slate-500 !bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total IPs</CardTitle>
              <div className="p-2 bg-slate-100 rounded-lg">
                <Server className="h-4 w-4 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{totalIPs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">IP addresses managed</p>
            </CardContent>
          </Card>

          <Card className="shadow-elevated border-l-4 border-l-blue-500 !bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Used IPs</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 tracking-tight">{totalUsed}</div>
              <p className="text-xs text-muted-foreground">
                {totalIPs > 0 ? Math.round((totalUsed / totalIPs) * 100) : 0}% utilization
              </p>
              <div className="flex items-center space-x-2 mt-3 pt-2 border-t">
                <Switch
                  id="include-reserved"
                  checked={includeReservedInUsed}
                  onCheckedChange={setIncludeReservedInUsed}
                />
                <Label htmlFor="include-reserved" className="text-xs text-muted-foreground">
                  Include reserved in used
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elevated border-l-4 border-l-green-500 !bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available IPs</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 tracking-tight">{totalAvailable}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalIPs > 0 ? Math.round((totalAvailable / totalIPs) * 100) : 0}% available
              </p>
              <div className="flex items-center space-x-2 mt-3 pt-2 border-t">
                <Switch
                  id="include-reserved-available"
                  checked={includeReservedInAvailable}
                  onCheckedChange={setIncludeReservedInAvailable}
                />
                <Label htmlFor="include-reserved-available" className="text-xs text-muted-foreground">
                  Include reserved in available
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IP Ranges Tabs */}
        <Tabs defaultValue="visible" className="space-y-6">
          <TabsList>
            <TabsTrigger value="visible">
              Visible Ranges ({visibleRanges.length})
            </TabsTrigger>
            <TabsTrigger value="hidden">
              Hidden Ranges ({hiddenRangesList.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visible" className="space-y-4">
            {visibleRanges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleRanges.map((range) => (
                  <IPRangeCard
                    key={range.id}
                    range={range}
                    onViewDetails={setSelectedRange}
                    onToggleVisibility={handleToggleVisibility}
                    onToggleStats={handleToggleStats}
                    onUpdateRange={handleUpdateRange}
                    onRemove={handleRemoveRange}
                    isHidden={false}
                  />
                ))}
              </div>
            ) : (
              <Card className="shadow-card bg-white">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Network className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {ranges.length === 0 ? 'No IP Ranges' : 'No Visible IP Ranges'}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {ranges.length === 0 
                      ? 'Get started by adding your first IP range to manage your network allocations.'
                      : 'All ranges are hidden. Show hidden ranges or add a new range.'
                    }
                  </p>
                  <AddRangeDialog onAddRange={handleAddRange} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="hidden" className="space-y-4">
            {hiddenRangesList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hiddenRangesList.map((range) => (
                  <IPRangeCard
                    key={range.id}
                    range={range}
                    onViewDetails={setSelectedRange}
                    onToggleVisibility={handleToggleVisibility}
                    onToggleStats={handleToggleStats}
                    onUpdateRange={handleUpdateRange}
                    onRemove={handleRemoveRange}
                    isHidden={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="shadow-card bg-white">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Hidden Ranges</h3>
                  <p className="text-muted-foreground text-center">
                    No ranges are currently hidden.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Dashboard