import { createBrowserClient } from "@supabase/ssr";
import type { Database as DatabaseType } from "./database.types";

// Single instance supabase client
let supabaseClient: ReturnType<
    typeof createBrowserClient<DatabaseType>
> | null = null;

export const createClient = () => {
    if (!supabaseClient) {
        supabaseClient = createBrowserClient<DatabaseType>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }
    return supabaseClient;
};

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    monthly_salary: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name?: string | null;
                    monthly_salary?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    monthly_salary?: number | null;
                    created_at?: string;
                };
            };
            monthly_dues: {
                Row: {
                    id: string;
                    user_id: string | null;
                    title: string;
                    amount: number | null;
                    category: string;
                    start_date: string;
                    recurrence: string;
                    due_day: number | null;
                    status: string;
                    notes: string | null;
                    created_at: string;
                    end_date: string | null;
                    end_after_occurrences: number | null;
                    custom_frequency: number | null;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    title: string;
                    amount: number | null;
                    category: string;
                    start_date: string;
                    recurrence?: string;
                    due_day?: number | null;
                    status?: string;
                    notes?: string | null;
                    created_at?: string;
                    end_date?: string | null;
                    end_after_occurrences?: number | null;
                    custom_frequency?: number | null;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    title?: string;
                    amount?: number | null;
                    category?: string;
                    start_date?: string;
                    recurrence?: string;
                    due_day?: number | null;
                    status?: string;
                    notes?: string | null;
                    created_at?: string;
                    end_date?: string | null;
                    end_after_occurrences?: number | null;
                    custom_frequency?: number | null;
                };
            };
            due_instances: {
                Row: {
                    id: string;
                    monthly_due_id: string | null;
                    due_date: string;
                    is_paid: boolean | null;
                    paid_on: string | null;
                    paid_amount: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    monthly_due_id?: string | null;
                    due_date: string;
                    is_paid?: boolean | null;
                    paid_on?: string | null;
                    paid_amount?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    monthly_due_id?: string | null;
                    due_date?: string;
                    is_paid?: boolean | null;
                    paid_on?: string | null;
                    paid_amount?: number | null;
                    created_at?: string;
                };
            };
        };
    };
};
