import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarCheck, CreditCard, Bell } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarCheck className="h-6 w-6" />
            <span>Monthly Dues</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Never Miss a Payment Again
                </h1>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Track all your recurring bills in one place. Get reminders, see upcoming payments, and stay on top of
                  your finances.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                      Log in
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <div className="overflow-hidden rounded-xl border bg-background shadow-lg">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">This Month's Dues</h3>
                        <span className="text-sm text-muted-foreground">June 2025</span>
                      </div>
                      <div className="mt-6 space-y-4">
                        {[
                          {
                            name: "Electricity Bill",
                            amount: "$85.00",
                            date: "June 15",
                            status: "Due Today",
                            category: "Utilities",
                          },
                          {
                            name: "Netflix",
                            amount: "$14.99",
                            date: "June 20",
                            status: "Upcoming",
                            category: "Subscription",
                          },
                          { name: "Car Loan", amount: "$350.00", date: "June 5", status: "Overdue", category: "Loan" },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.category} • {item.date}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{item.amount}</div>
                              <div
                                className={`text-sm ${
                                  item.status === "Overdue"
                                    ? "text-red-500"
                                    : item.status === "Due Today"
                                      ? "text-amber-500"
                                      : "text-green-500"
                                }`}
                              >
                                {item.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Calendar View</h3>
                <p className="text-muted-foreground">
                  See all your bills in a monthly calendar layout. Never miss a due date again.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Smart Reminders</h3>
                <p className="text-muted-foreground">
                  Get notified before bills are due. Customize when and how you receive reminders.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">One-Click Payment</h3>
                <p className="text-muted-foreground">
                  Mark bills as paid with a single click. Keep track of your payment history.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarCheck className="h-5 w-5" />
            <span>Monthly Dues</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 Monthly Dues Tracker. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
