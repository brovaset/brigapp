'use client'

import { useState, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import Logo from '@/components/Logo'

interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

function NavItem({
  href,
  label,
  icon,
  activeColor = 'car-neon',
}: {
  href: string
  label: string
  icon: React.ReactNode
  activeColor?: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
  const { setIsOpen } = useSidebar() || {}

  return (
    <Link
      href={href}
      onClick={() => setIsOpen?.(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? `bg-${activeColor}/10 text-${activeColor}`
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
      style={
        isActive
          ? {
              backgroundColor: activeColor === 'car-neon' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(52, 199, 89, 0.1)',
              color: activeColor === 'car-neon' ? '#007aff' : '#34c759',
            }
          : undefined
      }
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </p>
      <nav className="space-y-1">{children}</nav>
    </div>
  )
}

const icons = {
  search: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  saved: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  dashboard: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  host: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  help: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  safety: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  accessibility: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  list: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  earnings: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  resources: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  about: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  terms: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  privacy: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  cookies: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
}

function SidebarContent() {
  const { user } = useAuth()
  const canHost = user?.role === 'HOST' || user?.role === 'BOTH'

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200/80">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo size="sm" showText={true} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <NavSection title="Main">
          <NavItem href="/search" label="Search" icon={icons.search} />
          <NavItem href="/saved" label="Saved" icon={icons.saved} />
          <NavItem href="/dashboard" label="Bookings" icon={icons.dashboard} />
        </NavSection>

        {canHost && (
          <NavSection title="Hosting">
            <NavItem href="/host/listings" label="My Listings" icon={icons.host} activeColor="car-electric" />
            <NavItem href="/host/listings/new" label="List Your Space" icon={icons.list} activeColor="car-electric" />
            <NavItem href="/host/earnings" label="Earnings" icon={icons.earnings} activeColor="car-electric" />
            <NavItem href="/host/resources" label="Resources" icon={icons.resources} activeColor="car-electric" />
          </NavSection>
        )}

        <NavSection title="Support">
          <NavItem href="/help" label="Help Center" icon={icons.help} />
          <NavItem href="/safety" label="Safety" icon={icons.safety} />
          <NavItem href="/accessibility" label="Accessibility" icon={icons.accessibility} />
        </NavSection>

        <NavSection title="Company">
          <NavItem href="/about" label="About" icon={icons.about} />
        </NavSection>

        <NavSection title="Legal">
          <NavItem href="/terms" label="Terms" icon={icons.terms} />
          <NavItem href="/privacy" label="Privacy" icon={icons.privacy} />
          <NavItem href="/cookies" label="Cookies" icon={icons.cookies} />
        </NavSection>
      </div>

      <div className="mt-auto p-3 border-t border-gray-200/80 space-y-1">
        <NavItem href="/profile" label="Profile" icon={icons.user} />
        <LogoutButton />
      </div>
    </div>
  )
}

function LogoutButton() {
  const router = useRouter()
  const { logout } = useAuth()
  const { setIsOpen } = useSidebar() || {}

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
    setIsOpen?.(false)
    router.push('/')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-car-speed transition-all"
    >
      {icons.logout}
      <span>Logout</span>
    </button>
  )
}

export default function Sidebar() {
  const sidebarState = useSidebar()
  const { user } = useAuth()
  const pathname = usePathname()

  const hideOnPages = ['/login', '/register']
  const showSidebar = user && !hideOnPages.includes(pathname)

  if (!showSidebar || !sidebarState) return null

  const { isOpen, setIsOpen } = sidebarState

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 flex-col bg-white/95 backdrop-blur-xl border-r border-gray-200/80 shadow-sm z-40"
        aria-label="Main navigation"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Logo size="sm" showText={true} />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function SidebarToggle() {
  const sidebar = useSidebar()
  const { user } = useAuth()
  const pathname = usePathname()
  const hideOnPages = ['/login', '/register']
  const showToggle = user && !hideOnPages.includes(pathname)

  if (!sidebar || !showToggle) return null

  const { setIsOpen, isOpen } = sidebar

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  )
}
