import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Listing } from '@/types/database'
import { getCategoryLabel, getCategoryIcon, formatPrice } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'
import ContactSellerButton from './ContactSellerButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const supabase = createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, seller:profiles(*)')
    .eq('id', params.id)
    .single()

  if (!listing) {
    notFound()
  }

  const typedListing = listing as unknown as Listing

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/listings"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to listings
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 relative">
          {typedListing.image_url ? (
            <Image
              src={typedListing.image_url}
              alt={typedListing.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl text-gray-300">
              {getCategoryIcon(typedListing.category)}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{getCategoryIcon(typedListing.category)}</span>
            <span className="text-sm font-medium text-gray-500">
              {getCategoryLabel(typedListing.category)}
            </span>
            {typedListing.status !== 'active' && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-600">
                {typedListing.status}
              </span>
            )}
          </div>

          <h1 className="mt-2 font-display text-2xl font-bold text-gray-900 sm:text-3xl">
            {typedListing.title}
          </h1>

          <p className="mt-4 text-3xl font-bold text-brand-700">
            {formatPrice(typedListing.price)}
          </p>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-900">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-gray-600">
              {typedListing.description}
            </p>
          </div>

          {typedListing.seller && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="text-sm font-semibold text-gray-900">Seller</h2>
              <p className="mt-1 text-gray-600">
                {typedListing.seller.full_name ?? typedListing.seller.email}
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-400">
              Listed {new Date(typedListing.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {typedListing.status === 'active' && (
            <div className="mt-6">
              <ContactSellerButton listing={typedListing} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
