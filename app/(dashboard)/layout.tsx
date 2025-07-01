"use client";

import type React from "react";
import { MobileHeader } from "@/components/sidebar/mobile-header";
import { SidebarContent } from "@/components/sidebar/sidebar-content";
import { AuthGuard } from "@/components/auth-guard";
import { SidebarProvider, useSidebar } from "@/components/sidebar-provider";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Mobile Header - Only visible on mobile */}
            <div className="md:hidden">
                <MobileHeader
                    isMobileMenuOpen={isMobileMenuOpen}
                    onMobileMenuToggle={setIsMobileMenuOpen}
                />
            </div>

            <div className="flex flex-row items-center justify-start p-0 min-h-screen">
                {/* Desktop Sidebar - Hidden on mobile */}
                <div
                    className={cn(
                        "bg-background-subtle h-screen relative shrink-0 transition-all duration-200 hidden md:block",
                        isCompact ? "w-20" : "w-60"
                    )}
                >
                    <SidebarContent forMobile={false} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-background-subtle h-screen min-w-0 relative overflow-y-auto md:pt-0 pt-16">
                    {/* Mobile Layout */}
                    <div className="md:hidden p-4 w-full">
                        <div className="bg-white min-h-0 relative rounded-3xl border-[1.5px] border-[#d9dfdd]">
                            <div className="p-4">{children}</div>
                        </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex flex-row justify-center">
                        <div className="flex flex-row gap-2 items-start justify-center pl-0 pr-6 pt-6 pb-6 w-full">
                            {/* White Container */}
                            <div className="flex-1 bg-white min-h-0 relative rounded-3xl border-[1.5px] border-[#d9dfdd]">
                                <div className="p-4 md:p-6">{children}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
