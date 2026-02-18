'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Listing, ListingCategory } from '@/types/database'
import ListingCard from '@/components/ListingCard'
import CategoryFilter from '@/components/CategoryFilter'

function ListingsContent() {
  const searchParams = useSearchParams()
  const initialCategory = (searchParams.get('category') as ListingCategory) || 'all'

  const [listings, setListings] = useState<Listing[]>([])
  const [category, setCategory] = useState<ListingCategory | 'all'>(initialCategory)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      let query = supabase
        .from('listings')
        .select('*, seller:profiles(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`)
      }

      const { data } = await query
      setListings((data as Listing[]) ?? [])
      setLoading(false)
    }

    fetchListings()
  }, [category, search, supabase])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
          Browse Listings
        </h1>
        <input
          type="search"
          placeholder="Search listings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      <div className="mt-6">
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {loading ? (
        <div className="mt-12 text-center text-gray-500">Loading listings…</div>
      ) : listings.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-gray-900">No listings found</p>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading…</div>}>
      <ListingsContent />
    </Suspense>
  )
}
