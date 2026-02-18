import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  if (profile.role === 'player') redirect('/dashboard/player')
  if (profile.role === 'coach') redirect('/dashboard/coach')
  if (profile.role === 'program') redirect('/dashboard/program')

  redirect('/auth/login')
}
