'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Playfair_Display, Inter } from 'next/font/google'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

const results = [
  ["Full Stack Software Engineer","Introduction to Programming","MET CS 201","Python Fundamentals, Problem-Solving","Core","None","Foundational"],
  ["Full Stack Software Engineer","Introduction to Computer Science 1","CAS CS 111","Python Programming, Computational Thinking","Core","None","Foundational"],
  ["Full Stack Software Engineer","Introduction to Computer Science 2","CAS CS 112","Data Structures, Algorithms, Advanced Programming","Core","CAS CS 111","Core"],
  ["Full Stack Software Engineer","Web Application Development","MET CS 601","JavaScript, TypeScript, React, HTML5, CSS3, DOM Manipulation","Highly Relevant","MET WD 100","Core"],
  ["Full Stack Software Engineer","Server-Side Web Development","MET CS 602","Node.js, Express.js, MongoDB, REST APIs, GraphQL, Full Stack MERN","Highly Relevant","MET CS 601","Core"],
  ["Full Stack Software Engineer","Full-Stack Application Design and Development","CAS CS 412","Asynchronous Programming, APIs, Non-Relational Databases, Deployment","Highly Relevant","CAS CS 111 & 112 & 411","Core"],
  ["Full Stack Software Engineer","Data Structures and Algorithms","MET CS 526","Data Structures, Algorithms, Problem-Solving, Complexity Analysis","Highly Relevant","MET CS 300 & (CS 520 or 521)","Core"],
  ["Full Stack Software Engineer","Introduction to Database Design and Implementation","MET CS 469","SQL, Database Design, Normalization, Relational Modeling","Highly Relevant","None","Core"],
  ["Full Stack Software Engineer","Database Design and Implementation","MET CS 669","Advanced SQL, Database Management, Database Lifecycle","Relevant","None","Core"],
  ["Full Stack Software Engineer","Information Structures with Python","MET CS 521","Object-Oriented Programming, Data Structures, Python","Highly Relevant","Programming Experience","Core"]
]

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400'],
})

export default function NewPage() {
  const router = useRouter()
  const [careerSearch, setCareerSearch] = useState('')
  const [majorSearch, setMajorSearch] = useState('')
  const searchParams = useSearchParams()
  const career = searchParams.get('career')

  const filteredResults = results.filter(([career]) =>
    career.toLowerCase().includes(careerSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 relative flex flex-col items-center py-10 px-8">
      {/* Header */}
      <div className="absolute top-6 left-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/house.png"
            alt="Home"
            width={30}
            height={30}
            onClick={() => router.push('/')}
            className="cursor-pointer hover:opacity-80 transition"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search Major..."
              value={majorSearch}
              onChange={(e) => setMajorSearch(e.target.value)}
              className="border border-gray-300 rounded-2xl px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-56"
            />
            <input
              type="text"
              placeholder="Search Career..."
              value={careerSearch}
              onChange={(e) => setCareerSearch(e.target.value)}
              className="border border-gray-300 rounded-2xl px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-56"
            />
          </div>
        </div>

        <h1 className={`${playfair.className} text-slate-800 text-5xl font-bold mt-6`}>
          {career || "Career Path"}
        </h1>
      </div>

      {/* Results Table */}
      <div className="mt-48 w-full max-w-6xl overflow-x-auto">
        <table className="min-w-full border border-gray-300 shadow-md rounded-2xl overflow-hidden text-slate-800">
          <thead className="bg-gray-100 text-slate-800">
            <tr>
              <th className="px-3 py-2 text-center w-10"></th>
              <th className="px-4 py-2 text-left">Course Name</th>
              <th className="px-4 py-2 text-left">Course Number</th>
              <th className="px-4 py-2 text-left">Skills / Competencies Gained</th>
              <th className="px-4 py-2 text-left">Career Relevance</th>
              <th className="px-4 py-2 text-left">Prerequisite Courses</th>
              <th className="px-4 py-2 text-left">Group Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map(([, courseName, courseCode, skills, relevance, prereq, group], i) => (
              <tr key={i} className="even:bg-gray-50 hover:bg-amber-200 transition">
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" className="accent-slate-700 text-slate-900 cursor-pointer transform scale-120"/>
                </td>
                <td className="px-4 py-2">{courseName}</td>
                <td className="px-4 py-2">{courseCode}</td>
                <td className="px-4 py-2">{skills}</td>
                <td className="px-4 py-2">{relevance}</td>
                <td className="px-4 py-2">{prereq}</td>
                <td className="px-4 py-2">{group}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visualize Button */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className="px-10 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900 cursor-pointer transition"
        >
          Visualize
        </button>
      </div>
    </div>
  )
}
