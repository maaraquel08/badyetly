import { Home, CreditCard, Settings, MessageSquare } from "lucide-react";
import { NavigationRoute } from "./types";

export const navigationRoutes: NavigationRoute[] = [
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
