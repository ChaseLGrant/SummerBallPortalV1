import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-display font-bold text-white text-lg flex items-center gap-2">
              <span className="text-xl">⚾</span> Summer Ball Portal
            </p>
            <p className="mt-2 text-sm">Find the right summer ball fit — fast.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Quick Links</p>
            <div className="space-y-1 text-sm">
              <Link href="/players" className="block hover:text-white transition-colors">Browse Players</Link>
              <Link href="/programs" className="block hover:text-white transition-colors">Browse Programs</Link>
              <Link href="/auth/signup" className="block hover:text-white transition-colors">Create Account</Link>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">For</p>
            <div className="space-y-1 text-sm">
              <p>Players seeking summer opportunities</p>
              <p>Summer ball programs seeking players</p>
              <p>College coaches placing players</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} Summer Ball Portal. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
