'use client'

import { createClient } from '@/utils/supabase/client'
import { Archivo_Black, Inter, Playfair_Display } from 'next/font/google'

const archivo = Archivo_Black({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['500'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '700'],
})

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* Header */}
      <nav className="flex justify-between items-center px-6 py-4 bg-slate-700 shadow-md">

      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center mt-30 px-4">
        <h1 className={`${playfair.className} text-slate-900 text-5xl font-bold mb-4 text-center`}>
          Welcome to AdvisorAI
        </h1>
        <p className={`${inter.className} text-slate-600 text-lg mb-10 text-center max-w-2xl`}>
          Your intelligent academic advisor powered by AI. Plan your path, discover courses, and achieve your career goals.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className={`${playfair.className} text-2xl font-semibold mb-6 text-center text-slate-800`}>
            Sign in to Continue
          </h2>
          
          <button
            onClick={handleGoogleLogin}
            className={`${inter.className} w-full px-6 py-3 bg-slate-700 text-white rounded-md hover:bg-slate-900 transition shadow-md flex items-center justify-center gap-3`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
          <div className="text-center p-6">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className={`${inter.className} font-semibold text-slate-800 mb-2`}>Career Planning</h3>
            <p className="text-sm text-slate-600">AI-powered career recommendations based on your goals</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-3">📚</div>
            <h3 className={`${inter.className} font-semibold text-slate-800 mb-2`}>Course Matching</h3>
            <p className="text-sm text-slate-600">Find the perfect courses for your academic journey</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-3">📅</div>
            <h3 className={`${inter.className} font-semibold text-slate-800 mb-2`}>Schedule Builder</h3>
            <p className="text-sm text-slate-600">Create your personalized 4-year academic plan</p>
          </div>
        </div>
      </main>
    </div>
  )
}