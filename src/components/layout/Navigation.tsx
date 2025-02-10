"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Wallet } from "lucide-react";
import { CurrencySelector } from "@/components/features/currency/CurrencySelector";

export function Navigation() {
    const pathname = usePathname();

    const links = [
        {
            name: "Dashboard",
            href: "/",
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
            name: "Accounts",
            href: "/accounts",
            icon: <Wallet className="h-4 w-4" />,
        },
    ];

    return (
        <div className="flex justify-between items-center">
            <nav className="flex space-x-2 lg:space-x-6">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                            pathname === link.href
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        {link.icon}
                        <span>{link.name}</span>
                    </Link>
                ))}
            </nav>
            <CurrencySelector />
        </div>
    );
}
