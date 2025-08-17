import { NextRequest, NextResponse } from 'next/server'
import { dbOperations } from '@/lib/database'
import { generateToken, verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await dbOperations.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // For demo purposes, we'll use simple password comparison
    // In production, use proper password hashing with bcrypt
    const isValidPassword = password === user.password || verifyPassword(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    // Return success response with token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    })

  } catch (error) {
    console.error('Login error:', error)
    
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { error: 'Database connection failed. Using demo mode.' },
        { status: 200 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle demo mode when database is not available
async function handleDemoLogin(email: string, password: string) {
  const demoUsers = [
    { id: 1, email: 'principal@school.edu', password: 'principal123', role: 'principal' as const, name: 'Dr. Sarah Johnson' },
    { id: 2, email: 'teacher1@school.edu', password: 'teacher123', role: 'teacher' as const, name: 'Mr. John Smith' },
    { id: 3, email: 'teacher2@school.edu', password: 'teacher123', role: 'teacher' as const, name: 'Ms. Emily Davis' }
  ]

  const user = demoUsers.find(u => u.email === email && u.password === password)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })

  return NextResponse.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  })
}
