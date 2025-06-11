"use server";

import { createClient } from "@supabase/supabase-js";

export async function deleteUserAccount(userId: string) {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
        }

        // Create admin client for user deletion
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // Delete user from auth system using admin client
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            console.error("Error deleting auth user:", error);
            throw new Error("Failed to delete user from auth system");
        }

        return { success: true };
    } catch (error) {
        console.error("Server action error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
