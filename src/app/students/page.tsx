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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import StudentQRCode from '@/components/StudentQRCode'
import Link from 'next/link'

interface Student {
  student_id: string
  name: string
  class: string
  grade: string
}

export default function StudentsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  // Demo students data
  const demoStudents: Student[] = [
    { student_id: 'STU001', name: 'Alice Johnson', class: '10A', grade: '10th' },
    { student_id: 'STU002', name: 'Bob Smith', class: '10A', grade: '10th' },
    { student_id: 'STU003', name: 'Charlie Brown', class: '10B', grade: '10th' },
    { student_id: 'STU004', name: 'Diana Prince', class: '11A', grade: '11th' },
    { student_id: 'STU005', name: 'Edward Wilson', class: '11A', grade: '11th' },
    { student_id: 'STU006', name: 'Fiona Green', class: '11B', grade: '11th' },
    { student_id: 'STU007', name: 'George Miller', class: '12A', grade: '12th' },
    { student_id: 'STU008', name: 'Hannah Lee', class: '12A', grade: '12th' },
    { student_id: 'STU009', name: 'Ian Cooper', class: '12B', grade: '12th' },
    { student_id: 'STU010', name: 'Julia Davis', class: '12B', grade: '12th' }
  ]

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
      loadStudents()
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Filter students based on search term
    if (searchTerm.trim() === '') {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(student =>
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredStudents(filtered)
    }
  }, [searchTerm, students])

  const loadStudents = async () => {
    try {
      // For demo purposes, we'll use the demo data
      // In a real application, this would fetch from the API
      setStudents(demoStudents)
      setFilteredStudents(demoStudents)
    } catch (err) {
      setError('Failed to load students')
    }
  }

  const handleLogout = () => {
    authHelpers.removeToken()
    router.push('/login')
  }

  const handleViewQRCode = (student: Student) => {
    setSelectedStudent(student)
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
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                School Entry System
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Student Management</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
          <p className="text-gray-600">
            Manage student information and generate QR codes
          </p>
        </div>

        {/* Demo Mode Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode:</strong> Showing sample student data for demonstration purposes.
          </AlertDescription>
        </Alert>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Search */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Search Students</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="search" className="sr-only">Search Students</Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by ID, name, class, or grade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {students.length}
              </div>
              <p className="text-sm text-gray-600">
                Registered students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {filteredStudents.length}
              </div>
              <p className="text-sm text-gray-600">
                Matching students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Directory</CardTitle>
            <CardDescription>
              Complete list of registered students with QR code generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell className="font-medium">
                          {student.student_id}
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewQRCode(student)}
                              >
                                View QR Code
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Student QR Code</DialogTitle>
                                <DialogDescription>
                                  QR code for {student.name} ({student.student_id})
                                </DialogDescription>
                              </DialogHeader>
                              {selectedStudent && (
                                <StudentQRCode
                                  studentId={selectedStudent.student_id}
                                  studentName={selectedStudent.name}
                                  className={selectedStudent.class}
                                  grade={selectedStudent.grade}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <span className="text-4xl">👥</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No students found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No students match your search criteria' : 'No students registered yet'}
                </p>
                {searchTerm && (
                  <Button onClick={() => setSearchTerm('')} variant="outline">
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/scanner">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-center py-6">
                <div className="text-center">
                  <span className="text-3xl mb-2 block">📱</span>
                  <p className="font-medium">QR Scanner</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-center py-6">
                <div className="text-center">
                  <span className="text-3xl mb-2 block">📊</span>
                  <p className="font-medium">Dashboard</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center justify-center py-6">
                <div className="text-center">
                  <span className="text-3xl mb-2 block">🏠</span>
                  <p className="font-medium">Back to Home</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">QR Code Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
              <div>
                <h4 className="font-medium mb-2">For Students:</h4>
                <ul className="space-y-1">
                  <li>• Click "View QR Code" to see your unique code</li>
                  <li>• Download or print the QR code</li>
                  <li>• Keep it in your student ID holder</li>
                  <li>• Present it at the school entrance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">For Staff:</h4>
                <ul className="space-y-1">
                  <li>• Use the search function to find specific students</li>
                  <li>• Generate QR codes for new students</li>
                  <li>• Print multiple codes for backup</li>
                  <li>• Monitor entry records via Dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
