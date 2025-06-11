"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, DollarSign, PieChart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface AnalyticsCardsProps {
  dueInstances: any[]
}

export function AnalyticsCards({ dueInstances }: AnalyticsCardsProps) {
  const [currency, setCurrency] = useState("PHP")

  // Load user currency preference
  useEffect(() => {
    const userCurrency = localStorage.getItem("userCurrency")
    if (userCurrency) {
      setCurrency(userCurrency)
    }
  }, [])

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Calculate analytics
  const analytics = {
    totalMonthlyAmount: dueInstances
      .filter((due) => {
        const dueDate = new Date(due.due_date)
        return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear
      })
      .reduce((sum, due) => sum + due.monthly_dues.amount, 0),

    paidAmount: dueInstances
      .filter((due) => {
        const dueDate = new Date(due.due_date)
        return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear && due.is_paid
      })
      .reduce((sum, due) => sum + due.monthly_dues.amount, 0),

    overdueCount: dueInstances.filter((due) => {
      const dueDate = new Date(due.due_date)
      return dueDate < today && !due.is_paid
    }).length,

    overdueAmount: dueInstances
      .filter((due) => {
        const dueDate = new Date(due.due_date)
        return dueDate < today && !due.is_paid
      })
      .reduce((sum, due) => sum + due.monthly_dues.amount, 0),

    upcomingThisWeek: dueInstances.filter((due) => {
      const dueDate = new Date(due.due_date)
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return dueDate >= today && dueDate <= weekFromNow && !due.is_paid
    }).length,

    categoryBreakdown: dueInstances
      .filter((due) => {
        const dueDate = new Date(due.due_date)
        return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear
      })
      .reduce(
        (acc, due) => {
          const category = due.monthly_dues.category
          acc[category] = (acc[category] || 0) + due.monthly_dues.amount
          return acc
        },
        {} as Record<string, number>,
      ),
  }

  const paymentRate = analytics.totalMonthlyAmount > 0 ? (analytics.paidAmount / analytics.totalMonthlyAmount) * 100 : 0

  const remainingAmount = analytics.totalMonthlyAmount - analytics.paidAmount

  const topCategory = Object.entries(analytics.categoryBreakdown).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Monthly Bills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total This Month</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(analytics.totalMonthlyAmount, currency)}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(analytics.paidAmount, currency)} paid • {formatCurrency(remainingAmount, currency)}{" "}
            remaining
          </p>
        </CardContent>
      </Card>

      {/* Payment Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paymentRate.toFixed(1)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(paymentRate, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {dueInstances.filter((due) => due.is_paid).length} of {dueInstances.length} bills paid
          </p>
        </CardContent>
      </Card>

      {/* Overdue Bills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Bills</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{analytics.overdueCount}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(analytics.overdueAmount, currency)} total overdue
          </p>
        </CardContent>
      </Card>

      {/* Upcoming This Week */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{analytics.upcomingThisWeek}</div>
          <p className="text-xs text-muted-foreground">Bills due in the next 7 days</p>
        </CardContent>
      </Card>

      {/* Top Category */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Category</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{topCategory ? topCategory[0] : "No data"}</div>
          <p className="text-xs text-muted-foreground">
            {topCategory ? formatCurrency(topCategory[1], currency) : "Add bills to see insights"}
          </p>
        </CardContent>
      </Card>

      {/* Average Bill Amount */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Bill Amount</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dueInstances.length > 0
              ? formatCurrency(analytics.totalMonthlyAmount / dueInstances.length, currency)
              : formatCurrency(0, currency)}
          </div>
          <p className="text-xs text-muted-foreground">Based on {dueInstances.length} active bills</p>
        </CardContent>
      </Card>
    </div>
  )
}
