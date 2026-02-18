import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 py-24 text-white sm:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Summer Ball Marketplace
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-brand-100">
            Buy, sell &amp; swap tickets, outfits, accommodation and more for your
            summer ball — all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/listings" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
              Browse Listings
            </Link>
            <Link href="/auth/signup" className="btn-secondary ring-white/30 text-white hover:bg-white/10">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-2xl font-bold text-gray-900 sm:text-3xl">
          Browse by Category
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/listings?category=${cat.value}`}
              className="card flex flex-col items-center gap-3 p-6 text-center transition-shadow hover:shadow-md"
            >
              <span className="text-4xl">{cat.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl font-bold text-gray-900 sm:text-3xl">
            How It Works
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Create an Account',
                desc: 'Sign up with your university email to get started.',
              },
              {
                step: '2',
                title: 'List or Browse',
                desc: 'Post items for sale or browse what others are offering.',
              },
              {
                step: '3',
                title: 'Connect & Trade',
                desc: 'Message sellers directly and arrange your trade securely.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                  {item.step}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-50 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Join fellow students and make your summer ball experience unforgettable.
          </p>
          <div className="mt-8">
            <Link href="/auth/signup" className="btn-primary">
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}