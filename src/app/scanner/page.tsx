'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authHelpers } from '@/lib/auth'
import QRScanner from '@/components/QRScanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface RecentEntry {
  studentId: string
  studentName: string
  timestamp: string
}

export default function ScannerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authHelpers.isAuthenticated()
      const currentUser = authHelpers.getCurrentUser()
      
      if (!authenticated) {
        router.push('/login')
        return
      }
      
      setIsAuthenticated(authenticated)
      setUser(currentUser)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleScanSuccess = (studentId: string) => {
    // Add to recent entries
    const newEntry: RecentEntry = {
      studentId,
      studentName: `Student ${studentId}`, // This would come from the API response
      timestamp: new Date().toLocaleTimeString()
    }
    
    setRecentEntries(prev => [newEntry, ...prev.slice(0, 4)]) // Keep last 5 entries
  }

  const handleLogout = () => {
    authHelpers.removeToken()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                School Entry System
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">QR Scanner</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Scanner</h1>
          <p className="text-gray-600">
            Scan student QR codes to record their entry into the school
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Section */}
          <div className="lg:col-span-2">
            <QRScanner 
              onScanSuccess={handleScanSuccess}
              onScanError={(error) => console.error('Scan error:', error)}
            />
          </div>

          {/* Recent Entries Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>Recent Entries</span>
                </CardTitle>
                <CardDescription>
                  Latest scanned entries from this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentEntries.length > 0 ? (
                  <div className="space-y-3">
                    {recentEntries.map((entry, index) => (
                      <div 
                        key={index}
                        className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div>
                          <p className="font-medium text-green-900">{entry.studentId}</p>
                          <p className="text-sm text-green-700">{entry.studentName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-green-600">{entry.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No entries recorded yet</p>
                    <p className="text-sm">Start scanning to see recent entries</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>⚡</span>
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    View Today's Entries
                  </Button>
                </Link>
                <Link href="/students">
                  <Button variant="outline" className="w-full">
                    Student Management
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Scanning Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">For Best Results:</h4>
                <ul className="space-y-1">
                  <li>• Ensure good lighting</li>
                  <li>• Hold QR code steady</li>
                  <li>• Keep code within the scanning area</li>
                  <li>• Clean camera lens if needed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Troubleshooting:</h4>
                <ul className="space-y-1">
                  <li>• Use manual entry if camera fails</li>
                  <li>• Check browser permissions</li>
                  <li>• Try refreshing the page</li>
                  <li>• Contact IT support if issues persist</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
