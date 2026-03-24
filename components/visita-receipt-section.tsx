'use client'

import { useState } from 'react'
import { ReceiptUpload, type ReceiptData } from './receipt-upload'
import { ReceiptReview } from './receipt-review'

export function VisitaReceiptSection({ visitId }: { visitId: string }) {
  const [extractedData, setExtractedData] = useState<ReceiptData | null>(null)
  const [saved, setSaved] = useState(false)

  if (saved) {
    return (
      <p className="text-sm" style={{ color: 'var(--casa-text-muted)' }}>
        Recibo guardado correctamente.
      </p>
    )
  }

  if (extractedData) {
    return (
      <ReceiptReview
        visitId={visitId}
        data={extractedData}
        onSaved={() => setSaved(true)}
      />
    )
  }

  return <ReceiptUpload visitId={visitId} onExtracted={setExtractedData} />
}
