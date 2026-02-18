import Link from 'next/link'
import Image from 'next/image'
import { Listing } from '@/types/database'
import { getCategoryLabel, getCategoryIcon, formatPrice } from '@/lib/constants'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/listings/${listing.id}`} className="card group transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-gray-300">
            {getCategoryIcon(listing.category)}
          </div>
        )}
        {listing.status !== 'active' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold capitalize text-gray-900">
              {listing.status}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-xs">{getCategoryIcon(listing.category)}</span>
          <span className="text-xs font-medium text-gray-500">
            {getCategoryLabel(listing.category)}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">
          {listing.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{listing.description}</p>
        <p className="mt-2 text-lg font-bold text-brand-700">{formatPrice(listing.price)}</p>
      </div>
    </Link>
  )
}
