'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Listing, Message } from '@/types/database'
import { formatPrice, getCategoryIcon } from '@/lib/constants'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'listings' | 'messages'>('listings')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const [listingsRes, messagesRes] = await Promise.all([
        supabase
          .from('listings')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('messages')
          .select('*, sender:profiles!messages_sender_id_fkey(*), listing:listings(*)')
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      setListings((listingsRes.data as Listing[]) ?? [])
      setMessages((messagesRes.data as Message[]) ?? [])
      setLoading(false)
    }

    load()
  }, [router])

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update listing.')
      return
    }

    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: status as Listing['status'] } : l))
    )
    toast.success('Listing updated!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    const supabase = createClient()
    const { error } = await supabase.from('listings').delete().eq('id', id)

    if (error) {
      toast.error('Failed to delete listing.')
      return
    }

    setListings((prev) => prev.filter((l) => l.id !== id))
    toast.success('Listing deleted.')
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/listings/new" className="btn-primary">
          + New Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setTab('listings')}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
            tab === 'listings'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Listings ({listings.length})
        </button>
        <button
          onClick={() => setTab('messages')}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
            tab === 'messages'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Messages ({messages.length})
        </button>
      </div>

      {/* Listings tab */}
      {tab === 'listings' && (
        <div className="mt-6">
          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">You haven&apos;t created any listings yet.</p>
              <Link href="/listings/new" className="btn-primary mt-4 inline-block">
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                      {getCategoryIcon(listing.category)}
                    </div>
                    <div>
                      <Link
                        href={`/listings/${listing.id}`}
                        className="font-semibold text-gray-900 hover:text-brand-600"
                      >
                        {listing.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {formatPrice(listing.price)} ·{' '}
                        <span className="capitalize">{listing.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:flex-shrink-0">
                    {listing.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(listing.id, 'sold')}
                        className="btn-secondary text-xs"
                      >
                        Mark Sold
                      </button>
                    )}
                    {listing.status === 'sold' && (
                      <button
                        onClick={() => handleStatusChange(listing.id, 'active')}
                        className="btn-secondary text-xs"
                      >
                        Re-list
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="btn-danger text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages tab */}
      {tab === 'messages' && (
        <div className="mt-6">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">No messages yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`card p-4 ${!msg.read ? 'ring-2 ring-brand-200' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        From: {msg.sender?.full_name ?? msg.sender?.email ?? 'Unknown'}
                      </p>
                      {msg.listing && (
                        <Link
                          href={`/listings/${msg.listing_id}`}
                          className="text-xs text-brand-600 hover:underline"
                        >
                          Re: {msg.listing.title}
                        </Link>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{msg.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
