"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

type AuthContext = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updateProfile: (data: { name?: string }) => Promise<{ error?: any }>
}

const Context = createContext<AuthContext | undefined>(undefined)

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const initialized = useRef(false)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("Getting initial session...")
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        }

        if (mounted) {
          setUser(session?.user ?? null)
          console.log("Session user:", session?.user ? "Authenticated" : "Not authenticated")
          setLoading(false)
          initialized.current = true
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Only get initial session if not already initialized
    if (!initialized.current) {
      getInitialSession()
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user ? "User present" : "No user")

      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }

      if (event === "SIGNED_IN" && session?.user) {
        // Create user profile if it doesn't exist
        try {
          const { error } = await supabase.from("users").upsert({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || null,
          })

          if (error) {
            console.error("Error creating user profile:", error)
          }
        } catch (error) {
          console.error("Unexpected error creating user profile:", error)
        }
      }
    })

    // Handle page visibility changes to refresh session
    const handleVisibilityChange = async () => {
      if (!document.hidden && initialized.current) {
        console.log("Page became visible, refreshing session...")
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            console.error("Error refreshing session:", error)
          }

          if (mounted) {
            setUser(session?.user ?? null)
            console.log("Session refreshed:", session?.user ? "Authenticated" : "Not authenticated")
          }
        } catch (error) {
          console.error("Error refreshing session on visibility change:", error)
        }
      }
    }

    // Handle storage changes (for cross-tab session sync)
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === "supabase.auth.token" && initialized.current) {
        console.log("Auth token changed in another tab, refreshing session...")
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            console.error("Error refreshing session from storage change:", error)
          }

          if (mounted) {
            setUser(session?.user ?? null)
            console.log("Session synced from storage:", session?.user ? "Authenticated" : "Not authenticated")
          }
        } catch (error) {
          console.error("Error refreshing session on storage change:", error)
        }
      }
    }

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleVisibilityChange)

    return () => {
      mounted = false
      subscription.unsubscribe()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleVisibilityChange)
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      return { error }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const updateProfile = async (data: { name?: string }) => {
    if (!user) return { error: new Error("No user") }

    try {
      const { error } = await supabase.from("users").update(data).eq("id", user.id)
      return { error }
    } catch (error) {
      console.error("Update profile error:", error)
      return { error }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useAuth = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}
