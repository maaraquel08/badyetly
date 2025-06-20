"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    CalendarIcon,
    CreditCard,
    Home,
    Settings,
    LogOut,
    Menu,
    X,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { useSidebar } from "@/components/sidebar-provider";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";

export function Sidebar() {
    const pathname = usePathname();
    const { toast } = useToast();
    const { user, signOut, profileRefreshTrigger } = useAuth();
    const [userProfile, setUserProfile] = useState<{
        name: string | null;
    } | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isCompact, toggleSidebar } = useSidebar();
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

    const routes = [
        {
            href: "/dashboard",
            icon: Home,
            label: "Dashboard",
        },
        {
            href: "/dashboard/dues",
            icon: CreditCard,
            label: "Monthly Dues",
        },
        {
            href: "/dashboard/settings",
            icon: Settings,
            label: "Settings",
        },
        {
            href: "https://forms.gle/hKDraWvYXY6bWcbN8",
            icon: MessageSquare,
            label: "Feedback",
            external: true,
        },
    ];

    const handleSignOut = async () => {
        try {
            await signOut();
            toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to sign out. Please try again.",
                variant: "destructive",
            });
        }
    };

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

    const SidebarContent = ({ forMobile = false }: { forMobile?: boolean }) => (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div
                className={cn(
                    "flex h-16 items-center border-b flex-shrink-0 relative",
                    isCompact && !forMobile ? "px-4 justify-center" : "px-4"
                )}
            >
                {!isCompact || forMobile ? (
                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <img
                            src="/logo.svg"
                            alt="Badyetly"
                            className="h-8 w-8 mr-2"
                        />
                        <span className="font-bold text-2xl">Badyetly</span>
                    </Link>
                ) : (
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center w-full"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <img
                            src="/logo.svg"
                            alt="Badyetly"
                            className="h-8 w-8"
                        />
                    </Link>
                )}

                {/* Toggle button for desktop only - positioned absolutely */}
                {!forMobile && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-background border shadow-sm hover:bg-muted z-10",
                            "transition-all duration-200"
                        )}
                        onClick={toggleSidebar}
                    >
                        {isCompact ? (
                            <ChevronRight className="h-3 w-3" />
                        ) : (
                            <ChevronLeft className="h-3 w-3" />
                        )}
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <div
                className={cn(
                    "flex-1 space-y-1 overflow-y-auto",
                    isCompact && !forMobile ? "p-4" : "p-4"
                )}
            >
                <nav className="grid gap-1">
                    {routes.map((route) => (
                        <Button
                            key={route.href}
                            variant={
                                pathname === route.href ? "secondary" : "ghost"
                            }
                            className={cn(
                                isCompact && !forMobile
                                    ? "justify-center w-full h-10"
                                    : "justify-start",
                                pathname === route.href
                                    ? "bg-muted font-medium"
                                    : "font-normal"
                            )}
                            asChild
                            title={
                                isCompact && !forMobile
                                    ? route.label
                                    : undefined
                            }
                        >
                            {route.external ? (
                                <a
                                    href={route.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <route.icon
                                        className={cn(
                                            "h-4 w-4",
                                            !isCompact || forMobile
                                                ? "mr-2"
                                                : ""
                                        )}
                                    />
                                    {(!isCompact || forMobile) && route.label}
                                </a>
                            ) : (
                                <Link
                                    href={route.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <route.icon
                                        className={cn(
                                            "h-4 w-4",
                                            !isCompact || forMobile
                                                ? "mr-2"
                                                : ""
                                        )}
                                    />
                                    {(!isCompact || forMobile) && route.label}
                                </Link>
                            )}
                        </Button>
                    ))}
                </nav>
            </div>

            {/* User section */}
            <div className="border-t p-4 flex-shrink-0">
                {isCompact && !forMobile ? (
                    /* Compact user section */
                    <div className="flex flex-col items-center space-y-3">
                        <Avatar className="h-8 w-8">
                            {getUserAvatar() ? (
                                <img
                                    src={getUserAvatar()}
                                    alt={
                                        user
                                            ? getUserDisplayName(
                                                  getUserFullName(),
                                                  user.email!
                                              )
                                            : "User"
                                    }
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {user
                                        ? getUserInitials(
                                              getUserFullName(),
                                              user.email!
                                          )
                                        : "U"}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-10 h-10"
                            onClick={handleSignOut}
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    /* Full user section */
                    <>
                        <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="h-8 w-8">
                                {getUserAvatar() ? (
                                    <img
                                        src={getUserAvatar()}
                                        alt={
                                            user
                                                ? getUserDisplayName(
                                                      getUserFullName(),
                                                      user.email!
                                                  )
                                                : "User"
                                        }
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {user
                                            ? getUserInitials(
                                                  getUserFullName(),
                                                  user.email!
                                              )
                                            : "U"}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {user
                                        ? getUserDisplayName(
                                              getUserFullName(),
                                              user.email!
                                          )
                                        : "User"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email}
                                    {user?.email?.endsWith("@gmail.com") && (
                                        <span className="ml-1 text-xs text-blue-500">
                                            (Gmail)
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={handleSignOut}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </Button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header with Hamburger Menu */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-2"
                    >
                        <img
                            src="/logo.svg"
                            alt="Badyetly"
                            className="h-8 w-8 mr-2"
                        />
                        <span className="font-bold text-xl">Badyetly</span>
                    </Link>

                    <Sheet
                        open={isMobileMenuOpen}
                        onOpenChange={setIsMobileMenuOpen}
                    >
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">
                                    Toggle navigation menu
                                </span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <SheetTitle className="sr-only">
                                Navigation Menu
                            </SheetTitle>
                            <SidebarContent forMobile={true} />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen border-r bg-muted/40 hidden md:block transition-all duration-200",
                    isCompact ? "w-20" : "w-64"
                )}
            >
                <SidebarContent forMobile={false} />
            </div>
        </>
    );
}
