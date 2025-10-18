import React from 'react'
import RoleGuard from '@/components/auth/RoleGuard'
import Sidebar from '@/components/dashboard/sidebar'
import Header from '@/components/dashboard/header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  )
}
