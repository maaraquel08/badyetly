"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"

interface DuesListProps {
  title: string
  dues: any[]
  emptyMessage: string
  variant: "default" | "warning" | "destructive"
}

export function DuesList({ title, dues, emptyMessage, variant }: DuesListProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [processing, setProcessing] = useState<Record<string, boolean>>({})
  const [currency, setCurrency] = useState("PHP")

  // Load user currency preference
  useEffect(() => {
    const userCurrency = localStorage.getItem("userCurrency")
    if (userCurrency) {
      setCurrency(userCurrency)
    }
  }, [])

  const handleMarkAsPaid = async (dueId: string) => {
    setProcessing((prev) => ({ ...prev, [dueId]: true }))

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Marked as paid",
        description: "The payment has been marked as paid.",
      })
      setProcessing((prev) => ({ ...prev, [dueId]: false }))
      router.refresh()
    }, 1000)
  }

  const getCardVariant = () => {
    switch (variant) {
      case "warning":
        return "border-amber-200 dark:border-amber-800"
      case "destructive":
        return "border-red-200 dark:border-red-800"
      default:
        return ""
    }
  }

  return (
    <Card className={getCardVariant()}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dues.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          dues.map((due) => (
            <div key={due.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <div className="font-medium">{due.monthly_dues.title}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(due.due_date)} • {due.monthly_dues.category}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right font-medium">{formatCurrency(due.monthly_dues.amount, currency)}</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => handleMarkAsPaid(due.id)}
                  disabled={processing[due.id]}
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Mark as paid</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
