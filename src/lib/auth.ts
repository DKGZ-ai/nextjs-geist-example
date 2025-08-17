import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface UserPayload {
  id: number;
  email: string;
  role: 'teacher' | 'principal';
  name: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserPayload;
  error?: string;
}

// Generate JWT token
export function generateToken(user: UserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verify JWT token
export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Extract token from request headers
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies
  const tokenCookie = request.cookies.get('auth-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  
  return null;
}

// Authenticate request and return user info
export function authenticateRequest(request: NextRequest): AuthResult {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return { success: false, error: 'No authentication token provided' };
  }
  
  const user = verifyToken(token);
  
  if (!user) {
    return { success: false, error: 'Invalid or expired token' };
  }
  
  return { success: true, user };
}

// Check if user has required role
export function hasRole(user: UserPayload, requiredRole: 'teacher' | 'principal'): boolean {
  if (requiredRole === 'teacher') {
    return user.role === 'teacher' || user.role === 'principal';
  }
  return user.role === requiredRole;
}

// Middleware function for protecting API routes
export function requireAuth(requiredRole?: 'teacher' | 'principal') {
  return (request: NextRequest) => {
    const authResult = authenticateRequest(request);
    
    if (!authResult.success) {
      return authResult;
    }
    
    if (requiredRole && !hasRole(authResult.user!, requiredRole)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    return authResult;
  };
}

// Simple password hashing (in production, use bcrypt)
export function hashPassword(password: string): string {
  // For demo purposes, we'll use simple encoding
  // In production, use bcrypt or similar
  return Buffer.from(password).toString('base64');
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  // For demo purposes, simple comparison
  // In production, use bcrypt.compare
  return Buffer.from(password).toString('base64') === hashedPassword;
}

// Auth helper functions for client-side
export const authHelpers = {
  // Store token in localStorage and cookie
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
      // Set cookie for server-side access
      document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Strict`;
    }
  },

  // Get token from localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  },

  // Remove token
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const user = verifyToken(token);
      return user !== null;
    } catch {
      return false;
    }
  },

  // Get current user from token
  getCurrentUser(): UserPayload | null {
    const token = this.getToken();
    if (!token) return null;
    
    return verifyToken(token);
  }
};
