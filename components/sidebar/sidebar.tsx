"use client";

import { useState } from "react";
import { MobileHeader } from "./mobile-header";
import { SidebarContent } from "./sidebar-content";

export function Sidebar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Mobile Header with Hamburger Menu */}
            <MobileHeader
                isMobileMenuOpen={isMobileMenuOpen}
                onMobileMenuToggle={setIsMobileMenuOpen}
            />

            {/* Desktop Sidebar */}
            <div className="h-full w-full">
                <SidebarContent forMobile={false} />
            </div>
        </>
    );
}
