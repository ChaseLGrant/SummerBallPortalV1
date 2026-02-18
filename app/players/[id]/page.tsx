import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { PlayerProfile } from '@/types'

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: player } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!player) notFound()

  const p = player as PlayerProfile
  const metrics = (p.metrics || {}) as Record<string, number | undefined>

  // Check auth for contact info
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/players" className="text-sm text-brand-600 hover:text-brand-700 mb-6 inline-block">
        ← Back to Players
      </Link>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {p.headshot_url ? (
            <img src={p.headshot_url} alt={p.full_name} className="w-32 h-32 rounded-xl object-cover border shadow-sm" />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-4xl">
              {(p.full_name || '?')[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Header info */}
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">{p.full_name || 'Unnamed Player'}</h1>
          {p.school && <p className="mt-1 text-lg text-gray-600">{p.school}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            {p.class_year && <Badge variant="outline">{p.class_year}</Badge>}
            {(p.positions || []).map((pos) => (
              <Badge key={pos}>{pos}</Badge>
            ))}
          </div>
          {p.open_to_travel && (
            <Badge variant="success" className="mt-2">✈️ Open to travel</Badge>
          )}
          {p.coach_uploaded && (
            <Badge variant="warning" className="mt-2">Uploaded by coach</Badge>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Stats */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Physical</h2></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              {p.height && <><dt className="text-gray-500">Height</dt><dd className="font-medium">{p.height}</dd></>}
              {p.weight && <><dt className="text-gray-500">Weight</dt><dd className="font-medium">{p.weight} lbs</dd></>}
              {p.bats && <><dt className="text-gray-500">Bats</dt><dd className="font-medium">{p.bats}</dd></>}
              {p.throws && <><dt className="text-gray-500">Throws</dt><dd className="font-medium">{p.throws}</dd></>}
              {p.hometown && <><dt className="text-gray-500">Hometown</dt><dd className="font-medium">{p.hometown}</dd></>}
            </dl>
          </CardContent>
        </Card>

        {/* Metrics */}
        {(metrics.exit_velo || metrics.sixty_time || metrics.velo) && (
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900">Metrics</h2></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                {metrics.exit_velo && <><dt className="text-gray-500">Exit Velo</dt><dd className="font-medium">{metrics.exit_velo} mph</dd></>}
                {metrics.sixty_time && <><dt className="text-gray-500">60 Time</dt><dd className="font-medium">{metrics.sixty_time}s</dd></>}
                {metrics.velo && <><dt className="text-gray-500">Pitching Velo</dt><dd className="font-medium">{metrics.velo} mph</dd></>}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Availability */}
        {(p.availability_start || p.availability_end) && (
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900">Availability</h2></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                {p.availability_start && <><dt className="text-gray-500">From</dt><dd className="font-medium">{p.availability_start}</dd></>}
                {p.availability_end && <><dt className="text-gray-500">Until</dt><dd className="font-medium">{p.availability_end}</dd></>}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Contact</h2></CardHeader>
          <CardContent>
            {isLoggedIn ? (
              <div className="space-y-3">
                {p.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{p.email}</p>
                    <a
                      href={`mailto:${p.email}?subject=Summer Ball Opportunity - ${p.full_name}`}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Send Email →
                    </a>
                  </div>
                )}
                {p.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{p.phone}</p>
                  </div>
                )}
                {!p.email && !p.phone && (
                  <p className="text-sm text-gray-500">No contact information provided.</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">Log in to see contact information</p>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Log In →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bio */}
      {p.bio && (
        <Card className="mt-6">
          <CardHeader><h2 className="font-semibold text-gray-900">Bio</h2></CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{p.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Video Links */}
      {p.video_links && p.video_links.length > 0 && (
        <Card className="mt-6">
          <CardHeader><h2 className="font-semibold text-gray-900">Video</h2></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {p.video_links.map((link, i) => (
                <li key={i}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-700 text-sm break-all"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
