"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: any }>;
    signInWithGoogle: () => Promise<{ error?: any }>;
    signUp: (
        email: string,
        password: string,
        name: string
    ) => Promise<{ error?: any }>;
    signOut: () => Promise<void>;
    updateProfile: (data: { name?: string }) => Promise<{ error?: any }>;
    refreshProfile: () => void;
    profileRefreshTrigger: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                setUser(session?.user ?? null);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            // These must be non-blocking to prevent deadlocks
            setUser(session?.user ?? null);
            setLoading(false);

            // Handle user profile creation on sign up - use setTimeout to make non-blocking
            if (event === "SIGNED_IN" && session?.user) {
                setTimeout(() => {
                    handleUserProfile(session.user);
                }, 0);
            }
        });

        return () => {
            subscription?.unsubscribe?.();
        };
    }, []);

    const handleUserProfile = async (user: User) => {
        try {
            // Prepare user data with enhanced Google OAuth metadata
            const userData = {
                id: user.id,
                email: user.email!,
                name:
                    user.user_metadata?.name ||
                    user.user_metadata?.full_name ||
                    (user.user_metadata?.given_name &&
                    user.user_metadata?.family_name
                        ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}`
                        : null),
            };

            const { error } = await supabase.from("users").upsert(userData);
        } catch (error) {
            // Handle error silently
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error };
        } catch (error) {
            return { error };
        }
    };

    const signInWithGoogle = async () => {
        try {
            // Get the current origin to ensure correct redirect URL
            // Use window.location.origin which automatically detects the correct URL
            // (localhost:3000 in development, production URL in production)
            // If NEXT_PUBLIC_SITE_URL is set, use it for production consistency
            const origin = 
                process.env.NEXT_PUBLIC_SITE_URL || 
                window.location.origin;
            const redirectUrl = `${origin}/auth/callback`;
            
            // Log for debugging
            console.log("OAuth redirect URL:", redirectUrl);
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: "offline",
                        prompt: "select_account",
                    },
                },
            });
            
            if (error) {
                console.error("OAuth sign-in error:", error);
            }
            
            return { error };
        } catch (error) {
            console.error("OAuth sign-in exception:", error);
            return { error: error as Error };
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name },
                },
            });
            return { error };
        } catch (error) {
            return { error };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
        } catch (error) {
            // Handle error silently
        }
    };

    const updateProfile = async (data: { name?: string }) => {
        if (!user) return { error: new Error("No user") };

        try {
            const { error } = await supabase
                .from("users")
                .update(data)
                .eq("id", user.id);

            return { error };
        } catch (error) {
            return { error };
        }
    };

    const refreshProfile = () => {
        setProfileRefreshTrigger((prev) => prev + 1);
    };

    const value: AuthContextType = {
        user,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
        profileRefreshTrigger,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
