'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Papa from 'papaparse'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from 'sonner'
import { POSITIONS, CLASS_YEARS, BATS_OPTIONS, THROWS_OPTIONS } from '@/types'
import type { PlayerProfile } from '@/types'

const CSV_TEMPLATE = `full_name,email,phone,school,class_year,positions,bats,throws,height,weight,hometown,open_to_travel
"John Smith","john@example.com","555-0100","State University","Junior","SS,2B","Right","Right","6'0",185,"Austin TX",true
"Jane Doe","jane@example.com","555-0101","State University","Sophomore","CF,LF","Left","Left","5'9",165,"Dallas TX",false`

export default function CoachDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [saving, setSaving] = useState(false)

  // Coach profile
  const [coach, setCoach] = useState({
    full_name: '',
    college_name: '',
    title: '',
    phone: '',
  })

  // My players
  const [players, setPlayers] = useState<PlayerProfile[]>([])

  // Add single player form
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [newPlayer, setNewPlayer] = useState({
    full_name: '',
    email: '',
    phone: '',
    school: '',
    class_year: '',
    positions: [] as string[],
    bats: '',
    throws: '',
    height: '',
    weight: '',
    hometown: '',
    open_to_travel: false,
  })

  // Bulk upload
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const loadPlayers = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('coach_id', uid)
      .eq('coach_uploaded', true)
      .order('full_name')
    setPlayers((data || []) as PlayerProfile[])
  }, [supabase])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      // Load coach profile
      const { data: coachData } = await supabase
        .from('coach_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (coachData) {
        setCoach({
          full_name: coachData.full_name || '',
          college_name: coachData.college_name || '',
          title: coachData.title || '',
          phone: coachData.phone || '',
        })
        // Default school for new players
        setNewPlayer((p) => ({ ...p, school: coachData.college_name || '' }))
      }

      await loadPlayers(user.id)
      setLoading(false)
    }
    load()
  }, [])

  const saveCoachProfile = async () => {
    setSaving(true)
    const { error } = await supabase.from('coach_profiles').upsert({
      id: userId,
      ...coach,
      updated_at: new Date().toISOString(),
    })
    if (error) toast.error('Save failed: ' + error.message)
    else toast.success('Coach profile saved!')
    setSaving(false)
  }

  const addSinglePlayer = async () => {
    setSaving(true)
    // Create a profile entry for this player (we use a generated UUID since they don't have an auth account)
    const playerId = crypto.randomUUID()
    
    const { error: profileError } = await supabase.from('profiles').insert({
      id: playerId,
      role: 'player',
    })

    if (profileError) {
      toast.error('Failed to create player profile: ' + profileError.message)
      setSaving(false)
      return
    }

    const { error } = await supabase.from('player_profiles').insert({
      id: playerId,
      full_name: newPlayer.full_name,
      email: newPlayer.email || null,
      phone: newPlayer.phone || null,
      school: newPlayer.school || coach.college_name || null,
      class_year: newPlayer.class_year || null,
      positions: newPlayer.positions,
      bats: newPlayer.bats || null,
      throws: newPlayer.throws || null,
      height: newPlayer.height || null,
      weight: newPlayer.weight ? Number(newPlayer.weight) : null,
      hometown: newPlayer.hometown || null,
      open_to_travel: newPlayer.open_to_travel,
      coach_id: userId,
      coach_uploaded: true,
    })
    if (error) {
      toast.error('Failed to add player: ' + error.message)
    } else {
      toast.success('Player added!')
      setNewPlayer({
        full_name: '', email: '', phone: '', school: coach.college_name || '',
        class_year: '', positions: [], bats: '', throws: '', height: '', weight: '', hometown: '', open_to_travel: false,
      })
      setShowAddPlayer(false)
      await loadPlayers(userId)
    }
    setSaving(false)
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvErrors([])

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = []
        const rows = results.data as Record<string, string>[]
        
        rows.forEach((row, i) => {
          if (!row.full_name?.trim()) errors.push(`Row ${i + 1}: Missing full_name`)
        })

        if (results.errors.length > 0) {
          results.errors.forEach((err) => errors.push(`CSV Error: ${err.message}`))
        }

        setCsvErrors(errors)
        setCsvPreview(rows)
      },
    })
  }

  const confirmBulkUpload = async () => {
    setUploading(true)
    let success = 0
    let failed = 0

    for (const row of csvPreview) {
      if (!row.full_name?.trim()) { failed++; continue }

      const playerId = crypto.randomUUID()
      
      const { error: profileError } = await supabase.from('profiles').insert({
        id: playerId,
        role: 'player',
      })

      if (profileError) { failed++; continue }

      const positions = (row.positions || '').split(',').map((p) => p.trim()).filter(Boolean)

      const { error } = await supabase.from('player_profiles').insert({
        id: playerId,
        full_name: row.full_name.trim(),
        email: row.email?.trim() || null,
        phone: row.phone?.trim() || null,
        school: row.school?.trim() || coach.college_name || null,
        class_year: row.class_year?.trim() || null,
        positions,
        bats: row.bats?.trim() || null,
        throws: row.throws?.trim() || null,
        height: row.height?.trim() || null,
        weight: row.weight ? Number(row.weight) : null,
        hometown: row.hometown?.trim() || null,
        open_to_travel: row.open_to_travel === 'true',
        coach_id: userId,
        coach_uploaded: true,
      })
      if (error) failed++
      else success++
    }

    toast.success(`Imported ${success} players${failed > 0 ? `, ${failed} failed` : ''}`)
    setCsvPreview([])
    await loadPlayers(userId)
    setUploading(false)
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'player_upload_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const deletePlayer = async (playerId: string) => {
    const { error } = await supabase.from('player_profiles').delete().eq('id', playerId)
    if (error) toast.error('Delete failed: ' + error.message)
    else {
      // Also delete the profile
      await supabase.from('profiles').delete().eq('id', playerId)
      toast.success('Player removed')
      await loadPlayers(userId)
    }
  }

  if (loading) return <div className="py-12 text-center text-gray-500">Loading...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Coach Dashboard</h1>
        <p className="text-sm text-gray-500">Manage your profile and players</p>
      </div>

      {/* Coach Profile */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Coach Profile</h2></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={coach.full_name} onChange={(e) => setCoach({ ...coach, full_name: e.target.value })} />
            <Input label="College / Program" value={coach.college_name} onChange={(e) => setCoach({ ...coach, college_name: e.target.value })} />
            <Input label="Title / Role" value={coach.title} onChange={(e) => setCoach({ ...coach, title: e.target.value })} placeholder="e.g. Head Coach, Assistant" />
            <Input label="Phone" value={coach.phone} onChange={(e) => setCoach({ ...coach, phone: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveCoachProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
          </div>
        </CardContent>
      </Card>

      {/* My Players */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">My Players ({players.length})</h2>
            <Button size="sm" onClick={() => setShowAddPlayer(!showAddPlayer)}>
              {showAddPlayer ? 'Cancel' : '+ Add Player'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddPlayer && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border space-y-4">
              <h3 className="font-medium text-gray-900">Add Single Player</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={newPlayer.full_name} onChange={(e) => setNewPlayer({ ...newPlayer, full_name: e.target.value })} required />
                <Input label="Email" type="email" value={newPlayer.email} onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })} />
                <Input label="Phone" value={newPlayer.phone} onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })} />
                <Input label="School" value={newPlayer.school} onChange={(e) => setNewPlayer({ ...newPlayer, school: e.target.value })} />
                <Select
                  label="Class Year"
                  value={newPlayer.class_year}
                  onChange={(e) => setNewPlayer({ ...newPlayer, class_year: e.target.value })}
                  options={CLASS_YEARS.map((y) => ({ value: y, label: y }))}
                  placeholder="Select"
                />
                <div>
                  <MultiSelect label="Positions" options={[...POSITIONS]} value={newPlayer.positions} onChange={(v) => setNewPlayer({ ...newPlayer, positions: v })} />
                </div>
                <Select label="Bats" value={newPlayer.bats} onChange={(e) => setNewPlayer({ ...newPlayer, bats: e.target.value })} options={BATS_OPTIONS.map((b) => ({ value: b, label: b }))} placeholder="Select" />
                <Select label="Throws" value={newPlayer.throws} onChange={(e) => setNewPlayer({ ...newPlayer, throws: e.target.value })} options={THROWS_OPTIONS.map((t) => ({ value: t, label: t }))} placeholder="Select" />
                <Input label="Height" value={newPlayer.height} onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })} placeholder="e.g. 6'1&quot;" />
                <Input label="Weight" type="number" value={newPlayer.weight} onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })} />
                <Input label="Hometown" value={newPlayer.hometown} onChange={(e) => setNewPlayer({ ...newPlayer, hometown: e.target.value })} />
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm pb-2">
                    <input type="checkbox" checked={newPlayer.open_to_travel} onChange={(e) => setNewPlayer({ ...newPlayer, open_to_travel: e.target.checked })} className="rounded border-gray-300 text-brand-600" />
                    <span className="font-medium text-gray-700">Open to travel</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={addSinglePlayer} disabled={saving || !newPlayer.full_name.trim()}>
                  {saving ? 'Adding...' : 'Add Player'}
                </Button>
              </div>
            </div>
          )}

          {players.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No players yet"
              description="Add players manually or use bulk CSV upload below."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">School</th>
                    <th className="pb-2 font-medium">Year</th>
                    <th className="pb-2 font-medium">Positions</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {players.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <Link href={`/players/${p.id}`} className="text-brand-600 hover:text-brand-700 font-medium">
                          {p.full_name || 'Unnamed'}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-600">{p.school || '—'}</td>
                      <td className="py-3 text-gray-600">{p.class_year || '—'}</td>
                      <td className="py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(p.positions || []).map((pos) => (
                            <Badge key={pos} variant="default">{pos}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <button onClick={() => deletePlayer(p.id)} className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Upload */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Bulk Upload Players (CSV)</h2></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              📥 Download CSV Template
            </Button>
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="text-sm"
              />
            </div>
          </div>

          {csvErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-red-800 mb-2">Validation Errors:</p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {csvErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {csvPreview.length > 0 && (
            <div>
              <p className="font-medium text-gray-900 mb-2">Preview ({csvPreview.length} players):</p>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">School</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Year</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Positions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {csvPreview.map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{row.full_name}</td>
                        <td className="px-3 py-2">{row.email}</td>
                        <td className="px-3 py-2">{row.school}</td>
                        <td className="px-3 py-2">{row.class_year}</td>
                        <td className="px-3 py-2">{row.positions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4 gap-3">
                <Button variant="outline" onClick={() => setCsvPreview([])}>Cancel</Button>
                <Button onClick={confirmBulkUpload} disabled={uploading || csvErrors.length > 0}>
                  {uploading ? 'Importing...' : `Import ${csvPreview.length} Players`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
