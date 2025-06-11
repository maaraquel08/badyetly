"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DuesTable } from "@/components/dues-table"
import { useSupabase } from "@/components/supabase-provider"
import { useAuth } from "@/components/auth-provider"

export default function DuesPage() {
  const [dues, setDues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { supabase } = useSupabase()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDues()
    }
  }, [user])

  const fetchDues = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("monthly_dues")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching dues:", error)
        setError(error.message)
        return
      }

      setDues(data || [])
    } catch (error) {
      console.error("Error:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader heading="Monthly Dues" text="Manage your recurring monthly payments.">
        <Link href="/dashboard/dues/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Due
          </Button>
        </Link>
      </DashboardHeader>

      {error ? (
        <div className="flex items-center justify-center h-64 flex-col">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={fetchDues}>Try Again</Button>
        </div>
      ) : (
        <DuesTable dues={dues} isLoading={isLoading} />
      )}
    </div>
  )
}
