import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Summer Ball Portal. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/listings" className="text-sm text-gray-500 hover:text-gray-700">
              Browse Listings
            </Link>
            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
