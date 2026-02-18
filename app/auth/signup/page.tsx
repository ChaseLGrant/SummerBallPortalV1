'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { UserRole } from '@/types'

const roles: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: 'player', label: 'Player', icon: '⚾', desc: 'Create your player profile and find summer programs' },
  { value: 'coach', label: 'College Coach', icon: '📋', desc: 'Upload and manage your players for summer placement' },
  { value: 'program', label: 'Summer Program', icon: '🏟️', desc: 'List your program and find players for your roster' },
]

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('player')

  useEffect(() => {
    const r = searchParams.get('role')
    if (r === 'player' || r === 'coach' || r === 'program') setRole(r)
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create profile row
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        role,
      })
      if (profileError && !profileError.message.includes('duplicate')) {
        console.error('Profile creation error:', profileError)
      }

      // Create role-specific profile
      if (role === 'player') {
        await supabase.from('player_profiles').insert({
          id: data.user.id,
          full_name: '',
          email,
        })
      } else if (role === 'coach') {
        await supabase.from('coach_profiles').insert({
          id: data.user.id,
          full_name: '',
        })
      }
      // Programs create their listing from dashboard
    }

    toast.success('Account created! Redirecting...')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-600">Join Summer Ball Portal for free</p>
        </div>
        <form onSubmit={handleSignup} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6">
          {/* Role selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">I am a...</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    role === r.value
                      ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{r.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
