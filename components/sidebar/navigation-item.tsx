"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavigationItemProps } from "./types";

export function NavigationItem({
    route,
    isActive,
    isCompact,
    forMobile,
    onMobileMenuClose,
}: NavigationItemProps) {
    return (
        <div
            className={cn(
                "relative rounded-xl h-[52px]",
                isCompact && !forMobile ? "w-[52px]" : "w-full",
                isActive ? "bg-[#d8fcd4]" : "bg-[#f5f4f4]"
            )}
        >
            {/* Active border - exactly as Figma */}
            {isActive && (
                <div className="absolute border border-[#019515] border-solid inset-0 pointer-events-none rounded-xl" />
            )}

            {/* Navigation Button */}
            <Button
                variant="ghost"
                className="w-full h-full flex items-center justify-start relative bg-transparent hover:bg-transparent p-4"
                asChild
                title={isCompact && !forMobile ? route.label : undefined}
            >
                {route.external ? (
                    <a
                        href={route.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onMobileMenuClose}
                        className="flex items-center justify-start w-full h-full gap-2"
                    >
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center rounded">
                            <route.icon className="h-4 w-4 text-black" />
                        </div>
                        {(!isCompact || forMobile) && (
                            <div className="flex-1 font-medium text-[14px] text-black text-left">
                                {route.label}
                            </div>
                        )}
                    </a>
                ) : (
                    <Link
                        href={route.href}
                        onClick={onMobileMenuClose}
                        className="flex items-center justify-start w-full h-full gap-2"
                    >
                        <div className="shrink-0 w-5 h-5 flex items-center justify-center rounded">
                            <route.icon className="h-4 w-4 text-black" />
                        </div>
                        {(!isCompact || forMobile) && (
                            <div className="flex-1 font-medium text-[14px] text-black text-left">
                                {route.label}
                            </div>
                        )}
                    </Link>
                )}
            </Button>
        </div>
    );
}
