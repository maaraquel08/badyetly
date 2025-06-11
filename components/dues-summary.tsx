import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CalendarCheck, Clock } from "lucide-react"

interface DuesSummaryProps {
  dueToday: number
  upcoming: number
  overdue: number
}

export function DuesSummary({ dueToday, upcoming, overdue }: DuesSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dueToday}</div>
          <p className="text-xs text-muted-foreground">{dueToday === 1 ? "payment" : "payments"} due today</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          <CalendarCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcoming}</div>
          <p className="text-xs text-muted-foreground">{upcoming === 1 ? "payment" : "payments"} upcoming this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overdue}</div>
          <p className="text-xs text-muted-foreground">{overdue === 1 ? "payment" : "payments"} overdue</p>
        </CardContent>
      </Card>
    </div>
  )
}
