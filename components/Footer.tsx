'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50/90 border-t border-gray-200/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wider text-gray-500">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-car-neon text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-600 hover:text-car-neon text-sm transition-colors">
                  Safety
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-gray-600 hover:text-car-neon text-sm transition-colors">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wider text-gray-500">Hosting</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/host/listings/new" className="text-gray-600 hover:text-car-electric text-sm transition-colors">
                  List Your Space
                </Link>
              </li>
              <li>
                <Link href="/host/earnings" className="text-gray-600 hover:text-car-electric text-sm transition-colors">
                  Earnings
                </Link>
              </li>
              <li>
                <Link href="/host/resources" className="text-gray-600 hover:text-car-electric text-sm transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wider text-gray-500">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-car-neon text-sm transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wider text-gray-500">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-gray-500 text-sm">© 2026 BRIGAP. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-gray-500 hover:text-car-neon text-sm transition-colors">Terms</Link>
            <Link href="/privacy" className="text-gray-500 hover:text-car-neon text-sm transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

