export interface DueFormData {
    title: string;
    amount: string;
    category: string;
    start_date: Date;
    recurrence: string;
    recurrence_frequency: string;
    due_day: string;
    status: string;
    notes: string;
    end_type: string;
    end_date: Date;
    occurrences: string;
}

export interface DueFormProps {
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    initialData?: any;
    isEditing?: boolean;
}
