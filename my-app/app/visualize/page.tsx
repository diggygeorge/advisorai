'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VisualizePage() {
  const router = useRouter()
  const params = useSearchParams()
  const school = params.get('school') ?? ''
  const major  = params.get('major') ?? ''
  const career = params.get('career') ?? ''

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-slate-700 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-semibold mb-2">Visualization</h1>
      <p className="mb-8">
        School: {school || '—'} · Major: {major || '—'} · Career: {career || '—'}
      </p>

      <div className="rounded-lg border border-gray-200 p-6">
        {/* TODO: charts / visualization here */}
        Coming soon…
      </div>
    </div>
  )
}
