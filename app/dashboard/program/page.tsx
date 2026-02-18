'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MultiSelect } from '@/components/ui/multi-select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { POSITIONS, TRAVEL_TYPES, HOST_FAMILY_OPTIONS, US_STATES } from '@/types'

export default function ProgramDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const [listingId, setListingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    program_name: '',
    league_name: '',
    website: '',
    description: '',
    location_city: '',
    location_state: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    travel_type: '',
    host_family: '',
    league_fees: '' as string | number,
    fees_includes: '',
    roster_openings: '' as string | number,
    start_date: '',
    end_date: '',
    positions_needed: [] as string[],
    logo_url: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('program_listings')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (data) {
        setListingId(data.id)
        setForm({
          program_name: data.program_name || '',
          league_name: data.league_name || '',
          website: data.website || '',
          description: data.description || '',
          location_city: data.location_city || '',
          location_state: data.location_state || '',
          contact_name: data.contact_name || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          travel_type: data.travel_type || '',
          host_family: data.host_family || '',
          league_fees: data.league_fees || '',
          fees_includes: data.fees_includes || '',
          roster_openings: data.roster_openings || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          positions_needed: data.positions_needed || [],
          logo_url: data.logo_url || '',
        })
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = `${userId}/logo.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed: ' + error.message); return }
    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
    setForm((f) => ({ ...f, logo_url: urlData.publicUrl }))
    toast.success('Logo uploaded!')
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      owner_id: userId,
      program_name: form.program_name,
      league_name: form.league_name || null,
      website: form.website || null,
      description: form.description || null,
      location_city: form.location_city || null,
      location_state: form.location_state || null,
      contact_name: form.contact_name || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      travel_type: form.travel_type || null,
      host_family: form.host_family || null,
      league_fees: form.league_fees ? Number(form.league_fees) : null,
      fees_includes: form.fees_includes || null,
      roster_openings: form.roster_openings ? Number(form.roster_openings) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      positions_needed: form.positions_needed,
      logo_url: form.logo_url || null,
      updated_at: new Date().toISOString(),
    }

    let error
    if (listingId) {
      const result = await supabase.from('program_listings').update(payload).eq('id', listingId)
      error = result.error
    } else {
      const result = await supabase.from('program_listings').insert(payload).select().single()
      error = result.error
      if (result.data) setListingId(result.data.id)
    }

    if (error) {
      toast.error('Save failed: ' + error.message)
    } else {
      toast.success('Listing saved!')
    }
    setSaving(false)
  }

  if (loading) return <div className="py-12 text-center text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Program Listing</h1>
          <p className="text-sm text-gray-500">Create or edit your summer program listing</p>
        </div>
        {listingId && (
          <Link href={`/programs/${listingId}`} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            View Public Listing →
          </Link>
        )}
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Basic Information</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Program Name" value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} required />
          <Input label="League Name" value={form.league_name} onChange={(e) => setForm({ ...form, league_name: e.target.value })} />
          <Input label="Website" type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
          <div className="md:col-span-2">
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe your program..." />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Location</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="City" value={form.location_city} onChange={(e) => setForm({ ...form, location_city: e.target.value })} />
          <Select
            label="State"
            value={form.location_state}
            onChange={(e) => setForm({ ...form, location_state: e.target.value })}
            options={US_STATES.map((s) => ({ value: s, label: s }))}
            placeholder="Select state"
          />
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Contact Information</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Contact Name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          <Input label="Contact Email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          <Input label="Contact Phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
        </CardContent>
      </Card>

      {/* Program Details */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Program Details</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Travel Type"
            value={form.travel_type}
            onChange={(e) => setForm({ ...form, travel_type: e.target.value })}
            options={TRAVEL_TYPES.map((t) => ({ value: t, label: t }))}
            placeholder="Select"
          />
          <Select
            label="Host Family"
            value={form.host_family}
            onChange={(e) => setForm({ ...form, host_family: e.target.value })}
            options={HOST_FAMILY_OPTIONS.map((h) => ({ value: h, label: h }))}
            placeholder="Select"
          />
          <Input label="League Fees ($)" type="number" value={form.league_fees} onChange={(e) => setForm({ ...form, league_fees: e.target.value })} />
          <Input label="Fees Include" value={form.fees_includes} onChange={(e) => setForm({ ...form, fees_includes: e.target.value })} placeholder="What's included in fees" />
          <Input label="Roster Openings" type="number" value={form.roster_openings} onChange={(e) => setForm({ ...form, roster_openings: e.target.value })} />
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Season Dates</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <Input label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        </CardContent>
      </Card>

      {/* Positions Needed */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Positions Needed</h2></CardHeader>
        <CardContent>
          <MultiSelect
            options={[...POSITIONS]}
            value={form.positions_needed}
            onChange={(v) => setForm({ ...form, positions_needed: v })}
            placeholder="Select positions you need"
          />
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Program Logo</h2></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {form.logo_url && (
              <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover border" />
            )}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : listingId ? 'Update Listing' : 'Create Listing'}
        </Button>
      </div>
    </div>
  )
}
