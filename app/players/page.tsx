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
import { POSITIONS, CLASS_YEARS } from '@/types'
import type { PlayerProfile } from '@/types'

const PAGE_SIZE = 12

export default function PlayersPage() {
  const supabase = createClient()
  const [players, setPlayers] = useState<PlayerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [travelFilter, setTravelFilter] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let query = supabase
        .from('player_profiles')
        .select('*', { count: 'exact' })
        .order('full_name')

      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search.trim()}%,school.ilike.%${search.trim()}%`)
      }
      if (posFilter) {
        query = query.contains('positions', [posFilter])
      }
      if (yearFilter) {
        query = query.eq('class_year', yearFilter)
      }
      if (travelFilter) {
        query = query.eq('open_to_travel', true)
      }

      const from = page * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)

      const { data, count } = await query
      setPlayers((data || []) as PlayerProfile[])
      setTotal(count || 0)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, posFilter, yearFilter, travelFilter, page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Browse Players</h1>
        <p className="mt-2 text-gray-600">Find players for your summer program</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name or school..."
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
        <div className="w-40">
          <Select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(0) }}
            options={CLASS_YEARS.map((y) => ({ value: y, label: y }))}
            placeholder="Class Year"
          />
        </div>
        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
          <input
            type="checkbox"
            checked={travelFilter}
            onChange={(e) => { setTravelFilter(e.target.checked); setPage(0) }}
            className="rounded border-gray-300 text-brand-600"
          />
          <span className="text-gray-700">Open to travel</span>
        </label>
        {(search || posFilter || yearFilter || travelFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setPosFilter(''); setYearFilter(''); setTravelFilter(false); setPage(0) }}>
            Clear filters
          </Button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} player{total !== 1 ? 's' : ''} found</p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : players.length === 0 ? (
        <EmptyState
          icon="⚾"
          title="No players found"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <Card key={player.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {player.headshot_url ? (
                    <img src={player.headshot_url} alt="" className="w-14 h-14 rounded-full object-cover border flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg flex-shrink-0">
                      {(player.full_name || '?')[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{player.full_name || 'Unnamed Player'}</h3>
                    {player.school && <p className="text-sm text-gray-600 truncate">{player.school}</p>}
                    {player.class_year && <p className="text-xs text-gray-500">{player.class_year}</p>}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(player.positions || []).map((pos) => (
                    <Badge key={pos}>{pos}</Badge>
                  ))}
                </div>

                <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                  {player.height && <span>{player.height}</span>}
                  {player.weight && <span> · {player.weight} lbs</span>}
                  {player.bats && <span> · B: {player.bats}</span>}
                  {player.throws && <span> · T: {player.throws}</span>}
                </div>

                {player.open_to_travel && (
                  <Badge variant="success" className="mt-2">✈️ Open to travel</Badge>
                )}

                <div className="mt-4">
                  <Link
                    href={`/players/${player.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    View Profile →
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
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
