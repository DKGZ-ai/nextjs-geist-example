'use client'

import { useEffect, useState } from 'react'
import { authHelpers } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authHelpers.isAuthenticated()
      const currentUser = authHelpers.getCurrentUser()
      
      setIsAuthenticated(authenticated)
      setUser(currentUser)
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    authHelpers.removeToken()
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">School Entry System</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button>Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to School Entry System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A modern QR code-based student entry tracking system that helps schools monitor 
            student attendance efficiently and securely.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* QR Scanner Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>QR Scanner</span>
                </CardTitle>
                <CardDescription>
                  Scan student QR codes to record entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/scanner">
                  <Button className="w-full">Open Scanner</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Dashboard Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Dashboard</span>
                </CardTitle>
                <CardDescription>
                  View daily entry reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard">
                  <Button className="w-full">View Dashboard</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Student Management Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>👥</span>
                  <span>Students</span>
                </CardTitle>
                <CardDescription>
                  Manage student information and QR codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/students">
                  <Button className="w-full">Manage Students</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Access Required</CardTitle>
                <CardDescription>
                  Please login to access the school entry system
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/login">
                  <Button size="lg" className="w-full">
                    Login to Continue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            System Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Access</h4>
              <p className="text-sm text-gray-600">
                Role-based authentication for teachers and principals
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fast Scanning</h4>
              <p className="text-sm text-gray-600">
                Quick QR code scanning with instant entry recording
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Reports</h4>
              <p className="text-sm text-gray-600">
                Live dashboard with daily attendance analytics
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Mobile Friendly</h4>
              <p className="text-sm text-gray-600">
                Works on any device with camera capabilities
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
