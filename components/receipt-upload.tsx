'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface ReceiptData {
  store_name: string | null
  date: string | null
  line_items: Array<{ name: string; price: number }>
  subtotal: number | null
  tax: number | null
  total: number | null
}

interface ReceiptUploadProps {
  visitId: string
  onExtracted: (data: ReceiptData) => void
}

async function resizeImageToLimit(file: File, maxBytes = 5 * 1024 * 1024): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      const scale = Math.sqrt(maxBytes / file.size)
      if (scale < 1) {
        width = Math.floor(width * scale)
        height = Math.floor(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85)
    }
    img.src = url
  })
}

function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      resolve(dataUrl.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ReceiptUpload({ visitId, onExtracted }: ReceiptUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setLoading(true)
    setError(null)

    try {
      // Resize image to 5 MB limit
      const resizedBlob = await resizeImageToLimit(file)

      // Convert to base64
      const base64 = await fileToBase64(resizedBlob)

      // Upload to Supabase Storage in parallel with OCR
      const supabase = createClient()
      const storageUpload = supabase.storage
        .from('receipts')
        .upload(`${visitId}/${Date.now()}.jpg`, resizedBlob, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      // Send base64 to extract-receipt API
      const ocrFetch = fetch('/api/ai/extract-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType: 'image/jpeg', visitId }),
      })

      const [storageResult, ocrResponse] = await Promise.all([storageUpload, ocrFetch])

      // Update visit with storage URL if upload succeeded
      if (!storageResult.error && storageResult.data) {
        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(storageResult.data.path)

        await supabase
          .from('visits')
          .update({ receipt_image_url: urlData.publicUrl })
          .eq('id', visitId)
      }

      if (!ocrResponse.ok) {
        throw new Error('OCR failed')
      }

      const data: ReceiptData = await ocrResponse.json()
      onExtracted(data)
    } catch {
      setError('No pude leer el recibo. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  function handleRetry() {
    setError(null)
    inputRef.current?.click()
  }

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border"
        style={{ borderColor: 'var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--casa-primary)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--casa-text-muted)' }}>
          Analizando recibo...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border"
        style={{ borderColor: 'var(--casa-border)', backgroundColor: 'var(--casa-surface)' }}
      >
        <p className="text-sm" style={{ color: '#9A3412' }}>
          {error}
        </p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: 'var(--casa-primary)', color: 'white' }}
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Subir recibo"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-3 w-full rounded-xl border transition-colors hover:opacity-90"
        style={{
          minHeight: '48px',
          padding: '16px',
          borderColor: 'var(--casa-border)',
          backgroundColor: 'var(--casa-surface)',
          color: 'var(--casa-text)',
        }}
      >
        <Camera className="w-5 h-5 shrink-0" style={{ color: 'var(--casa-primary)' }} />
        <span className="font-semibold text-sm">Subir recibo</span>
      </button>
    </div>
  )
}
