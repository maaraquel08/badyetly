export interface DueInstance {
    id: string;
    due_date: string;
    is_paid: boolean;
    paid_on?: string;
    monthly_dues: {
        id: string;
        title: string;
        amount: number;
        category: string;
        recurrence: string;
        recurrence_frequency: number;
        notes?: string;
        end_type?: string;
        end_date?: string;
        occurrences?: number;
    };
}

export interface DashboardCalendarProps {
    dueInstances: DueInstance[];
    onRefresh?: () => void;
}

export interface CalendarCellProps {
    day: number;
    dues: DueInstance[];
    isToday: boolean;
    year: number;
    month: number;
    onCellClick: (day: number) => void;
    onBillClick: (due: DueInstance, event: React.MouseEvent) => void;
    onMarkAsPaid: (dueId: string, event: React.MouseEvent) => void;
    processing: Record<string, boolean>;
}

export interface MobileCalendarCellProps {
    date: Date;
    dues: DueInstance[];
    isToday: boolean;
    onCellClick: (date: Date) => void;
    onBillClick: (due: DueInstance, event: React.MouseEvent) => void;
    onMarkAsPaid: (dueId: string, event: React.MouseEvent) => void;
    processing: Record<string, boolean>;
}
