import type React from "react"
import { Sidebar } from "@/components/sidebar"
import SupabaseProvider from "@/components/supabase-provider"
import { AuthGuard } from "@/components/auth-guard"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true}>
      <SupabaseProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </SupabaseProvider>
    </AuthGuard>
  )
}
