"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
    isCompact: boolean;
    setIsCompact: (compact: boolean) => void;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCompact, setIsCompact] = useState(true);

    const toggleSidebar = () => {
        setIsCompact(!isCompact);
    };

    return (
        <SidebarContext.Provider
            value={{ isCompact, setIsCompact, toggleSidebar }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
