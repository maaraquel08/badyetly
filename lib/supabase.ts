import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Use the environment variables that are available in the project
export const createClient = () => {
  // Check if we're in the browser
  if (typeof window !== "undefined") {
    return createClientComponentClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }

  // Fallback for server-side
  return createClientComponentClient({
    supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
        }
      }
      monthly_dues: {
        Row: {
          id: string
          user_id: string | null
          title: string
          amount: number
          category: string
          start_date: string
          recurrence: string
          due_day: number | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          amount: number
          category: string
          start_date: string
          recurrence?: string
          due_day?: number | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          amount?: number
          category?: string
          start_date?: string
          recurrence?: string
          due_day?: number | null
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      due_instances: {
        Row: {
          id: string
          monthly_due_id: string | null
          due_date: string
          is_paid: boolean | null
          paid_on: string | null
          created_at: string
        }
        Insert: {
          id?: string
          monthly_due_id?: string | null
          due_date: string
          is_paid?: boolean | null
          paid_on?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          monthly_due_id?: string | null
          due_date?: string
          is_paid?: boolean | null
          paid_on?: string | null
          created_at?: string
        }
      }
    }
  }
}
