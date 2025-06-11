import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard requireAuth={true}>
            <div className="min-h-screen">
                <Sidebar />
                <main className="md:ml-64 min-h-screen overflow-y-auto pt-16 md:pt-0">
                    <div className="p-4 md:p-6">{children}</div>
                </main>
            </div>
        </AuthGuard>
    );
}
