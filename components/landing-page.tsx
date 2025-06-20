import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    CalendarCheck,
    CreditCard,
    Bell,
    ArrowRight,
    CheckCircle,
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/30">
            <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                        <img
                            src="/logo.svg"
                            alt="Badyetly"
                            className="h-8 w-8"
                        />
                        <span className="text-xl font-bold">Badyetly</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="rounded-full">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="rounded-full">Sign up</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 md:py-28">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                            <div className="space-y-6">
                                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary mb-2">
                                    Never miss a payment again
                                </div>
                                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                                    Track Your Monthly Dues{" "}
                                    <span className="text-primary">
                                        Effortlessly
                                    </span>
                                </h1>
                                <p className="text-muted-foreground text-lg md:text-xl max-w-[600px]">
                                    Stay on top of your finances with our simple
                                    bill tracking system. Get reminders,
                                    visualize upcoming payments, and take
                                    control.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link href="/signup">
                                        <Button
                                            size="lg"
                                            className="rounded-full px-8"
                                        >
                                            Get Started{" "}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link href="/login">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="rounded-full px-8"
                                        >
                                            Log in
                                        </Button>
                                    </Link>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pt-4">
                                    {[
                                        "Free to start",
                                        "No credit card required",
                                        "Cancel anytime",
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4 text-primary" />
                                            <span className="text-sm text-muted-foreground">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 to-primary/40 opacity-70 blur-xl"></div>
                                <div className="relative overflow-hidden rounded-xl border bg-background shadow-xl">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium flex items-center gap-2">
                                                <CalendarCheck className="h-5 w-5 text-primary" />
                                                This Month's Dues
                                            </h3>
                                            <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                                                June 2025
                                            </span>
                                        </div>
                                        <div className="mt-6 space-y-4">
                                            {[
                                                {
                                                    name: "Electricity Bill",
                                                    amount: "$85.00",
                                                    date: "June 15",
                                                    status: "Due Today",
                                                    category: "Utilities",
                                                    icon: "⚡️",
                                                },
                                                {
                                                    name: "Netflix",
                                                    amount: "$14.99",
                                                    date: "June 20",
                                                    status: "Upcoming",
                                                    category: "Subscription",
                                                    icon: "🎬",
                                                },
                                                {
                                                    name: "Car Loan",
                                                    amount: "$350.00",
                                                    date: "June 5",
                                                    status: "Overdue",
                                                    category: "Loan",
                                                    icon: "🚗",
                                                },
                                            ].map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
                                                            {item.icon}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">
                                                                {item.name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {item.category}{" "}
                                                                • {item.date}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            {item.amount}
                                                        </div>
                                                        <div
                                                            className={`text-sm font-medium px-2 py-0.5 rounded-full inline-block ${
                                                                item.status ===
                                                                "Overdue"
                                                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                                    : item.status ===
                                                                      "Due Today"
                                                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
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
                </section>

                {/* Features Section */}
                <section className="w-full py-20 bg-muted/50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                Simple Features,{" "}
                                <span className="text-primary">
                                    Powerful Results
                                </span>
                            </h2>
                            <p className="mt-4 text-muted-foreground text-lg max-w-[700px] mx-auto">
                                Everything you need to stay on top of your bills
                                and payments, without the complexity.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                            {[
                                {
                                    icon: <CalendarCheck className="h-6 w-6" />,
                                    title: "Calendar View",
                                    description:
                                        "See all your bills in a monthly calendar layout. Never miss a due date again.",
                                },
                                {
                                    icon: <Bell className="h-6 w-6" />,
                                    title: "Smart Reminders",
                                    description:
                                        "Get notified before bills are due. Customize when and how you receive reminders.",
                                },
                                {
                                    icon: <CreditCard className="h-6 w-6" />,
                                    title: "One-Click Payment",
                                    description:
                                        "Mark bills as paid with a single click. Keep track of your payment history.",
                                },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground flex-1">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="rounded-2xl bg-primary/5 p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 z-0"></div>
                            <div className="relative z-10 max-w-2xl mx-auto text-center">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                                    Ready to take control of your finances?
                                </h2>
                                <p className="mt-4 text-muted-foreground text-lg mb-8">
                                    Join thousands of users who never miss a
                                    payment with Badyetly.
                                </p>
                                <Link href="/signup">
                                    <Button
                                        size="lg"
                                        className="rounded-full px-8"
                                    >
                                        Get Started for Free
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="w-full border-t py-8 bg-background">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center gap-2 font-semibold">
                        <img
                            src="/logo.svg"
                            alt="Badyetly"
                            className="h-6 w-6"
                        />
                        <span className="font-bold">Badyetly</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2025 Badyetly. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/privacy"
                            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        >
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
