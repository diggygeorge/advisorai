'use client'


import { useSearchParams, useRouter } from 'next/navigation'
import { Playfair_Display } from 'next/font/google'
import { Inter } from 'next/font/google'
import Image from 'next/image'


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
    const searchParams = useSearchParams()

    const career = searchParams.get('career')
    const major = searchParams.get('major')


    return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-slate-900 relative">
    {/* Home button */}
    <Image
      src="/house.png"
      alt="Home"
      width={32}
      height={32}
      onClick={() => router.push('/')}
      className="absolute top-4 left-4 cursor-pointer hover:opacity-80 transition"
    />

    <h1 className={`${playfair.className} text-slate-800 absolute top-18 left-6 text-6xl font-bold mb-6`}> 
    {career || 'Career Path'}
    </h1>

    <p className={`${inter.className} text-slate-700 absolute top-35 left-10 text-1xl mb-6`}> 
    in {major || 'Major'}
    </p>

  </div>
)

}

