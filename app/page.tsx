import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
              Find the right summer ball fit&nbsp;— <span className="text-brand-200">fast.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-brand-100 max-w-2xl">
              The free marketplace connecting college baseball players with summer collegiate programs. Browse, filter, and connect in minutes.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/auth/signup?role=player"
                className="px-6 py-3 bg-white text-brand-700 font-semibold rounded-lg hover:bg-brand-50 transition-colors shadow-lg"
              >
                I&apos;m a Player
              </Link>
              <Link
                href="/auth/signup?role=coach"
                className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-400 transition-colors border border-brand-400"
              >
                I&apos;m a College Coach
              </Link>
              <Link
                href="/auth/signup?role=program"
                className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-400 transition-colors border border-brand-400"
              >
                I&apos;m a Summer Program
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-center font-display text-3xl font-bold text-gray-900">How It Works</h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto text-3xl">🎯</div>
            <h3 className="mt-4 font-semibold text-lg text-gray-900">Players</h3>
            <p className="mt-2 text-gray-600 text-sm">
              Create your profile with stats, video links, and availability. Get discovered by summer programs looking for your position.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-field-100 rounded-2xl flex items-center justify-center mx-auto text-3xl">🏟️</div>
            <h3 className="mt-4 font-semibold text-lg text-gray-900">Summer Programs</h3>
            <p className="mt-2 text-gray-600 text-sm">
              List your program details, roster needs, and fees. Browse the player database to find the right fit for your roster.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-sand-100 rounded-2xl flex items-center justify-center mx-auto text-3xl">📋</div>
            <h3 className="mt-4 font-semibold text-lg text-gray-900">College Coaches</h3>
            <p className="mt-2 text-gray-600 text-sm">
              Upload your roster in bulk or add players one-by-one. Help your players get placed with quality summer programs.
            </p>
          </div>
        </div>
      </section>

      {/* Stats placeholder */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-display text-3xl font-bold text-brand-700">500+</p>
              <p className="mt-1 text-sm text-gray-600">Players</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-brand-700">100+</p>
              <p className="mt-1 text-sm text-gray-600">Programs</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-brand-700">50+</p>
              <p className="mt-1 text-sm text-gray-600">Leagues</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-brand-700">Free</p>
              <p className="mt-1 text-sm text-gray-600">To Use</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-display text-3xl font-bold text-gray-900">Ready to get started?</h2>
        <p className="mt-4 text-gray-600 max-w-xl mx-auto">
          Join hundreds of players and programs already using Summer Ball Portal to find their perfect match.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
          >
            Create Free Account
          </Link>
          <Link
            href="/players"
            className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse Players
          </Link>
        </div>
      </section>
    </>
  )
}