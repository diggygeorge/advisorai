'use client'

import { useState, useMemo } from 'react'
import { signOut } from '../app/logout/actions'
import { Archivo_Black } from 'next/font/google'
import { Inter } from 'next/font/google'
import { Playfair_Display } from 'next/font/google'
import { useRouter } from 'next/navigation'
import { buCoursesHub } from './courses'



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

  const router = useRouter()

  // Calculate course stats
  const courseStats = useMemo(() => {
    const completed = buCoursesHub.filter(c => c.status === 'Completed').length
    const inProgress = buCoursesHub.filter(c => c.status === 'In Progress').length
    const missing = buCoursesHub.filter(c => c.status === 'Missing').length
    
    const allHubUnits = new Set<string>()
    const completedHubUnits = new Set<string>()
    
    buCoursesHub.forEach(course => {
      course.hubUnits.forEach(unit => {
        allHubUnits.add(unit)
        if (course.status === 'Completed') {
          completedHubUnits.add(unit)
        }
      })
    })

    return {
      totalCourses: buCoursesHub.length,
      completed,
      inProgress,
      missing,
      totalHubUnits: allHubUnits.size,
      completedHubUnits: completedHubUnits.size
    }
  }, [])

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
    // TODO: send these inputs to your AdvisorAI backend

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 dark:bg-gray-50 dark:text-slate-900">
      <nav className="flex justify-between items-center px-6 py-4 bg-slate-700 shadow-md">
        <div className={`${archivo.className} text-2xl tracking-wider font-bold text-white`}>
          AdvisorAI</div>
        <form action={signOut}>
          <button
            type="submit"
            className={`${inter.className} rounded-md bg-white px-4 py-2 text-slate-700 hover:bg-slate-200 cursor-pointer transition`}>
            Sign Out
          </button>
        </form>
      </nav>

      {/* Stats Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{courseStats.completed}</div>
              <div className="text-xs text-gray-600">Courses Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{courseStats.inProgress}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{courseStats.missing}</div>
              <div className="text-xs text-gray-600">Missing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{courseStats.completedHubUnits}/{courseStats.totalHubUnits}</div>
              <div className="text-xs text-gray-600">Hub Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round((courseStats.completed / courseStats.totalCourses) * 100)}%</div>
              <div className="text-xs text-gray-600">Progress</div>
            </div>
          </div>
        </div>
      </div>

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
          className="flex-[2] px-4 py-3 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer">
          <option value="">Select School</option>
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
            placeholder="Enter your major*"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="px-4 py-3 border text-black rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          </div>

          <input
            type="text"
            placeholder="Enter your career path*"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            className="px-4 py-3 border text-black rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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