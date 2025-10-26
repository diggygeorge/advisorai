'use client'

import { useState } from 'react'
import { signOut } from '../app/logout/actions'
import { Archivo_Black } from 'next/font/google'
import { Inter } from 'next/font/google'
import { Playfair_Display } from 'next/font/google'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const archivo = Archivo_Black({ subsets: ['latin'], weight: ['400'], display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['500'] });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500'] });

export default function Dashboard() {
  const [major, setMajor] = useState('')
  const [career, setCareer] = useState('')
  const [school, setSchool] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!school.trim() || !major.trim() || !career.trim()) {
      alert('Please fill in all fields before continuing.')
      return
    }
    router.push(
      `/newpage?school=${encodeURIComponent(school)}&major=${encodeURIComponent(major)}&career=${encodeURIComponent(career)}`
    )
  }

  return (
    <div className={`min-h-screen bg-white text-slate-900 ${inter.className}`} style={{ fontFamily: '"Glacial Indifference", Arial, sans-serif' }}>
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/chart-network.png"
            alt="AdvisorAI Logo"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
          <span className="text-xl font-bold tracking-wide text-slate-900">
            AdvisorAI
          </span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded bg-slate-100 px-4 py-2 text-slate-800 hover:bg-slate-200 cursor-pointer focus:outline-none transition"
          >
            Sign Out
          </button>
        </form>
      </nav>

      <main className="flex items-center justify-center px-4" style={{ minHeight: '90vh' }}>
        <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
          <h1 className="text-slate-900 text-3xl font-semibold mb-8 text-center" style={{ fontWeight: 700 }}>
            Plan Your Academic Path
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex gap-4">
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="flex-1 px-2 py-2 border-b border-gray-300 bg-white text-sm focus:outline-none focus:border-slate-700"
              >
                <option value="">School</option>
                <option value="CAS">CAS</option>
                <option value="CFA">CFA</option>
                <option value="COM">COM</option>
                <option value="QST">QST</option>
                <option value="SAR">SAR</option>
                <option value="ENG">ENG</option>
                <option value="WHE">WHE</option>
                <option value="MET">MET</option>
              </select>
              <input
                type="text"
                placeholder="Major"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="flex-1 px-2 py-2 border-b border-gray-300 bg-white text-sm focus:outline-none focus:border-slate-700"
              />
            </div>
            <input
              type="text"
              placeholder="Career Path"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              className="px-2 py-2 border-b border-gray-300 bg-white text-sm focus:outline-none focus:border-slate-700"
            />
            <button
              type="submit"
              className="w-full py-2 bg-slate-800 text-white rounded shadow-none hover:bg-slate-900 cursor-pointer transition"
            >
              OK
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
