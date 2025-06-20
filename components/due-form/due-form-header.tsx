import type React from "react";

interface DueFormHeaderProps {
    heading: string;
    text?: string;
    children?: React.ReactNode;
}

export function DueFormHeader({ heading, text, children }: DueFormHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            {children}
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {heading}
                </h1>
                {text && (
                    <p className="text-sm text-muted-foreground">{text}</p>
                )}
            </div>
        </div>
    );
}
