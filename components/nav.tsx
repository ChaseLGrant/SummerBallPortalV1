'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { UserRole } from '@/types'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; role?: UserRole } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single()
        setUser({ id: authUser.id, role: profile?.role })
      } else {
        setUser(null)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === href
        ? 'text-brand-700 bg-brand-50'
        : 'text-gray-600 hover:text-brand-700 hover:bg-gray-50'
    }`

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl text-brand-700">
            <span className="text-2xl">⚾</span>
            <span>Summer Ball Portal</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/players" className={linkClass('/players')}>Players</Link>
            <Link href="/programs" className={linkClass('/programs')}>Programs</Link>
            {user ? (
              <>
                <Link href="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={linkClass('/auth/login')}>Login</Link>
                <Link
                  href="/auth/signup"
                  className="ml-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link href="/players" className={`block ${linkClass('/players')}`} onClick={() => setMenuOpen(false)}>Players</Link>
            <Link href="/programs" className={`block ${linkClass('/programs')}`} onClick={() => setMenuOpen(false)}>Programs</Link>
            {user ? (
              <>
                <Link href="/dashboard" className={`block ${linkClass('/dashboard')}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={`block ${linkClass('/auth/login')}`} onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/auth/signup" className={`block ${linkClass('/auth/signup')}`} onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
