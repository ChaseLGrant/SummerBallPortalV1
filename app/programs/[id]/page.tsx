import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { ProgramListing } from '@/types'

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: program } = await supabase
    .from('program_listings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!program) notFound()

  const p = program as ProgramListing

  // Check auth for contact info
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/programs" className="text-sm text-brand-600 hover:text-brand-700 mb-6 inline-block">
        ← Back to Programs
      </Link>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {p.logo_url ? (
          <img src={p.logo_url} alt={p.program_name} className="w-24 h-24 rounded-xl object-cover border shadow-sm flex-shrink-0" />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-field-100 flex items-center justify-center text-field-700 font-bold text-3xl flex-shrink-0">
            {(p.program_name || '?')[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">{p.program_name}</h1>
          {p.league_name && <p className="mt-1 text-lg text-gray-600">{p.league_name}</p>}
          {(p.location_city || p.location_state) && (
            <p className="mt-1 text-gray-500">📍 {[p.location_city, p.location_state].filter(Boolean).join(', ')}</p>
          )}
          {p.website && (
            <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:text-brand-700 mt-1 inline-block">
              🔗 {p.website}
            </a>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program Details */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Program Details</h2></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              {p.travel_type && <><dt className="text-gray-500">Travel</dt><dd className="font-medium">{p.travel_type}</dd></>}
              {p.host_family && <><dt className="text-gray-500">Host Family</dt><dd className="font-medium">{p.host_family}</dd></>}
              {p.league_fees !== null && p.league_fees !== undefined && <><dt className="text-gray-500">Fees</dt><dd className="font-medium">${Number(p.league_fees).toLocaleString()}</dd></>}
              {p.fees_includes && <><dt className="text-gray-500">Includes</dt><dd className="font-medium">{p.fees_includes}</dd></>}
              {p.roster_openings !== null && p.roster_openings !== undefined && <><dt className="text-gray-500">Roster Openings</dt><dd className="font-medium">{p.roster_openings}</dd></>}
            </dl>
          </CardContent>
        </Card>

        {/* Season Dates */}
        {(p.start_date || p.end_date) && (
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900">Season</h2></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                {p.start_date && <><dt className="text-gray-500">Start</dt><dd className="font-medium">{p.start_date}</dd></>}
                {p.end_date && <><dt className="text-gray-500">End</dt><dd className="font-medium">{p.end_date}</dd></>}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Positions Needed */}
        {(p.positions_needed || []).length > 0 && (
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900">Positions Needed</h2></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {p.positions_needed.map((pos) => (
                  <Badge key={pos}>{pos}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Contact</h2></CardHeader>
          <CardContent>
            {isLoggedIn ? (
              <div className="space-y-3">
                {p.contact_name && (
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{p.contact_name}</p>
                  </div>
                )}
                {p.contact_email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{p.contact_email}</p>
                    <a
                      href={`mailto:${p.contact_email}?subject=Interest in ${p.program_name}`}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Send Email →
                    </a>
                  </div>
                )}
                {p.contact_phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{p.contact_phone}</p>
                  </div>
                )}
                {!p.contact_email && !p.contact_phone && !p.contact_name && (
                  <p className="text-sm text-gray-500">No contact information provided.</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">Log in to see contact information</p>
                <Link href="/auth/login" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Log In →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {p.description && (
        <Card className="mt-6">
          <CardHeader><h2 className="font-semibold text-gray-900">About</h2></CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{p.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
