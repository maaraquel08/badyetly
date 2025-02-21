import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AccountsProvider } from "@/contexts/AccountsContext";

export const metadata: Metadata = {
    title: "Financial Tracker",
    description: "Track your income and expenses",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${GeistSans.variable} ${GeistMono.variable}`}
        >
            <body className="min-h-screen font-sans antialiased">
                <CurrencyProvider>
                    <AccountsProvider>
                        <header className="border-b">
                            <div className="container mx-auto p-4">
                                <Navigation />
                            </div>
                        </header>
                        <main>{children}</main>
                    </AccountsProvider>
                </CurrencyProvider>
            </body>
        </html>
    );
}
