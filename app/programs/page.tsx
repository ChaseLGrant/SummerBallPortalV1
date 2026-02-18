'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CardSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { POSITIONS, HOST_FAMILY_OPTIONS, US_STATES } from '@/types'
import type { ProgramListing } from '@/types'

const PAGE_SIZE = 12

export default function ProgramsPage() {
  const supabase = createClient()
  const [programs, setPrograms] = useState<ProgramListing[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [hostFilter, setHostFilter] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let query = supabase
        .from('program_listings')
        .select('*', { count: 'exact' })
        .order('program_name')

      if (search.trim()) {
        query = query.or(`program_name.ilike.%${search.trim()}%,league_name.ilike.%${search.trim()}%`)
      }
      if (posFilter) {
        query = query.contains('positions_needed', [posFilter])
      }
      if (stateFilter) {
        query = query.eq('location_state', stateFilter)
      }
      if (hostFilter) {
        query = query.eq('host_family', hostFilter)
      }

      const from = page * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)

      const { data, count } = await query
      setPrograms((data || []) as ProgramListing[])
      setTotal(count || 0)
      setLoading(false)
    }
    load()
  }, [search, posFilter, stateFilter, hostFilter, page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Browse Programs</h1>
        <p className="mt-2 text-gray-600">Find the perfect summer ball program</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by program or league name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          />
        </div>
        <div className="w-36">
          <Select
            value={posFilter}
            onChange={(e) => { setPosFilter(e.target.value); setPage(0) }}
            options={POSITIONS.map((p) => ({ value: p, label: p }))}
            placeholder="Position"
          />
        </div>
        <div className="w-32">
          <Select
            value={stateFilter}
            onChange={(e) => { setStateFilter(e.target.value); setPage(0) }}
            options={US_STATES.map((s) => ({ value: s, label: s }))}
            placeholder="State"
          />
        </div>
        <div className="w-40">
          <Select
            value={hostFilter}
            onChange={(e) => { setHostFilter(e.target.value); setPage(0) }}
            options={HOST_FAMILY_OPTIONS.map((h) => ({ value: h, label: h }))}
            placeholder="Host Family"
          />
        </div>
        {(search || posFilter || stateFilter || hostFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setPosFilter(''); setStateFilter(''); setHostFilter(''); setPage(0) }}>
            Clear filters
          </Button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} program{total !== 1 ? 's' : ''} found</p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          icon="🏟️"
          title="No programs found"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card key={program.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  {program.logo_url ? (
                    <img src={program.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover border flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-field-100 flex items-center justify-center text-field-700 font-bold text-lg flex-shrink-0">
                      {(program.program_name || '?')[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{program.program_name}</h3>
                    {program.league_name && <p className="text-sm text-gray-600 truncate">{program.league_name}</p>}
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  {(program.location_city || program.location_state) && (
                    <p>📍 {[program.location_city, program.location_state].filter(Boolean).join(', ')}</p>
                  )}
                  {program.league_fees !== null && program.league_fees !== undefined && (
                    <p>💰 ${Number(program.league_fees).toLocaleString()}</p>
                  )}
                  {program.travel_type && <p>🚗 {program.travel_type}</p>}
                  {program.host_family && <p>🏠 Host family: {program.host_family}</p>}
                  {program.roster_openings !== null && program.roster_openings !== undefined && (
                    <p>📋 {program.roster_openings} roster spot{program.roster_openings !== 1 ? 's' : ''} open</p>
                  )}
                </div>

                {(program.positions_needed || []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {program.positions_needed.map((pos) => (
                      <Badge key={pos} variant="outline">{pos}</Badge>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <Link
                    href={`/programs/${program.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    View Program →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
