import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Repeat } from "lucide-react";
import { format, isValid } from "date-fns";

interface RecurrenceSectionProps {
    formData: {
        recurrence: string;
        recurrence_frequency: string;
        due_day: string;
        start_date: Date;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    getRecurrenceText: () => string;
    getNextDueDates: () => Date[];
    safeCreateDate: (dateValue: string | Date) => Date;
}

export function RecurrenceSection({
    formData,
    onInputChange,
    onSelectChange,
    getRecurrenceText,
    getNextDueDates,
    safeCreateDate,
}: RecurrenceSectionProps) {
    const showCustomFrequency = formData.recurrence !== "biweekly";
    const showDueDay =
        formData.recurrence === "monthly" ||
        formData.recurrence === "quarterly";

    // Safe format function
    const safeFormat = (date: Date, formatString: string) => {
        try {
            if (!date || !isValid(date)) return "Invalid date";
            return format(date, formatString);
        } catch {
            return "Invalid date";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Repeat className="h-5 w-5" />
                    Recurrence Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 border-0 [boxSizing:content-box]">
                {/* Basic Recurrence */}
                <div className="space-y-2">
                    <Label htmlFor="recurrence">
                        How often does this bill repeat?
                    </Label>
                    <Select
                        value={formData.recurrence}
                        onValueChange={(value) =>
                            onSelectChange("recurrence", value)
                        }
                    >
                        <SelectTrigger id="recurrence">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="weekly">📅 Weekly</SelectItem>
                            <SelectItem value="biweekly">
                                📅 Every 2 weeks
                            </SelectItem>
                            <SelectItem value="monthly">📅 Monthly</SelectItem>
                            <SelectItem value="quarterly">
                                📅 Every 3 months
                            </SelectItem>
                            <SelectItem value="annually">📅 Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Custom Frequency - Progressive Disclosure */}
                {showCustomFrequency && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <Label htmlFor="recurrence_frequency">
                            Custom frequency (optional)
                        </Label>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                                Every
                            </span>
                            <Input
                                id="recurrence_frequency"
                                name="recurrence_frequency"
                                type="number"
                                min="1"
                                max="99"
                                className="w-20"
                                value={formData.recurrence_frequency}
                                onChange={onInputChange}
                            />
                            <span className="text-sm text-muted-foreground">
                                {formData.recurrence === "weekly"
                                    ? Number.parseInt(
                                          formData.recurrence_frequency || "1"
                                      ) === 1
                                        ? "week"
                                        : "weeks"
                                    : formData.recurrence === "monthly"
                                    ? Number.parseInt(
                                          formData.recurrence_frequency || "1"
                                      ) === 1
                                        ? "month"
                                        : "months"
                                    : formData.recurrence === "quarterly"
                                    ? Number.parseInt(
                                          formData.recurrence_frequency || "1"
                                      ) === 1
                                        ? "quarter"
                                        : "quarters"
                                    : Number.parseInt(
                                          formData.recurrence_frequency || "1"
                                      ) === 1
                                    ? "year"
                                    : "years"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Due Day - Progressive Disclosure */}
                {showDueDay && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <Label htmlFor="due_day">
                            Specific day of the month (optional)
                        </Label>
                        <Input
                            id="due_day"
                            name="due_day"
                            type="number"
                            min="1"
                            max="31"
                            placeholder="e.g., 15 for the 15th of each month"
                            value={formData.due_day}
                            onChange={onInputChange}
                            className="w-full md:w-48"
                        />
                        <p className="text-xs text-muted-foreground">
                            Leave blank to use the day from your first due date
                            ({safeCreateDate(formData.start_date).getDate()})
                        </p>
                    </div>
                )}

                {/* Recurrence Preview */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            Recurrence Preview
                        </span>
                    </div>
                    <div className="space-y-2">
                        <Badge variant="outline" className="text-sm">
                            {getRecurrenceText()}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                            <p className="font-medium mb-1">
                                Next 3 due dates:
                            </p>
                            <div className="space-y-1">
                                {getNextDueDates().map((date, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {safeFormat(date, "MMMM d, yyyy")}
                                        </span>
                                    </div>
                                ))}
                                {getNextDueDates().length === 0 && (
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            Unable to calculate dates - please
                                            check your settings
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
