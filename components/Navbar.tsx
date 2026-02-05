'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '@/components/Logo'
import { SidebarToggle } from '@/components/Sidebar'

interface NavbarProps {
  transparent?: boolean
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
    router.push('/')
    setShowUserMenu(false)
  }

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !transparent
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-lg'
          : 'bg-white/90 backdrop-blur-xl border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center">
            <Logo size="sm" showText={true} className="flex-row gap-2" />
          </Link>

          {user ? (
            <>
              {/* Spacer - nav is in sidebar on desktop */}
              <div className="hidden lg:block flex-1" />

              {/* User Menu */}
              <div className="hidden md:flex items-center gap-4 relative">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 hover:border-car-neon hover:shadow-md transition-all bg-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-car-neon to-car-electric flex items-center justify-center text-white font-semibold shadow-sm">
                      {user.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {user.firstName && (
                      <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                        {user.firstName}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200/80 py-1.5 z-50"
                        >
                          <Link
                            href="/profile"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:text-car-neon hover:bg-car-neon/5 transition-colors rounded-lg mx-1"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Profile Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:text-car-speed hover:bg-car-speed/5 transition-colors rounded-lg mx-1"
                          >
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Mobile: Sidebar toggle */}
              <SidebarToggle />
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-car-neon transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-car-neon to-car-electric rounded-lg hover:from-car-neon/90 hover:to-car-electric/90 transition-all shadow-md font-semibold"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}

