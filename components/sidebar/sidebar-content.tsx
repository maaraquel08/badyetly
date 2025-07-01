"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Button } from "@/components/ui/button";
import { ChevronRight, LogOut } from "lucide-react";
import { useSidebar } from "@/components/sidebar-provider";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { NavigationItem } from "./navigation-item";
import { UserSection } from "./user-section";
import { navigationRoutes } from "./navigation-config";
import { SidebarContentProps } from "./types";

// MCP-generated spring animation configuration
const springConfig = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
};

// Custom CSS spring from MCP motion-ai
const mcpSpringTransition =
    "550ms linear(0, 0.1654, 0.4677, 0.7368, 0.9162, 1.0096, 1.043, 1.0437, 0.9315, 1.0177, 1.0074, 1.0012, 0.9985, 1, 0.9982, 0.9989, 0.9995, 1)";

// Custom CSS bounce from MCP motion-ai
const mcpBounceTransition =
    "600ms linear(0, 0.0022, 0.0087, 0.0196, 0.0348, 0.0543, 0.0782, 0.1065, 0.139, 0.176, 0.2173, 0.2629, 0.3128, 0.3672, 0.4258, 0.4888, 0.5562, 0.6279, 0.7039, 0.7843, 0.869, 0.9581, 0.9752, 0.9332, 0.8954, 0.8621, 0.833, 0.8083, 0.788, 0.772, 0.7603, 0.753, 0.7501, 0.7515, 0.7572, 0.7673, 0.7817, 0.8004, 0.8235, 0.851, 0.8828, 0.9189, 0.9594, 0.9979, 0.9772, 0.9608, 0.9487, 0.941, 0.9377, 0.9386, 0.944, 0.9537, 0.9677, 0.986, 0.996, 0.9881, 0.9846, 0.9854, 0.9905, 1)";

export function SidebarContent({ forMobile = false }: SidebarContentProps) {
    const pathname = usePathname();
    const { isCompact, toggleSidebar } = useSidebar();
    const { signOut } = useAuth();
    const { toast } = useToast();

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

    return (
        <motion.div
            className="bg-[#f5f4f4] relative h-full w-full"
            initial={{ opacity: 0, x: forMobile ? -20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: forMobile ? -20 : 0 }}
            transition={springConfig}
        >
            <div className="flex flex-col items-center relative h-full">
                {/* Navigation Items - Match Figma exactly with Logo as topmost item */}
                <motion.div
                    className="flex flex-col gap-2 items-center justify-start px-3 py-10 w-full flex-1"
                    layout
                    transition={springConfig}
                >
                    {/* Logo Item - matches navigation item structure */}
                    <motion.div
                        className="relative rounded-xl h-[49px] w-full bg-[#f5f4f4]"
                        whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.2, ease: "easeOut" },
                        }}
                        whileTap={{ scale: 0.98 }}
                        layout
                    >
                        <Button
                            variant="ghost"
                            className="w-full h-full flex items-center justify-start relative bg-transparent hover:bg-transparent p-4"
                            asChild
                        >
                            <Link
                                href="/dashboard"
                                onClick={() => {}}
                                className="flex items-center justify-start w-full h-full gap-2"
                            >
                                <motion.div
                                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded"
                                    whileHover={{
                                        rotate: 360,
                                        scale: 1.2,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "easeInOut",
                                    }}
                                    style={{
                                        transition: `transform ${mcpBounceTransition}`,
                                    }}
                                >
                                    <img
                                        src="/logo.svg"
                                        alt="Badyetly"
                                        className="h-6 w-6"
                                    />
                                </motion.div>
                                <AnimatePresence mode="wait">
                                    {(!isCompact || forMobile) && (
                                        <motion.div
                                            className="flex-1 font-bold text-[16px] text-black text-left"
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{
                                                opacity: 1,
                                                width: "auto",
                                                transition: {
                                                    opacity: { delay: 0.1 },
                                                    width: {
                                                        duration: 0.3,
                                                        ease: "easeOut",
                                                    },
                                                },
                                            }}
                                            exit={{
                                                opacity: 0,
                                                width: 0,
                                                transition: {
                                                    width: { duration: 0.2 },
                                                    opacity: { duration: 0.1 },
                                                },
                                            }}
                                            style={{
                                                transition: `width ${mcpSpringTransition}, opacity 0.2s ease`,
                                            }}
                                        >
                                            Badyetly
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Navigation Routes */}
                    <LayoutGroup>
                        <AnimatePresence>
                            {navigationRoutes.map((route, index) => {
                                const isActive = pathname === route.href;
                                return (
                                    <motion.div
                                        key={route.href}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                delay: index * 0.05,
                                                ...springConfig,
                                            },
                                        }}
                                        exit={{ opacity: 0, y: -20 }}
                                        whileHover={{
                                            scale: 1.02,
                                            transition: {
                                                duration: 0.2,
                                                ease: "easeOut",
                                            },
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full"
                                    >
                                        <NavigationItem
                                            route={route}
                                            isActive={isActive}
                                            isCompact={isCompact}
                                            forMobile={forMobile}
                                            onMobileMenuClose={() => {}}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </LayoutGroup>

                    {/* Sign Out Button - styled like navigation items */}
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            transition: {
                                delay: navigationRoutes.length * 0.05,
                                ...springConfig,
                            },
                        }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{
                            scale: 1.02,
                            transition: {
                                duration: 0.2,
                                ease: "easeOut",
                            },
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                    >
                        <div className="relative rounded-xl h-[52px] w-full bg-[#f5f4f4]">
                            <Button
                                variant="ghost"
                                className="w-full h-full flex items-center justify-start relative bg-transparent hover:bg-transparent p-4"
                                onClick={handleSignOut}
                                title={
                                    isCompact && !forMobile
                                        ? "Sign out"
                                        : undefined
                                }
                            >
                                <div className="shrink-0 w-5 h-5 flex items-center justify-center rounded">
                                    <LogOut className="h-4 w-4 text-black" />
                                </div>
                                {(!isCompact || forMobile) && (
                                    <div className="flex-1 font-medium text-[14px] text-black text-left">
                                        Sign out
                                    </div>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>

                {/* User Section - at bottom */}
                <UserSection isCompact={isCompact} forMobile={forMobile} />

                {/* Toggle button for desktop only */}
                {!forMobile && (
                    <AnimatePresence>
                        <motion.div
                            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileTap={{ scale: 0.9 }}
                            transition={springConfig}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 rounded-full bg-white border shadow-sm hover:bg-gray-50"
                                onClick={toggleSidebar}
                            >
                                <motion.div
                                    animate={{ rotate: isCompact ? 0 : 180 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <ChevronRight className="h-3 w-3" />
                                </motion.div>
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}
