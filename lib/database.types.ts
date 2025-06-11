export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    name?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            monthly_dues: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    amount: number;
                    category: string;
                    notes: string | null;
                    due_day: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    amount: number;
                    category: string;
                    notes?: string | null;
                    due_day: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    amount?: number;
                    category?: string;
                    notes?: string | null;
                    due_day?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            due_instances: {
                Row: {
                    id: string;
                    monthly_due_id: string;
                    due_date: string;
                    is_paid: boolean | null;
                    paid_on: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    monthly_due_id: string;
                    due_date: string;
                    is_paid?: boolean | null;
                    paid_on?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    monthly_due_id?: string;
                    due_date?: string;
                    is_paid?: boolean | null;
                    paid_on?: string | null;
                    created_at?: string;
                };
            };
        };
    };
}
