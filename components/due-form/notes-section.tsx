import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NotesSectionProps {
    notes: string;
    onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function NotesSection({ notes, onInputChange }: NotesSectionProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                        id="notes"
                        name="notes"
                        placeholder="e.g., Pay via GCash, Account number: 123456"
                        value={notes ?? ""}
                        onChange={onInputChange}
                        rows={3}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
