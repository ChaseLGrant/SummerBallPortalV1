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
import { POSITIONS, CLASS_YEARS, BATS_OPTIONS, THROWS_OPTIONS } from '@/types'

export default function PlayerDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    school: '',
    class_year: '',
    positions: [] as string[],
    bats: '',
    throws: '',
    height: '',
    weight: '' as string | number,
    hometown: '',
    availability_start: '',
    availability_end: '',
    open_to_travel: false,
    exit_velo: '',
    sixty_time: '',
    velo: '',
    bio: '',
    video_links_text: '',
    headshot_url: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        const metrics = (data.metrics || {}) as Record<string, number | undefined>
        setForm({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          school: data.school || '',
          class_year: data.class_year || '',
          positions: data.positions || [],
          bats: data.bats || '',
          throws: data.throws || '',
          height: data.height || '',
          weight: data.weight || '',
          hometown: data.hometown || '',
          availability_start: data.availability_start || '',
          availability_end: data.availability_end || '',
          open_to_travel: data.open_to_travel || false,
          exit_velo: metrics.exit_velo?.toString() || '',
          sixty_time: metrics.sixty_time?.toString() || '',
          velo: metrics.velo?.toString() || '',
          bio: data.bio || '',
          video_links_text: (data.video_links || []).join(', '),
          headshot_url: data.headshot_url || '',
        })
      } else {
        setForm((f) => ({ ...f, email: user.email || '' }))
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = `${userId}/headshot.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { toast.error('Upload failed: ' + error.message); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    setForm((f) => ({ ...f, headshot_url: urlData.publicUrl }))
    toast.success('Image uploaded!')
  }

  const handleSave = async () => {
    setSaving(true)
    const metrics: Record<string, number> = {}
    if (form.exit_velo) metrics.exit_velo = Number(form.exit_velo)
    if (form.sixty_time) metrics.sixty_time = Number(form.sixty_time)
    if (form.velo) metrics.velo = Number(form.velo)

    const videoLinks = form.video_links_text
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)

    const { error } = await supabase.from('player_profiles').upsert({
      id: userId,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      school: form.school,
      class_year: form.class_year,
      positions: form.positions,
      bats: form.bats || null,
      throws: form.throws || null,
      height: form.height || null,
      weight: form.weight ? Number(form.weight) : null,
      hometown: form.hometown || null,
      availability_start: form.availability_start || null,
      availability_end: form.availability_end || null,
      open_to_travel: form.open_to_travel,
      metrics,
      bio: form.bio || null,
      video_links: videoLinks,
      headshot_url: form.headshot_url || null,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      toast.error('Save failed: ' + error.message)
    } else {
      toast.success('Profile saved!')
    }
    setSaving(false)
  }

  if (loading) return <div className="py-12 text-center text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Player Profile</h1>
          <p className="text-sm text-gray-500">Edit your profile to be discovered by summer programs</p>
        </div>
        <Link
          href={`/players/${userId}`}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          View Public Profile →
        </Link>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Basic Information</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="School" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
          <Select
            label="Class Year"
            value={form.class_year}
            onChange={(e) => setForm({ ...form, class_year: e.target.value })}
            options={CLASS_YEARS.map((y) => ({ value: y, label: y }))}
            placeholder="Select year"
          />
          <Input label="Hometown" value={form.hometown} onChange={(e) => setForm({ ...form, hometown: e.target.value })} />
        </CardContent>
      </Card>

      {/* Physical + Positions */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Physical &amp; Positions</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Height" placeholder="e.g. 6'1&quot;" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
          <Input label="Weight (lbs)" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          <Select
            label="Bats"
            value={form.bats}
            onChange={(e) => setForm({ ...form, bats: e.target.value })}
            options={BATS_OPTIONS.map((b) => ({ value: b, label: b }))}
            placeholder="Select"
          />
          <Select
            label="Throws"
            value={form.throws}
            onChange={(e) => setForm({ ...form, throws: e.target.value })}
            options={THROWS_OPTIONS.map((t) => ({ value: t, label: t }))}
            placeholder="Select"
          />
          <div className="md:col-span-2">
            <MultiSelect
              label="Positions"
              options={[...POSITIONS]}
              value={form.positions}
              onChange={(v) => setForm({ ...form, positions: v })}
              placeholder="Select positions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Availability</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Available From" type="date" value={form.availability_start} onChange={(e) => setForm({ ...form, availability_start: e.target.value })} />
          <Input label="Available Until" type="date" value={form.availability_end} onChange={(e) => setForm({ ...form, availability_end: e.target.value })} />
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.open_to_travel}
                onChange={(e) => setForm({ ...form, open_to_travel: e.target.checked })}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="font-medium text-gray-700">Open to travel</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Metrics (optional)</h2></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Exit Velo (mph)" type="number" value={form.exit_velo} onChange={(e) => setForm({ ...form, exit_velo: e.target.value })} />
          <Input label="60 Time (sec)" type="number" step="0.01" value={form.sixty_time} onChange={(e) => setForm({ ...form, sixty_time: e.target.value })} />
          <Input label="Throwing/Pitching Velo (mph)" type="number" value={form.velo} onChange={(e) => setForm({ ...form, velo: e.target.value })} />
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Media</h2></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headshot</label>
            <div className="flex items-center gap-4">
              {form.headshot_url && (
                <img src={form.headshot_url} alt="Headshot" className="w-16 h-16 rounded-full object-cover border" />
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
            </div>
          </div>
          <Input
            label="Video Links (comma-separated)"
            placeholder="https://youtube.com/..., https://twitter.com/..."
            value={form.video_links_text}
            onChange={(e) => setForm({ ...form, video_links_text: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900">Bio</h2></CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tell programs about yourself..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  )
}
