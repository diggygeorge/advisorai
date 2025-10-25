// app/page.tsx (or wherever HomePage lives)
import { createClient } from '@/utils/supabase/server'
import { signOut } from '../app/logout/actions'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold">Welcome, {user.email}</h1>

      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </form>
    </main>
  )
}