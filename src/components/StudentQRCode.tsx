'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface StudentQRCodeProps {
  studentId: string
  studentName?: string
  className?: string
  grade?: string
}

export default function StudentQRCode({ 
  studentId, 
  studentName, 
  className, 
  grade 
}: StudentQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateQRCode()
  }, [studentId])

  const generateQRCode = async () => {
    if (!studentId) {
      setError('Student ID is required')
      setLoading(false)
      return
    }

    try {
      setError('')
      setLoading(true)

      // Generate QR code data - in this case, just the student ID
      // In a real system, you might include more data or use a URL
      const qrData = studentId

      // Generate QR code as data URL
      const url = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      setQrCodeUrl(url)

      // Also draw on canvas if available
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        })
      }

    } catch (err) {
      console.error('QR Code generation error:', err)
      setError('Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.download = `${studentId}_qr_code.png`
    link.href = qrCodeUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printQRCode = () => {
    if (!qrCodeUrl) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student QR Code - ${studentId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
              margin: 0;
            }
            .qr-container {
              border: 2px solid #000;
              padding: 20px;
              margin: 20px auto;
              width: fit-content;
              background: white;
            }
            .student-info {
              margin-bottom: 15px;
            }
            .student-id {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .student-details {
              font-size: 14px;
              color: #666;
            }
            .qr-code {
              margin: 15px 0;
            }
            .instructions {
              font-size: 12px;
              color: #888;
              margin-top: 15px;
            }
            @media print {
              body { margin: 0; }
              .qr-container { border: 2px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="student-info">
              <div class="student-id">${studentId}</div>
              ${studentName ? `<div class="student-details">${studentName}</div>` : ''}
              ${className && grade ? `<div class="student-details">${grade} - ${className}</div>` : ''}
            </div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code for ${studentId}" />
            </div>
            <div class="instructions">
              Scan this QR code at the school entrance
            </div>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    
    // Wait for image to load before printing
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🎫</span>
          <span>Student QR Code</span>
        </CardTitle>
        <CardDescription>
          QR code for student entry scanning
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Student Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="font-bold text-lg text-gray-900">{studentId}</div>
          {studentName && (
            <div className="text-gray-600">{studentName}</div>
          )}
          {className && grade && (
            <div className="text-sm text-gray-500">{grade} - {className}</div>
          )}
        </div>

        {/* QR Code Display */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : qrCodeUrl ? (
          <div className="space-y-4">
            {/* QR Code Image */}
            <div className="flex justify-center">
              <img 
                src={qrCodeUrl} 
                alt={`QR Code for ${studentId}`}
                className="border-2 border-gray-200 rounded-lg"
              />
            </div>

            {/* Hidden Canvas (for backup) */}
            <canvas 
              ref={canvasRef} 
              className="hidden"
              width={256}
              height={256}
            />

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                onClick={downloadQRCode}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Download
              </Button>
              <Button 
                onClick={printQRCode}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Print
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
              <p className="font-medium mb-1">Usage Instructions:</p>
              <ul className="text-left space-y-1">
                <li>• Present this QR code at the school entrance</li>
                <li>• Ensure the code is clearly visible and not damaged</li>
                <li>• Keep the printed copy in your student ID holder</li>
              </ul>
            </div>
          </div>
        ) : null}

        {/* Regenerate Button */}
        <Button 
          onClick={generateQRCode}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Regenerate QR Code'}
        </Button>
      </CardContent>
    </Card>
  )
}
