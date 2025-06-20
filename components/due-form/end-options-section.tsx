import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface EndOptionsSectionProps {
    formData: {
        end_type: string;
        end_date: Date;
        occurrences: string;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onDateChange: (name: string, date: Date | undefined) => void;
}

export function EndOptionsSection({
    formData,
    onInputChange,
    onSelectChange,
    onDateChange,
}: EndOptionsSectionProps) {
    return (
        <div className="space-y-4">
            <Label className="text-base font-medium">
                When should this bill stop?
            </Label>

            <div className="space-y-3">
                {/* Never End */}
                <div
                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                        formData.end_type === "never"
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => onSelectChange("end_type", "never")}
                >
                    <input
                        type="radio"
                        id="end_never"
                        name="end_type"
                        value="never"
                        checked={formData.end_type === "never"}
                        onChange={onInputChange}
                        className="sr-only"
                    />
                    <div className="flex items-start space-x-3">
                        <div
                            className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5 ${
                                formData.end_type === "never"
                                    ? "border-black bg-black"
                                    : "border-gray-300"
                            }`}
                        >
                            {formData.end_type === "never" && (
                                <svg
                                    className="w-3 h-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                                Never (ongoing bill)
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                This bill will continue indefinitely
                            </p>
                        </div>
                    </div>
                </div>

                {/* End on Date */}
                <div
                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                        formData.end_type === "after_date"
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => onSelectChange("end_type", "after_date")}
                >
                    <input
                        type="radio"
                        id="end_after_date"
                        name="end_type"
                        value="after_date"
                        checked={formData.end_type === "after_date"}
                        onChange={onInputChange}
                        className="sr-only"
                    />
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <div
                                className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5 ${
                                    formData.end_type === "after_date"
                                        ? "border-black bg-black"
                                        : "border-gray-300"
                                }`}
                            >
                                {formData.end_type === "after_date" && (
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">
                                    End on a specific date
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Choose when this bill should stop
                                </p>
                            </div>
                        </div>
                        {formData.end_type === "after_date" && (
                            <div
                                className="ml-9 animate-in slide-in-from-top-2 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full max-w-[200px] justify-start text-left font-normal border-gray-300 focus:border-black focus:ring-black",
                                                !formData.end_date &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {formData.end_date ? (
                                                format(formData.end_date, "PPP")
                                            ) : (
                                                <span>Pick end date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0 overflow-hidden"
                                        align="start"
                                    >
                                        <CalendarComponent
                                            mode="single"
                                            selected={formData.end_date}
                                            onSelect={(date) =>
                                                onDateChange("end_date", date)
                                            }
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>
                </div>

                {/* End after Occurrences */}
                <div
                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                        formData.end_type === "after_occurrences"
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                        onSelectChange("end_type", "after_occurrences")
                    }
                >
                    <input
                        type="radio"
                        id="end_after_occurrences"
                        name="end_type"
                        value="after_occurrences"
                        checked={formData.end_type === "after_occurrences"}
                        onChange={onInputChange}
                        className="sr-only"
                    />
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <div
                                className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5 ${
                                    formData.end_type === "after_occurrences"
                                        ? "border-black bg-black"
                                        : "border-gray-300"
                                }`}
                            >
                                {formData.end_type === "after_occurrences" && (
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">
                                    End after a number of payments
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Set a specific number of payments
                                </p>
                            </div>
                        </div>
                        {formData.end_type === "after_occurrences" && (
                            <div
                                className="ml-9 animate-in slide-in-from-top-2 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        After
                                    </span>
                                    <Input
                                        id="occurrences"
                                        name="occurrences"
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={formData.occurrences}
                                        onChange={onInputChange}
                                        className="w-20 border-gray-300 focus:border-black focus:ring-black"
                                    />
                                    <span className="text-sm text-gray-600">
                                        payments
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
