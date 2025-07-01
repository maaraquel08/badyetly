import { LucideIcon } from "lucide-react";

export interface NavigationRoute {
    href: string;
    icon: LucideIcon;
    label: string;
    external?: boolean;
}

export interface UserProfile {
    name: string | null;
}

export interface SidebarContentProps {
    forMobile?: boolean;
}

export interface NavigationItemProps {
    route: NavigationRoute;
    isActive: boolean;
    isCompact: boolean;
    forMobile: boolean;
    onMobileMenuClose: () => void;
}

export interface UserSectionProps {
    isCompact: boolean;
    forMobile: boolean;
}

export interface MobileHeaderProps {
    isMobileMenuOpen: boolean;
    onMobileMenuToggle: (open: boolean) => void;
}
