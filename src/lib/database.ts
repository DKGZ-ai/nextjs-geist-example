import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Helper function to execute queries
export async function query(sql: string, params?: any[]): Promise<any> {
  try {
    const connection = getPool();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database operation failed');
  }
}

// Initialize database tables (for demo purposes)
export async function initializeDatabase() {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('teacher', 'principal') NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create students table
    await query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        class VARCHAR(50) NOT NULL,
        grade VARCHAR(20) NOT NULL,
        qr_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create entries table
    await query(`
      CREATE TABLE IF NOT EXISTS entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        entry_date DATE NOT NULL,
        scanned_by INT,
        FOREIGN KEY (student_id) REFERENCES students(student_id),
        FOREIGN KEY (scanned_by) REFERENCES users(id)
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Sample data insertion (for demo)
export async function insertSampleData() {
  try {
    // Insert sample users
    const users = [
      { email: 'principal@school.edu', password: 'principal123', role: 'principal', name: 'Dr. Sarah Johnson' },
      { email: 'teacher1@school.edu', password: 'teacher123', role: 'teacher', name: 'Mr. John Smith' },
      { email: 'teacher2@school.edu', password: 'teacher123', role: 'teacher', name: 'Ms. Emily Davis' }
    ];

    for (const user of users) {
      await query(
        'INSERT IGNORE INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
        [user.email, user.password, user.role, user.name]
      );
    }

    // Insert sample students
    const students = [
      { student_id: 'STU001', name: 'Alice Johnson', class: '10A', grade: '10th' },
      { student_id: 'STU002', name: 'Bob Smith', class: '10A', grade: '10th' },
      { student_id: 'STU003', name: 'Charlie Brown', class: '10B', grade: '10th' },
      { student_id: 'STU004', name: 'Diana Prince', class: '11A', grade: '11th' },
      { student_id: 'STU005', name: 'Edward Wilson', class: '11A', grade: '11th' },
      { student_id: 'STU006', name: 'Fiona Green', class: '11B', grade: '11th' },
      { student_id: 'STU007', name: 'George Miller', class: '12A', grade: '12th' },
      { student_id: 'STU008', name: 'Hannah Lee', class: '12A', grade: '12th' }
    ];

    for (const student of students) {
      await query(
        'INSERT IGNORE INTO students (student_id, name, class, grade) VALUES (?, ?, ?, ?)',
        [student.student_id, student.name, student.class, student.grade]
      );
    }

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Sample data insertion error:', error);
    throw error;
  }
}

// Utility functions for common database operations
export const dbOperations = {
  // User operations
  async getUserByEmail(email: string) {
    const results = await query('SELECT * FROM users WHERE email = ?', [email]);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  },

  async getUserById(id: number) {
    const results = await query('SELECT * FROM users WHERE id = ?', [id]);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  },

  // Student operations
  async getStudentById(studentId: string) {
    const results = await query('SELECT * FROM students WHERE student_id = ?', [studentId]);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  },

  async getAllStudents() {
    return await query('SELECT * FROM students ORDER BY name');
  },

  // Entry operations
  async recordEntry(studentId: string, scannedBy?: number) {
    const today = new Date().toISOString().split('T')[0];
    return await query(
      'INSERT INTO entries (student_id, entry_date, scanned_by) VALUES (?, ?, ?)',
      [studentId, today, scannedBy || null]
    );
  },

  async getEntriesByDate(date: string) {
    return await query(`
      SELECT e.*, s.name as student_name, s.class, s.grade, u.name as scanned_by_name
      FROM entries e
      JOIN students s ON e.student_id = s.student_id
      LEFT JOIN users u ON e.scanned_by = u.id
      WHERE e.entry_date = ?
      ORDER BY e.entry_time DESC
    `, [date]);
  },

  async getTodayEntries() {
    const today = new Date().toISOString().split('T')[0];
    return await this.getEntriesByDate(today);
  }
};
