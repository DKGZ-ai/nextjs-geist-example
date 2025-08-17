import { NextRequest, NextResponse } from 'next/server'
import { dbOperations } from '@/lib/database'
import { authenticateRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = authenticateRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const { studentId } = await request.json()

    // Validate input
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    try {
      // Check if student exists
      const student = await dbOperations.getStudentById(studentId)
      
      if (!student) {
        // For demo purposes, if database is not available, use demo data
        const demoStudent = getDemoStudent(studentId)
        if (!demoStudent) {
          return NextResponse.json(
            { error: 'Student not found' },
            { status: 404 }
          )
        }
        
        // Record entry in demo mode
        return NextResponse.json({
          success: true,
          message: 'Entry recorded successfully (Demo Mode)',
          student: demoStudent,
          entryTime: new Date().toISOString(),
          scannedBy: authResult.user?.name
        })
      }

      // Record the entry
      await dbOperations.recordEntry(studentId, authResult.user?.id)

      return NextResponse.json({
        success: true,
        message: 'Entry recorded successfully',
        student: {
          id: student.student_id,
          name: student.name,
          class: student.class,
          grade: student.grade
        },
        entryTime: new Date().toISOString(),
        scannedBy: authResult.user?.name
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // Fallback to demo mode if database is not available
      const demoStudent = getDemoStudent(studentId)
      if (!demoStudent) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Entry recorded successfully (Demo Mode)',
        student: demoStudent,
        entryTime: new Date().toISOString(),
        scannedBy: authResult.user?.name
      })
    }

  } catch (error) {
    console.error('Entry recording error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Demo student data for when database is not available
function getDemoStudent(studentId: string) {
  const demoStudents = [
    { student_id: 'STU001', name: 'Alice Johnson', class: '10A', grade: '10th' },
    { student_id: 'STU002', name: 'Bob Smith', class: '10A', grade: '10th' },
    { student_id: 'STU003', name: 'Charlie Brown', class: '10B', grade: '10th' },
    { student_id: 'STU004', name: 'Diana Prince', class: '11A', grade: '11th' },
    { student_id: 'STU005', name: 'Edward Wilson', class: '11A', grade: '11th' },
    { student_id: 'STU006', name: 'Fiona Green', class: '11B', grade: '11th' },
    { student_id: 'STU007', name: 'George Miller', class: '12A', grade: '12th' },
    { student_id: 'STU008', name: 'Hannah Lee', class: '12A', grade: '12th' }
  ]

  return demoStudents.find(s => s.student_id === studentId) || null
}

// GET endpoint to retrieve entries (for dashboard)
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = authenticateRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    try {
      let entries
      if (date) {
        entries = await dbOperations.getEntriesByDate(date)
      } else {
        entries = await dbOperations.getTodayEntries()
      }

      return NextResponse.json({
        success: true,
        entries: entries || [],
        date: date || new Date().toISOString().split('T')[0]
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      // Return demo entries if database is not available
      const demoEntries = getDemoEntries(date)
      
      return NextResponse.json({
        success: true,
        entries: demoEntries,
        date: date || new Date().toISOString().split('T')[0],
        mode: 'demo'
      })
    }

  } catch (error) {
    console.error('Entries retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Demo entries for when database is not available
function getDemoEntries(date?: string | null) {
  const today = new Date().toISOString().split('T')[0]
  const requestedDate = date || today
  
  // Only return entries for today in demo mode
  if (requestedDate !== today) {
    return []
  }

  const now = new Date()
  const entries = [
    {
      id: 1,
      student_id: 'STU001',
      student_name: 'Alice Johnson',
      class: '10A',
      grade: '10th',
      entry_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      scanned_by_name: 'Mr. John Smith'
    },
    {
      id: 2,
      student_id: 'STU003',
      student_name: 'Charlie Brown',
      class: '10B',
      grade: '10th',
      entry_time: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
      scanned_by_name: 'Ms. Emily Davis'
    },
    {
      id: 3,
      student_id: 'STU005',
      student_name: 'Edward Wilson',
      class: '11A',
      grade: '11th',
      entry_time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      scanned_by_name: 'Mr. John Smith'
    }
  ]

  return entries
}
