"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { UserSectionProps, UserProfile } from "./types";

export function UserSection({ isCompact, forMobile }: UserSectionProps) {
    const { user, profileRefreshTrigger } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const supabase = createClient();

    // Fetch user profile from database
    useEffect(() => {
        if (user) {
            const fetchUserProfile = async () => {
                const { data, error } = await supabase
                    .from("users")
                    .select("name")
                    .eq("id", user.id)
                    .single();

                if (!error && data) {
                    setUserProfile(data);
                }
            };

            fetchUserProfile();
        }
    }, [user, supabase, profileRefreshTrigger]);

    const getUserInitials = (name: string | null, email: string) => {
        if (name) {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return email.slice(0, 2).toUpperCase();
    };

    const getUserDisplayName = (name: string | null, email: string) => {
        return name || email.split("@")[0];
    };

    const getUserFullName = () => {
        if (!user) return null;

        // Priority: Database name > Auth metadata name
        if (userProfile?.name) {
            return userProfile.name;
        }

        // Fallback to auth metadata if database name isn't available yet
        const possibleNames = [
            user.user_metadata?.name,
            user.user_metadata?.full_name,
            user.user_metadata?.given_name && user.user_metadata?.family_name
                ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}`.trim()
                : null,
            user.user_metadata?.given_name,
            user.user_metadata?.family_name,
        ].filter(Boolean);

        return possibleNames.length > 0 ? possibleNames[0] : null;
    };

    const getUserAvatar = () => {
        if (!user?.email) return null;

        // Use the original URLs as provided by Google OAuth
        const googlePicture = user.user_metadata?.picture;
        const avatarUrl = user.user_metadata?.avatar_url;

        // Return Google OAuth picture if available
        if (googlePicture) {
            return googlePicture;
        }

        // Return avatar URL if available
        if (avatarUrl) {
            return avatarUrl;
        }

        return null;
    };

    if (!user) return null;

    const showText = !isCompact || forMobile;

    return (
        <div className="p-4 w-full">
            {/* User info section */}
            <div
                className={`flex items-center h-8 ${
                    isCompact && !forMobile ? "" : "space-x-3"
                }`}
            >
                <Avatar className="h-8 w-8">
                    {getUserAvatar() ? (
                        <img
                            src={getUserAvatar()}
                            alt={getUserDisplayName(
                                getUserFullName(),
                                user.email!
                            )}
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials(getUserFullName(), user.email!)}
                        </AvatarFallback>
                    )}
                </Avatar>
                {showText && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {getUserDisplayName(getUserFullName(), user.email!)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
