'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const hideOnPages = ['/login', '/register']
  const showSidebar = user && !hideOnPages.includes(pathname)

  return (
    <main
      className={`pt-16 flex-1 min-h-screen transition-all duration-300 ${
        showSidebar ? 'lg:pl-64' : ''
      }`}
    >
      {children}
    </main>
  )
}
