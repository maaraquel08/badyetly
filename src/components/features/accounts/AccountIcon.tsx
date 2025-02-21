import { Account } from "@/types";
import {
    Building2,
    CreditCard,
    Wallet,
    TrendingUp,
    PiggyBank,
    Smartphone,
    Bitcoin,
} from "lucide-react";

type AccountIconProps = {
    type: Account["type"];
    className?: string;
};

export function AccountIcon({ type, className = "h-5 w-5" }: AccountIconProps) {
    switch (type) {
        case "cash":
            return <Wallet className={className} />;
        case "bank":
            return <Building2 className={className} />;
        case "credit-card":
            return <CreditCard className={className} />;
        case "investment":
            return <TrendingUp className={className} />;
        case "savings":
            return <PiggyBank className={className} />;
        case "digital-wallet":
            return <Smartphone className={className} />;
        case "crypto":
            return <Bitcoin className={className} />;
    }
}
