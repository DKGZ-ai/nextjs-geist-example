'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authHelpers } from '@/lib/auth'

interface QRScannerProps {
  onScanSuccess: (studentId: string) => void
  onScanError?: (error: string) => void
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualEntry, setManualEntry] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerElementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  const startScanning = () => {
    if (!scannerElementRef.current) return

    setError('')
    setSuccess('')
    setIsScanning(true)

    const scanner = new Html5QrcodeScanner(
      'qr-scanner',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    )

    scanner.render(
      (decodedText) => {
        // Success callback
        handleScanResult(decodedText)
        scanner.clear()
        setIsScanning(false)
      },
      (error) => {
        // Error callback - we can ignore most errors as they're just failed scan attempts
        if (error.includes('NotFoundException')) {
          // This is normal when no QR code is detected
          return
        }
        console.warn('QR scan error:', error)
      }
    )

    scannerRef.current = scanner
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleScanResult = async (studentId: string) => {
    try {
      setError('')
      setSuccess('')

      // Record the entry
      const token = authHelpers.getToken()
      const response = await fetch('/api/entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Entry recorded for ${data.student?.name || studentId}`)
        onScanSuccess(studentId)
      } else {
        setError(data.error || 'Failed to record entry')
        onScanError?.(data.error || 'Failed to record entry')
      }
    } catch (err) {
      const errorMsg = 'Network error. Please try again.'
      setError(errorMsg)
      onScanError?.(errorMsg)
    }
  }

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualEntry.trim()) return

    await handleScanResult(manualEntry.trim())
    setManualEntry('')
  }

  return (
    <div className="space-y-6">
      {/* QR Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📱</span>
            <span>QR Code Scanner</span>
          </CardTitle>
          <CardDescription>
            Scan student QR codes or enter student ID manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Scanner Controls */}
          <div className="flex space-x-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1">
                Start Camera Scanner
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="flex-1">
                Stop Scanner
              </Button>
            )}
          </div>

          {/* Scanner Element */}
          <div 
            id="qr-scanner" 
            ref={scannerElementRef}
            className={`${isScanning ? 'block' : 'hidden'} w-full`}
          />

          {/* Manual Entry Form */}
          <div className="border-t pt-4">
            <form onSubmit={handleManualEntry} className="space-y-3">
              <Label htmlFor="manual-entry">Manual Student ID Entry</Label>
              <div className="flex space-x-2">
                <Input
                  id="manual-entry"
                  type="text"
                  placeholder="Enter Student ID (e.g., STU001)"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!manualEntry.trim()}>
                  Record Entry
                </Button>
              </div>
            </form>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Start Camera Scanner" to begin scanning QR codes</li>
              <li>• Position the QR code within the scanning area</li>
              <li>• Alternatively, enter the Student ID manually below</li>
              <li>• Entry will be recorded automatically upon successful scan</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
