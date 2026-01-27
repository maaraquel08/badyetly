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

                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-provider.tsx:35',message:'Initial session check',data:{hasSession:!!session,userId:session?.user?.id,error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion

                setUser(session?.user ?? null);
                setLoading(false);

                // Ensure profile exists for initial session
                if (session?.user) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-provider.tsx:45',message:'Initial session - calling handleUserProfile',data:{userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                    // #endregion
                    setTimeout(() => {
                        handleUserProfile(session.user);
                    }, 0);
                }
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
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-provider.tsx:58',message:'SIGNED_IN event detected',data:{userId:session.user.id,event},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-provider.tsx:70',message:'handleUserProfile called',data:{userId:user.id,email:user.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-provider.tsx:85',message:'Before upsert userData',data:{userData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            // Use upsert - if user exists (by id), update; otherwise insert
            // First try to find existing user by id
            const { data: existingUser } = await supabase
                .from("users")
                .select("id")
                .eq("id", user.id)
                .maybeSingle();
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-provider.tsx:88',message:'Checking existing user before upsert',data:{userId:user.id,existingUser:!!existingUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            let error, data;
            if (existingUser) {
                // Update existing user
                const result = await supabase
                    .from("users")
                    .update({ email: userData.email, name: userData.name })
                    .eq("id", user.id)
                    .select();
                error = result.error;
                data = result.data;
            } else {
                // Insert new user
                const result = await supabase
                    .from("users")
                    .insert(userData)
                    .select();
                error = result.error;
                data = result.data;
            }
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-provider.tsx:86',message:'After upsert result',data:{error:error?{message:error.message,code:error.code,details:error.details}:null,data:data?.[0]?.id||null,success:!error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/cd661417-c9be-401a-bf82-ea8f660b1f19',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-provider.tsx:87',message:'handleUserProfile catch error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
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
            // Always use window.location.origin in client-side code
            // This ensures the redirect URL matches the actual URL the user is on
            // (localhost:3000 in development, production URL in production)
            const origin = window.location.origin;
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
