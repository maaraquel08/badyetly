import { Account } from "@/types";
import { Building2, CreditCard, Wallet } from "lucide-react";

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
    }
}
