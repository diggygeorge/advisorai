'use client'

import { useState } from 'react'
import { signOut } from '../app/logout/actions'
import { Archivo_Black } from 'next/font/google'
import { Inter } from 'next/font/google'
import { Playfair_Display } from 'next/font/google'


const archivo = Archivo_Black({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['500'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500'],
});


export default function Dashboard() {
  const [major, setMajor] = useState('')
  const [career, setCareer] = useState('')
  const [school, setSchool] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ major, career })
    // TODO: send these inputs to your AdvisorAI backend
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-slate-700 shadow-md">
        <div className={`${archivo.className} text-2xl tracking-wider font-bold text-white`}>
          AdvisorAI</div>
        <form action={signOut}>
          <button
            type="submit"
            className={`${inter.className} rounded-md bg-white px-4 py-2 text-slate-700 hover:bg-slate-200 cursor-pointer transition`}
          >
            Sign Out
          </button>
        </form>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center mt-40 px-4">
      <h1 className={`${playfair.className} text-slate-900 text-4xl font-semibold mb-10`}>
        Plan Your Path</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 w-full max-w-2xl"
        >
          <div className="flex w-full gap-4">
          

          <select
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="flex-[2] px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer">
          <option value="">Select School</option>
          <option value="CAS">CAS</option>
          <option value="CAS">CFA</option>
          <option value="CAS">COM</option>
          <option value="CAS">QST</option>
          <option value="CAS">SAR</option>
          <option value="CFA">ENG</option>
          <option value="CFA">WHE</option>
          <option value="QST">MET</option>
          </select>


          <input
            type="text"
            placeholder="Enter your major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="px-4 py-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          </div>

          <input
            type="text"
            placeholder="Enter your career path"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            className="px-4 py-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900 cursor-pointer transition"
          >
            OK
          </button>
        </form>
      </main>
    </div>
  )
}