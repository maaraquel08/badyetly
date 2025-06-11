"use client"

import type React from "react"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Calendar, CreditCard, Tag, FileText, Clock, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"

interface BillDetailsSheetProps {
  bill: any
  isOpen: boolean
  onClose: () => void
  onMarkAsPaid: (dueId: string, event: React.MouseEvent) => void
  onMarkAsUnpaid?: (dueId: string, event: React.MouseEvent) => void
  currency: string
  processing: Record<string, boolean>
}

export function BillDetailsSheet({
  bill,
  isOpen,
  onClose,
  onMarkAsPaid,
  onMarkAsUnpaid,
  currency,
  processing,
}: BillDetailsSheetProps) {
  if (!bill) return null

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "utilities":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "loan":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "subscription":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "phone":
      case "internet":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusInfo = () => {
    const dueDate = new Date(bill.due_date)
    const today = new Date()

    if (bill.is_paid) {
      return {
        status: "Paid",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        icon: Check,
      }
    }

    if (dueDate < today) {
      return {
        status: "Overdue",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        icon: Clock,
      }
    }

    if (dueDate.toDateString() === today.toDateString()) {
      return {
        status: "Due Today",
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        icon: Clock,
      }
    }

    return {
      status: "Upcoming",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      icon: Calendar,
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {bill.monthly_dues.title}
          </SheetTitle>
          <SheetDescription>Bill details and payment information</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Amount and Status */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{formatCurrency(bill.monthly_dues.amount, currency)}</div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <StatusIcon className="h-4 w-4" />
                <Badge variant="outline" className={statusInfo.color}>
                  {statusInfo.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bill Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bill Information
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Category</span>
                <Badge variant="outline" className={getCategoryColor(bill.monthly_dues.category)}>
                  {bill.monthly_dues.category}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <span className="text-sm font-medium">{format(new Date(bill.due_date), "MMMM d, yyyy")}</span>
              </div>

              {bill.is_paid && bill.paid_on && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Paid On</span>
                  <span className="text-sm font-medium text-green-600">
                    {format(new Date(bill.paid_on), "MMMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Recurring Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recurring Details
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Frequency</span>
                <span className="text-sm font-medium capitalize">
                  {bill.monthly_dues.recurrence_frequency > 1
                    ? `Every ${bill.monthly_dues.recurrence_frequency} ${bill.monthly_dues.recurrence}`
                    : bill.monthly_dues.recurrence}
                </span>
              </div>

              {bill.monthly_dues.end_type === "after_date" && bill.monthly_dues.end_date && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ends On</span>
                  <span className="text-sm font-medium">
                    {format(new Date(bill.monthly_dues.end_date), "MMMM d, yyyy")}
                  </span>
                </div>
              )}

              {bill.monthly_dues.end_type === "after_occurrences" && bill.monthly_dues.occurrences && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Occurrences</span>
                  <span className="text-sm font-medium">{bill.monthly_dues.occurrences}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Next Due</span>
                <span className="text-sm font-medium">
                  {format(new Date(new Date(bill.due_date).getTime() + 30 * 24 * 60 * 60 * 1000), "MMMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {bill.monthly_dues.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Notes
                </h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{bill.monthly_dues.notes}</p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {!bill.is_paid ? (
              <Button className="w-full" onClick={(e) => onMarkAsPaid(bill.id, e)} disabled={processing[bill.id]}>
                {processing[bill.id] ? (
                  "Marking as Paid..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-full"
                variant="outline"
                onClick={(e) => onMarkAsUnpaid && onMarkAsUnpaid(bill.id, e)}
                disabled={processing[bill.id]}
              >
                {processing[bill.id] ? (
                  "Marking as Unpaid..."
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Mark as Unpaid
                  </>
                )}
              </Button>
            )}

            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
