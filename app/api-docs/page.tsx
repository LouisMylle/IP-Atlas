"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, Server, Shield, Database, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

const APIDocsPage = () => {
  const { toast } = useToast()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard.",
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="flex justify-between items-center bg-muted px-4 py-2 rounded-t-lg">
        <Badge variant="outline">{language}</Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          {copiedCode === id ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="bg-muted/50 p-4 rounded-b-lg overflow-x-auto">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  )

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
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Code className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                API Documentation
              </h1>
              <p className="text-muted-foreground text-lg font-medium">Complete IP Management API Reference</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Base URL</CardTitle>
              <Server className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-mono">http://localhost:3000/api</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authentication</CardTitle>
              <Shield className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-lg">API Key Required</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Format</CardTitle>
              <Database className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-lg">JSON</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="authentication" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="ip-ranges">IP Ranges</TabsTrigger>
            <TabsTrigger value="ip-addresses">IP Addresses</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="authentication" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>API Key Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-4">All API endpoints require authentication using API keys. This provides secure, programmatic access to the IP management system.</p>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Header Format:</p>
                    <code className="text-sm">X-API-Key: ipf_your_api_key_here</code>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">How to get an API key:</p>
                      <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                        <li>Sign in to the web interface</li>
                        <li>Navigate to Settings → API Key Management</li>
                        <li>Generate a new API key</li>
                        <li>Copy the key and use it in your API requests</li>
                      </ol>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Security Notes:</p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                        <li>Keep your API key secure and don't share it publicly</li>
                        <li>API keys can be regenerated or revoked at any time</li>
                        <li>Each key is tied to a specific user account</li>
                        <li>Use different keys for different applications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ip-ranges" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>IP Range Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                    <code>/api/ip-ranges</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Get all IP ranges</p>
                  <CodeBlock
                    id="get-ranges-response"
                    language="JSON"
                    code={`[
  {
    "id": "range_id_1",
    "name": "Main Office Network",
    "network": "192.168.1.0",
    "cidr": 24,
    "vlan": 100,
    "description": "Primary office network",
    "gateway": "192.168.1.1",
    "dnsServers": ["8.8.8.8", "8.8.4.4"],
    "totalIps": 254,
    "usedIps": 5,
    "availableIps": 249,
    "addresses": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-800">POST</Badge>
                    <code>/api/ip-ranges</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Create a new IP range</p>
                  <CodeBlock
                    id="create-range-body"
                    language="JSON"
                    code={`{
  "name": "Development Network",
  "network": "10.0.1.0",
  "cidr": 24,
  "vlan": 150,
  "description": "Development environment network",
  "gateway": "10.0.1.1",
  "dnsServers": ["10.0.1.2", "10.0.1.3"]
}`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                    <code>/api/ip-ranges/[id]</code>
                  </div>
                  <p className="text-muted-foreground">Get a specific IP range by ID</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-100 text-yellow-800">PATCH</Badge>
                    <code>/api/ip-ranges/[id]</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Update an IP range configuration</p>
                  <CodeBlock
                    id="update-range-body"
                    language="JSON"
                    code={`{
  "includeInStats": true
}`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-100 text-red-800">DELETE</Badge>
                    <code>/api/ip-ranges/[id]</code>
                  </div>
                  <p className="text-muted-foreground">Delete an IP range and all its addresses</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ip-addresses" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>IP Address Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-100 text-yellow-800">PATCH</Badge>
                    <code>/api/ip-addresses/[id]</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Update a specific IP address</p>
                  <CodeBlock
                    id="update-ip-body"
                    language="JSON"
                    code={`{
  "status": "used",
  "hostname": "web-server-01",
  "description": "Primary web server",
  "macAddress": "00:1B:44:11:6A:27",
  "assignedTo": "Web Development Team"
}`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-100 text-yellow-800">PATCH</Badge>
                    <code>/api/ip-addresses/bulk-update</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Update multiple IP addresses at once</p>
                  <CodeBlock
                    id="bulk-update-body"
                    language="JSON"
                    code={`{
  "ipIds": ["ip_id_1", "ip_id_2", "ip_id_3"],
  "updates": {
    "status": "reserved",
    "description": "Reserved for future use"
  }
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                    <code>/api/user/api-key</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Get current user's API key</p>
                  <CodeBlock
                    id="get-api-key-response"
                    language="JSON"
                    code={`{
  "apiKey": "ipf_your_generated_api_key_here"
}`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-800">POST</Badge>
                    <code>/api/user/api-key</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Generate a new API key for the current user</p>
                  <CodeBlock
                    id="generate-api-key-response"
                    language="JSON"
                    code={`{
  "apiKey": "ipf_newly_generated_api_key_here"
}`}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-100 text-red-800">DELETE</Badge>
                    <code>/api/user/api-key</code>
                  </div>
                  <p className="text-muted-foreground mb-4">Revoke the current user's API key</p>
                  <CodeBlock
                    id="revoke-api-key-response"
                    language="JSON"
                    code={`{
  "message": "API key revoked successfully"
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Usage Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">JavaScript/Fetch</h3>
                  <CodeBlock
                    id="js-example"
                    language="JavaScript"
                    code={`// Get all IP ranges (with API key authentication)
const response = await fetch('/api/ip-ranges', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'ipf_your_api_key_here'
  },
})
const ranges = await response.json()

// Create new IP range
const newRange = await fetch('/api/ip-ranges', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'ipf_your_api_key_here'
  },
  body: JSON.stringify({
    name: 'Test Network',
    network: '172.16.0.0',
    cidr: 24,
    description: 'Test environment'
  })
})

// Update IP address
const updatedIP = await fetch('/api/ip-addresses/ip_id_here', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'ipf_your_api_key_here'
  },
  body: JSON.stringify({
    status: 'used',
    hostname: 'server-01'
  })
})`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">cURL</h3>
                  <CodeBlock
                    id="curl-example"
                    language="bash"
                    code={`# Get all IP ranges (with API key authentication)
curl -X GET http://localhost:3000/api/ip-ranges \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ipf_your_api_key_here"

# Create new IP range
curl -X POST http://localhost:3000/api/ip-ranges \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ipf_your_api_key_here" \\
  -d '{
    "name": "Test Network",
    "network": "172.16.0.0",
    "cidr": 24,
    "description": "Test environment"
  }'

# Update IP address
curl -X PATCH http://localhost:3000/api/ip-addresses/[id] \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ipf_your_api_key_here" \\
  -d '{
    "status": "used",
    "hostname": "server-01"
  }'

# Generate new API key (requires session authentication first)
curl -X POST http://localhost:3000/api/user/api-key \\
  -H "Content-Type: application/json" \\
  -b "cookies.txt"`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Response Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Success Codes</h4>
                <ul className="space-y-1 text-sm">
                  <li><code>200</code> - OK (successful GET, PATCH, DELETE)</li>
                  <li><code>201</code> - Created (successful POST)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Error Codes</h4>
                <ul className="space-y-1 text-sm">
                  <li><code>400</code> - Bad Request (invalid input)</li>
                  <li><code>401</code> - Unauthorized (not authenticated)</li>
                  <li><code>404</code> - Not Found (resource doesn't exist)</li>
                  <li><code>405</code> - Method Not Allowed</li>
                  <li><code>500</code> - Internal Server Error</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default APIDocsPage