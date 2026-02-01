import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { SidebarProvider } from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import AppShell from '@/components/AppShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BRIGAP - Find Parking Fast',
  description: 'Rent driveways and find parking spots instantly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <AuthProvider>
            <SidebarProvider>
              <Navbar />
              <Sidebar />
              <AppShell>{children}</AppShell>
              <Footer />
            </SidebarProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}

