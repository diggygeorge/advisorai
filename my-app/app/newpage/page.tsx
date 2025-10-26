'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Playfair_Display, Inter } from 'next/font/google'
import Image from 'next/image'
import { signOut } from '../logout/actions'

// Import your majors JSON
import buMajors from '../data/bu_majors_with_requirements.json' // adjust path
import { buCoursesHub, type CourseHub } from '../courses'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700'] })
const inter = Inter({ subsets: ['latin'], weight: ['400'] })

// Example academic schedule
const schedule = {
  Freshman: { Fall: ['MA123', 'CC101', 'CS111', 'HI300'], Spring: ['CS112', 'CS131', 'LK111', 'SM131'] },
  Sophomore: { Fall: ['WR152', 'CS132', 'CS210', 'LK112', 'SM132'], Spring: ['CS237', 'CS330', 'LK211', 'EC102'] },
  Junior: { Fall: ['CS351', 'CS460', 'LK212', 'CC221'], Spring: [] },
  Senior: { Fall: [], Spring: [] },
}

// Fetch AI recommendations from the enhanced API
async function fetchRecommendations(career: string, courses: any[]) {
  // Validate input
  if (!career || career.trim() === '') {
    console.log('No career specified, skipping API call');
    return [];
  }

  try {
    const requestBody = {
      career: career.trim(),
      missingUnits: [] // You can add logic to determine missing units
    };

    console.log('Sending request to enhanced API:', requestBody);

    const response = await fetch('/api/enhanced-chatcompletion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    return data.recommendations || [];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // Fallback to basic recommendations
  return courses.slice(0, 5).map(([careerName, courseName]) => ({
      courseCode: 'N/A',
    courseName,
    reason: `Recommended for ${career}`,
      hubUnits: [],
      skills: 'See course description',
      careerRelevance: 'See reason',
      prerequisites: 'See course catalog',
      group: 'Recommended'
    }));
  }
}

export default function NewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const careerQuery = searchParams.get('career') || ''

  const [careerSearch, setCareerSearch] = useState(careerQuery)
  const [majorSearch, setMajorSearch] = useState('')
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [careerData, setCareerData] = useState<any>(null)
  const [searchStats, setSearchStats] = useState<any>(null)
  const [academicPlan, setAcademicPlan] = useState<any>(null)

  // Calculate Hub Requirements
  const hubRequirements = useMemo(() => {
    const allHubUnits = [
      { code: 'AEX', name: 'Aesthetic Exploration', required: 1 },
      { code: 'CRI', name: 'Critical Thinking', required: 1 },
      { code: 'CRT', name: 'Creativity', required: 1 },
      { code: 'DME', name: 'Digital/Multimedia Expression', required: 1 },
      { code: 'ETR', name: 'Ethical Reasoning', required: 1 },
      { code: 'FYW', name: 'First-Year Writing Seminar', required: 1 },
      { code: 'GCI', name: 'Global Citizenship & Intercultural Literacy', required: 2 },
      { code: 'HCO', name: 'Historical Consciousness', required: 1 },
      { code: 'IIC', name: 'Intellectual & Imaginative Creativity', required: 4 },
      { code: 'OSC', name: 'Oral/Signed Communication', required: 1 },
      { code: 'PLM', name: 'Philosophical Inquiry & Life\'s Meanings', required: 1 },
      { code: 'QR2', name: 'Quantitative Reasoning II', required: 2 },
      { code: 'RIL', name: 'Research & Information Literacy', required: 2 },
      { code: 'SO1', name: 'Social Inquiry I', required: 1 },
      { code: 'SO2', name: 'Social Inquiry II', required: 1 },
      { code: 'TWC', name: 'Teamwork/Collaboration', required: 2 },
      { code: 'WIN', name: 'Writing Intensive Course', required: 1 },
      { code: 'WRI', name: 'Writing, Research, & Inquiry', required: 2 }
    ];

    const completed = new Map<string, number>();
    const inProgress = new Map<string, number>();
    
    buCoursesHub.forEach(course => {
      course.hubUnits.forEach(unit => {
        if (course.status === 'Completed') {
          completed.set(unit, (completed.get(unit) || 0) + 1);
        } else if (course.status === 'In Progress') {
          inProgress.set(unit, (inProgress.get(unit) || 0) + 1);
        }
      });
    });

    return allHubUnits.map(hub => {
      const completedCount = completed.get(hub.code) || 0;
      const inProgressCount = inProgress.get(hub.code) || 0;
      const remaining = Math.max(0, hub.required - completedCount - inProgressCount);
      
      return {
        ...hub,
        completed: completedCount,
        inProgress: inProgressCount,
        remaining,
        status: completedCount >= hub.required ? 'complete' : 
                (completedCount + inProgressCount) >= hub.required ? 'in-progress' : 'missing'
      };
    });
  }, [])

  // Flatten buMajors JSON immediately
  const filteredResults = useMemo(() => {
    const rows: any[] = []
    buMajors['colleges'].forEach((college: any) => {
      if (!college.found) return
      college.requirements?.forEach((req: any) => {
        rows.push([
          college.major,
          req.courseName || req.courseCode || '—',
          req.courseCode || '—',
          req.skills || req.rawRequirementsText?.slice(0, 100) || '—',
          req.relevance || '—',
          req.prereq || '—',
          req.groupCategory || '—',
        ])
      })
    })
    return rows
  }, [])

  // Apply search filters
  const displayedResults = useMemo(() => {
    return filteredResults.filter(([careerName, courseName]) =>
      careerName.toLowerCase().includes(careerSearch.toLowerCase()) &&
      courseName.toLowerCase().includes(majorSearch.toLowerCase())
    )
  }, [filteredResults, careerSearch, majorSearch])

  // Fetch AI recommendations when careerSearch changes
  useEffect(() => {
    if (!careerSearch) {
      setAiRecommendations([])
      setCareerData(null)
      setSearchStats(null)
      return
    }
    
    setIsLoadingRecommendations(true)
    
    // Make the API call and handle the full response
    fetch(`/api/enhanced-chatcompletion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        career: careerSearch.trim(),
        missingUnits: []
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('API Response:', data);
      setAiRecommendations(data.recommendations || []);
      
      // Store additional data from enhanced API
      if (data.career) {
        setCareerData(data.career);
      }
      if (data.searchStats) {
        setSearchStats(data.searchStats);
      }
      if (data.academicPlan) {
        setAcademicPlan(data.academicPlan);
      }
    })
    .catch(error => {
      console.error('Error fetching recommendations:', error);
      setAiRecommendations([]);
      setCareerData(null);
      setSearchStats(null);
      setAcademicPlan(null);
    })
    .finally(() => {
      setIsLoadingRecommendations(false);
    });
  }, [careerSearch])

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 relative flex flex-col items-center py-10 px-8">
      {/* Header with search */}
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
              className="border border-gray-300 text-black rounded-2xl px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-56"
            />
            <input
              type="text"
              placeholder="Search Career..."
              value={careerSearch}
              onChange={(e) => setCareerSearch(e.target.value)}
              className="border border-gray-300 text-black rounded-2xl px-3 py-1.5 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-56"
            />
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="absolute top-6 right-6">
        <form action={signOut}>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition shadow-sm"
          >
            Logout
          </button>
        </form>
      </div>

      {/* Academic Schedule Table */}
      <div className="mt-32 w-full max-w-6xl mb-8">
        <h2 className="text-xl font-semibold mb-3">
          {academicPlan ? 'Personalized Academic Plan' : 'Sample Academic Schedule'}
        </h2>
        {academicPlan ? (
          <div className="space-y-6">
            {/* Academic Plan Overview */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Plan Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-700">Career Focus</div>
                  <div className="text-blue-600">{academicPlan.career}</div>
                </div>
                <div>
                  <div className="font-medium text-blue-700">Total Credits</div>
                  <div className="text-blue-600">{academicPlan.totalCredits}</div>
                </div>
                <div>
                  <div className="font-medium text-blue-700">Duration</div>
                  <div className="text-blue-600">4 Years</div>
                </div>
                <div>
                  <div className="font-medium text-blue-700">Status</div>
                  <div className="text-green-600">Ready to Start</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {academicPlan.recommendations && academicPlan.recommendations.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Academic Recommendations</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                  {academicPlan.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
        <table className="min-w-full border border-gray-300 shadow-sm rounded-xl overflow-hidden text-sm">
          <thead className="bg-gray-100 text-slate-800">
            <tr>
              <th className="px-4 py-2 text-left">Semester</th>
              <th className="px-4 py-2 text-left">Classes</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(schedule).map(([year, semesters]) =>
              Object.entries(semesters).map(([semester, classes], i) => (
                <tr key={`${year}-${semester}-${i}`} className="even:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{`${year} - ${semester}`}</td>
                  <td className="px-4 py-2">{classes.length > 0 ? classes.join(', ') : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}
      </div>

      {/* Career Information */}
      {careerData && (
        <div className="mt-8 w-full max-w-6xl">
          <h2 className="text-xl font-semibold mb-3">Career Information</h2>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{careerData.title}</h3>
                <p className="text-slate-600 mb-4">{careerData.description}</p>
                <div className="space-y-2">
                  <p><span className="font-medium">Education Required:</span> {careerData.education_required}</p>
                  {careerData.median_salary && (
                    <p><span className="font-medium">Median Salary:</span> ${careerData.median_salary.toLocaleString()}</p>
                  )}
                  {careerData.job_outlook && (
                    <p><span className="font-medium">Job Outlook:</span> {careerData.job_outlook}</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Key Skills Required</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {careerData.skills.slice(0, 8).map((skill: any, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {skill.name}
                    </span>
                  ))}
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Knowledge Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {careerData.knowledge.slice(0, 6).map((knowledge: any, index: number) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {knowledge.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hub Requirements Tracker */}
      <div className="mt-8 w-full max-w-6xl">
        <h2 className="text-xl font-semibold mb-3">BU Hub Requirements Progress</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hubRequirements.map((hub) => (
              <div 
                key={hub.code} 
                className={`border rounded-lg p-4 ${
                  hub.status === 'complete' ? 'border-green-300 bg-green-50' :
                  hub.status === 'in-progress' ? 'border-yellow-300 bg-yellow-50' :
                  'border-red-300 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-sm">{hub.code}</div>
                    <div className="text-xs text-gray-600">{hub.name}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    hub.status === 'complete' ? 'bg-green-200 text-green-800' :
                    hub.status === 'in-progress' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {hub.status === 'complete' ? '✓ Complete' :
                     hub.status === 'in-progress' ? '⏳ In Progress' :
                     '✗ Missing'}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          hub.status === 'complete' ? 'bg-green-500' :
                          hub.status === 'in-progress' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, ((hub.completed + hub.inProgress) / hub.required) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="font-medium whitespace-nowrap">
                    {hub.completed + hub.inProgress}/{hub.required}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  {hub.completed > 0 && <span className="text-green-700">✓ {hub.completed} completed</span>}
                  {hub.inProgress > 0 && <span className="text-yellow-700 ml-2">⏳ {hub.inProgress} in progress</span>}
                  {hub.remaining > 0 && <span className="text-red-700 ml-2">✗ {hub.remaining} needed</span>}
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {hubRequirements.filter(h => h.status === 'complete').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {hubRequirements.filter(h => h.status === 'in-progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {hubRequirements.filter(h => h.status === 'missing').length}
                </div>
                <div className="text-sm text-gray-600">Missing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Statistics */}
      {searchStats && (
        <div className="mt-4 w-full max-w-6xl">
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-slate-800 mb-2">Search Results</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">{searchStats.vectorMatches}</div>
                <div className="text-slate-600">AI-Matched Courses</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{searchStats.basicCourses}</div>
                <div className="text-slate-600">University Courses</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{searchStats.totalRecommendations}</div>
                <div className="text-slate-600">Final Recommendations</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="mt-8 w-full max-w-6xl">
        <h2 className="text-xl font-semibold mb-3">AI Recommended Courses</h2>
        {isLoadingRecommendations ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
            <span className="ml-2 text-slate-600">Loading AI recommendations...</span>
          </div>
        ) : aiRecommendations.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100 text-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left">Course Code</th>
                  <th className="px-4 py-2 text-left">Course Name</th>
                  <th className="px-4 py-2 text-left">Reason</th>
                  <th className="px-4 py-2 text-left">Skills</th>
                  <th className="px-4 py-2 text-left">Prerequisites</th>
                  <th className="px-4 py-2 text-left">Confidence</th>
                </tr>
              </thead>
              <tbody>
          {aiRecommendations.map((rec, i) => (
                  <tr key={i} className="even:bg-gray-50 hover:bg-blue-50 transition">
                    <td className="px-4 py-2 font-mono text-sm">{rec.courseCode || 'N/A'}</td>
                    <td className="px-4 py-2 font-medium">{rec.courseName}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">{rec.reason}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="space-y-1">
                        <div>{rec.skills || 'N/A'}</div>
                        {rec.skillMatch && rec.skillMatch.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {rec.skillMatch.map((skill: string, idx: number) => (
                              <span key={idx} className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">{rec.prerequisites || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm">
                      {rec.confidence !== undefined ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                rec.confidence >= 0.8 ? 'bg-green-500' : 
                                rec.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${rec.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-600">
                            {Math.round(rec.confidence * 100)}%
                          </span>
                        </div>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : careerSearch ? (
          <div className="text-center py-8 text-slate-500">
            No AI recommendations available for "{careerSearch}". Try a different career path.
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            Enter a career path to get AI-powered course recommendations.
          </div>
        )}
      </div>
    </div>
  )
}