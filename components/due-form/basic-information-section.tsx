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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar, Info } from "lucide-react";
import { cn, supportsVaryingAmount } from "@/lib/utils";
import { format } from "date-fns";

interface BasicInformationSectionProps {
    formData: {
        title: string;
        amount: string;
        category: string;
        start_date: Date;
    };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectChange: (name: string, value: string) => void;
    onDateChange: (name: string, date: Date | undefined) => void;
}

export function BasicInformationSection({
    formData,
    onInputChange,
    onSelectChange,
    onDateChange,
}: BasicInformationSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Basic Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title">Bill Name</Label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="e.g., Electricity Bill, Netflix Subscription"
                        value={formData.title}
                        onChange={onInputChange}
                        required
                    />
                </div>

                <div className="flex flex-col gap-4">
                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) =>
                                onSelectChange("category", value)
                            }
                        >
                            <SelectTrigger id="category" className="w-full">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="utilities">
                                    🔌 Utilities
                                </SelectItem>
                                <SelectItem value="loan">💰 Loan</SelectItem>
                                <SelectItem value="cards">
                                    💳 Credit Cards
                                </SelectItem>
                                <SelectItem value="savings">
                                    💾 Savings
                                </SelectItem>
                                <SelectItem value="investment">
                                    📈 Investment
                                </SelectItem>
                                <SelectItem value="subscription">
                                    📺 Subscription
                                </SelectItem>
                                <SelectItem value="phone">📱 Phone</SelectItem>
                                <SelectItem value="internet">
                                    🌐 Internet
                                </SelectItem>
                                <SelectItem value="insurance">
                                    🛡️ Insurance
                                </SelectItem>
                                <SelectItem value="other">📋 Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">
                            Amount (PHP)
                            {supportsVaryingAmount(formData.category) && (
                                <span className="text-muted-foreground text-xs font-normal">
                                    {" "}(optional - amount varies)
                                </span>
                            )}
                        </Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder={
                                supportsVaryingAmount(formData.category)
                                    ? "Amount varies each month"
                                    : "e.g., 1500.00"
                            }
                            value={formData.amount}
                            onChange={onInputChange}
                        />
                        {supportsVaryingAmount(formData.category) && (
                            <p className="text-xs text-muted-foreground">
                                You can leave this empty and enter the actual
                                amount when you mark it as paid.
                            </p>
                        )}
                    </div>
                </div>

                {/* First Due Date */}
                <div className="space-y-2">
                    <Label htmlFor="start_date">First Due Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.start_date &&
                                        "text-muted-foreground"
                                )}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                {formData.start_date ? (
                                    format(formData.start_date, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto p-0 overflow-hidden"
                            align="start"
                        >
                            <CalendarComponent
                                mode="single"
                                selected={formData.start_date}
                                onSelect={(date) =>
                                    onDateChange("start_date", date)
                                }
                                captionLayout="dropdown"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardContent>
        </Card>
    );
}
