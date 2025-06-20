import { Button } from "@/components/ui/button";

interface FormActionsProps {
    isSubmitting: boolean;
    isEditing: boolean;
    onCancel: () => void;
}

export function FormActions({
    isSubmitting,
    isEditing,
    onCancel,
}: FormActionsProps) {
    return (
        <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                    ? "Saving..."
                    : isEditing
                    ? "Update Due"
                    : "Create Due"}
            </Button>
        </div>
    );
}
