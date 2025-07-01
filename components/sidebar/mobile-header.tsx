"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { MobileHeaderProps } from "./types";
import { SidebarContent } from "./sidebar-content";

export function MobileHeader({
    isMobileMenuOpen,
    onMobileMenuToggle,
}: MobileHeaderProps) {
    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <img
                        src="/logo.svg"
                        alt="Badyetly"
                        className="h-8 w-8 mr-2"
                    />
                    <span className="font-bold text-xl">Badyetly</span>
                </Link>

                <Sheet
                    open={isMobileMenuOpen}
                    onOpenChange={onMobileMenuToggle}
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
                        <SidebarContent
                            forMobile={true}
                            onMobileMenuClose={() => onMobileMenuToggle(false)}
                        />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
