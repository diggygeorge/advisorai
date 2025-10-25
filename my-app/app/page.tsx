'use client'

import { useState } from 'react'
import { signOut } from '../app/logout/actions'

export default function Dashboard() {
  const [major, setMajor] = useState('')
  const [career, setCareer] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ major, career })
    // TODO: send these inputs to your AdvisorAI backend
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <div className="text-2xl font-bold text-blue-600">AdvisorAI</div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </form>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center mt-20 px-4">
        <h1 className="text-3xl font-semibold mb-6">Plan Your Path</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded-lg shadow-md"
        >
          <input
            type="text"
            placeholder="Enter your major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Enter your career path"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            OK
          </button>
        </form>
      </main>
    </div>
  )
}