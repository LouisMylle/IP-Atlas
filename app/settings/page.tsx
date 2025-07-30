"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, User, Lock, Save, Key, Copy, RefreshCw, Trash2 } from 'lucide-react'
import Link from 'next/link'

const SettingsPage = () => {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiKeyLoading, setApiKeyLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
      })
      fetchApiKey()
    }
  }, [session])

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/user/api-key')
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
      }
    } catch (error) {
      console.error('Error fetching API key:', error)
    }
  }

  const handleGenerateApiKey = async () => {
    setApiKeyLoading(true)
    try {
      const response = await fetch('/api/user/api-key', {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        toast({
          title: "API Key Generated",
          description: "Your new API key has been generated successfully.",
        })
      } else {
        throw new Error('Failed to generate API key')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setApiKeyLoading(false)
    }
  }

  const handleRevokeApiKey = async () => {
    setApiKeyLoading(true)
    try {
      const response = await fetch('/api/user/api-key', {
        method: 'DELETE',
      })
      if (response.ok) {
        setApiKey(null)
        toast({
          title: "API Key Revoked",
          description: "Your API key has been revoked successfully.",
        })
      } else {
        throw new Error('Failed to revoke API key')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setApiKeyLoading(false)
    }
  }

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      toast({
        title: "Copied!",
        description: "API key copied to clipboard.",
      })
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Feature Disabled",
      description: "Profile update functionality has been disabled.",
      variant: "destructive",
    })
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Feature Disabled",
      description: "Password change functionality has been disabled.",
      variant: "destructive",
    })
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-4">
          <Link href="/dashboard">
            <Button variant="outline" className="button-modern flex items-center gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/20">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-muted-foreground text-lg font-medium">Manage your account preferences and API access</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Key Management */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Use API keys to authenticate API requests from external applications
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKey ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        value={apiKey}
                        readOnly
                        className="font-mono text-sm"
                        type="password"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyApiKey}
                        className="flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep your API key secure. Don't share it in publicly accessible areas.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleGenerateApiKey}
                      disabled={apiKeyLoading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {apiKeyLoading ? 'Generating...' : 'Regenerate'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleRevokeApiKey}
                      disabled={apiKeyLoading}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {apiKeyLoading ? 'Revoking...' : 'Revoke'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You don't have an API key yet. Generate one to start using the API.
                  </p>
                  <Button
                    onClick={handleGenerateApiKey}
                    disabled={apiKeyLoading}
                    className="bg-gradient-primary text-white font-semibold"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {apiKeyLoading ? 'Generating...' : 'Generate API Key'}
                  </Button>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">API Usage</Label>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Include the API key in request headers: <code className="bg-muted px-1 rounded">X-API-Key: your_api_key</code></p>
                  <p>• Base URL: <code className="bg-muted px-1 rounded">https://your-domain.com/api</code></p>
                  <p>• Available endpoints: <code className="bg-muted px-1 rounded">/ip-ranges</code>, <code className="bg-muted px-1 rounded">/ip-addresses</code></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary text-white font-semibold"
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary text-white font-semibold"
                  disabled={loading}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">User ID</p>
                <p className="font-mono text-xs">{session.user?.id}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Role</p>
                <p className="capitalize">{(session.user as any)?.role || 'user'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Member Since</p>
                <p>{new Date(session.user?.createdAt || '').toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage