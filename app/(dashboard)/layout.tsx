"use client";

import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { SidebarProvider, useSidebar } from "@/components/sidebar-provider";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard requireAuth={true}>
            <SidebarProvider>
                <DashboardContent>{children}</DashboardContent>
            </SidebarProvider>
        </AuthGuard>
    );
}

// Separate client component to use the sidebar context
function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCompact } = useSidebar();

    return (
        <div className="min-h-screen">
            <Sidebar />
            <main
                className={cn(
                    "min-h-screen overflow-y-auto pt-16 md:pt-0 transition-all duration-200",
                    isCompact ? "md:ml-20" : "md:ml-64"
                )}
            >
                <div className="max-w-7xl mx-auto p-4 md:p-6">{children}</div>
            </main>
        </div>
    );
}
