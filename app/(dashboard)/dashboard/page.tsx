"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCalendar } from "@/components/dashboard-calendar"
import { AnalyticsCards } from "@/components/analytics-cards"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { useAuth } from "@/components/auth-provider"

export default function DashboardPage() {
  const [dueInstances, setDueInstances] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { supabase } = useSupabase()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDueInstances()
    }
  }, [user])

  const fetchDueInstances = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const { data: dueInstancesData, error } = await supabase
        .from("due_instances")
        .select(`
          *,
          monthly_dues!inner (
            id,
            title,
            amount,
            category,
            notes,
            user_id
          )
        `)
        .eq("monthly_dues.user_id", user.id)
        .order("due_date", { ascending: true })

      if (error) {
        console.error("Error fetching due instances:", error)
        setError(error.message)
        return
      }

      setDueInstances(dueInstancesData || [])
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
        <p className="text-muted-foreground">Loading user...</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader heading="Dashboard" text="Loading your monthly dues...">
          <Link href="/dashboard/dues/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Due
            </Button>
          </Link>
        </DashboardHeader>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardHeader heading="Dashboard" text="There was an error loading your dues.">
          <Link href="/dashboard/dues/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Due
            </Button>
          </Link>
        </DashboardHeader>
        <div className="flex items-center justify-center h-64 flex-col">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={fetchDueInstances}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader heading="Dashboard" text="View your monthly dues and financial insights.">
        <Link href="/dashboard/dues/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Due
          </Button>
        </Link>
      </DashboardHeader>

      <AnalyticsCards dueInstances={dueInstances} />

      <DashboardCalendar dueInstances={dueInstances} onRefresh={fetchDueInstances} />
    </div>
  )
}
