'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authHelpers } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

interface Entry {
  id: number
  student_id: string
  student_name: string
  class: string
  grade: string
  entry_time: string
  scanned_by_name?: string
}

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [fetchingEntries, setFetchingEntries] = useState(false)
  const [error, setError] = useState('')
  const [demoMode, setDemoMode] = useState(false)
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries()
    }
  }, [isAuthenticated, selectedDate])

  const fetchEntries = async () => {
    setFetchingEntries(true)
    setError('')

    try {
      const token = authHelpers.getToken()
      const response = await fetch(`/api/entry?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setEntries(data.entries || [])
        setDemoMode(data.mode === 'demo')
      } else {
        setError(data.error || 'Failed to fetch entries')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setFetchingEntries(false)
    }
  }

  const handleLogout = () => {
    authHelpers.removeToken()
    router.push('/login')
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                School Entry System
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Link href="/scanner">
                <Button variant="outline">QR Scanner</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Entry Dashboard</h1>
          <p className="text-gray-600">
            View and monitor student entries by date
          </p>
        </div>

        {demoMode && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">
              <strong>Demo Mode:</strong> Database connection not available. Showing sample data for demonstration.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="date-picker" className="sr-only">Select Date</Label>
              <Input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {entries.length}
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(selectedDate)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Unique Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {new Set(entries.map(e => e.student_id)).size}
              </div>
              <p className="text-sm text-gray-600">
                Different students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Latest Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-600">
                {entries.length > 0 ? formatTime(entries[0].entry_time) : 'No entries'}
              </div>
              <p className="text-sm text-gray-600">
                Most recent scan
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Entry Records - {formatDate(selectedDate)}</span>
              <Button 
                onClick={fetchEntries} 
                disabled={fetchingEntries}
                variant="outline"
                size="sm"
              >
                {fetchingEntries ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardTitle>
            <CardDescription>
              Complete list of student entries for the selected date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {fetchingEntries ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : entries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Entry Time</TableHead>
                      <TableHead>Scanned By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.student_id}
                        </TableCell>
                        <TableCell>{entry.student_name}</TableCell>
                        <TableCell>{entry.class}</TableCell>
                        <TableCell>{entry.grade}</TableCell>
                        <TableCell>{formatTime(entry.entry_time)}</TableCell>
                        <TableCell className="text-gray-600">
                          {entry.scanned_by_name || 'System'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <span className="text-4xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No entries found
                </h3>
                <p className="text-gray-600 mb-4">
                  No student entries recorded for {formatDate(selectedDate)}
                </p>
                <Link href="/scanner">
                  <Button>Start Scanning</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
