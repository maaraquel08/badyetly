"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
}

export function AuthGuard({
    children,
    requireAuth = true,
    redirectTo = "/login",
}: AuthGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return; // Wait for auth state to be determined

        if (requireAuth && !user) {
            router.push(redirectTo);
            return;
        }

        if (!requireAuth && user) {
            router.push("/dashboard");
            return;
        }
    }, [user, loading, requireAuth, redirectTo, router]);

    // Show loading while auth state is being determined
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children if we need to redirect
    if (requireAuth && !user) return null;
    if (!requireAuth && user) return null;

    return <>{children}</>;
}
