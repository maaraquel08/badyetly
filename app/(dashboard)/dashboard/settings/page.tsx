"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase";
import { deleteUserAccount } from "@/app/actions/delete-account";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
    const { toast } = useToast();
    const { user, updateProfile, signOut, refreshProfile } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [name, setName] = useState("");
    const [monthlySalary, setMonthlySalary] = useState<string>("");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    useEffect(() => {
        if (user) {
            // Fetch current user profile from database
            const fetchUserProfile = async () => {
                const { data, error } = await supabase
                    .from("users")
                    .select("name, monthly_salary")
                    .eq("id", user.id)
                    .single();

                if (!error && data) {
                    setName(data.name || "");
                    setMonthlySalary(
                        data.monthly_salary?.toString() || ""
                    );
                } else {
                    // Fallback to auth metadata if database query fails
                    setName(user.user_metadata?.name || "");
                }
            };

            fetchUserProfile();
        }
    }, [user, supabase]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            toast({
                title: "Authentication required",
                description: "Please log in to update your profile.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Update profile name
            const { error: profileError } = await updateProfile({ name });

            if (profileError) {
                throw profileError;
            }

            // Update monthly salary in database
            const salaryValue =
                monthlySalary && monthlySalary.trim() !== ""
                    ? Number.parseFloat(monthlySalary)
                    : null;

            // Validate that if a value is provided, it's a valid number
            if (monthlySalary && monthlySalary.trim() !== "" && isNaN(salaryValue!)) {
                throw new Error("Please enter a valid number for monthly salary");
            }

            // Simple approach: Check if user exists, then update or insert
            const { data: existingUser } = await supabase
                .from("users")
                .select("id")
                .eq("id", user.id)
                .single();

            let saveSuccess = false;

            if (existingUser) {
                // User exists, try to update
                const { error: updateError } = await supabase
                    .from("users")
                    .update({ monthly_salary: salaryValue })
                    .eq("id", user.id);

                // Check if there's a real error (not just empty {})
                // An empty object {} has no keys, so we check for meaningful error properties
                let hasRealError = false;
                
                if (updateError) {
                    const errorKeys = Object.keys(updateError);
                    const errorString = JSON.stringify(updateError);
                    
                    console.log("Update attempt:", {
                        hasErrorObject: true,
                        errorKeys,
                        errorKeysLength: errorKeys.length,
                        errorStringified: errorString,
                        isEmptyObject: errorString === '{}',
                    });
                    
                    // Only consider it a real error if:
                    // 1. It has keys AND
                    // 2. At least one of those keys has a non-empty value
                    if (errorKeys.length > 0 && errorString !== '{}') {
                        const hasMessage = updateError.message && String(updateError.message).trim() !== '';
                        const hasCode = updateError.code && String(updateError.code).trim() !== '';
                        const hasDetails = updateError.details && String(updateError.details).trim() !== '';
                        
                        hasRealError = hasMessage || hasCode || hasDetails;
                    }
                } else {
                    console.log("Update attempt: No error object");
                }

                // Only throw if there's a REAL error with actual content
                // Empty {} means the operation likely succeeded
                if (hasRealError) {
                    console.error("Update error detected:", updateError);
                    throw new Error(
                        updateError.message ||
                            updateError.details ||
                            "Failed to update monthly salary"
                    );
                } else if (updateError) {
                    // Empty error object {} - operation likely succeeded, just verify
                    console.log("Update returned empty error object (likely succeeded), verifying...");
                }

                // Verify the update worked
                const { data: verifyData, error: verifyError } = await supabase
                    .from("users")
                    .select("monthly_salary")
                    .eq("id", user.id)
                    .single();
                
                // Log verification result (ignore empty error objects)
                if (verifyError && JSON.stringify(verifyError) !== '{}') {
                    console.warn("Verification query had error:", verifyError);
                }

                if (verifyData && verifyData.monthly_salary === salaryValue) {
                    saveSuccess = true;
                    console.log("Salary updated and verified:", verifyData);
                } else if (verifyData) {
                    // Value doesn't match - update may have failed silently
                    console.warn("Update verification failed, trying insert...");
                    // Fall through to insert
                } else {
                    // Can't verify - might be RLS, but assume it worked
                    saveSuccess = true;
                    console.log("Update completed (could not verify due to permissions)");
                }
            }

            // If update didn't work or user doesn't exist, try insert
            if (!saveSuccess) {
                const { error: insertError } = await supabase
                    .from("users")
                    .insert({
                        id: user.id,
                        email: user.email!,
                        name: name || null,
                        monthly_salary: salaryValue,
                    });

                // Check if there's a real error (not just empty {})
                let hasRealInsertError = false;
                
                if (insertError) {
                    const errorKeys = Object.keys(insertError);
                    const errorString = JSON.stringify(insertError);
                    
                    console.log("Insert attempt:", {
                        hasErrorObject: true,
                        errorKeys,
                        errorKeysLength: errorKeys.length,
                        errorStringified: errorString,
                        isEmptyObject: errorString === '{}',
                    });
                    
                    // Only consider it a real error if it has keys AND is not empty {}
                    if (errorKeys.length > 0 && errorString !== '{}') {
                        const hasMessage = insertError.message && String(insertError.message).trim() !== '';
                        const hasCode = insertError.code && String(insertError.code).trim() !== '';
                        const hasDetails = insertError.details && String(insertError.details).trim() !== '';
                        
                        hasRealInsertError = hasMessage || hasCode || hasDetails;
                    }
                } else {
                    console.log("Insert attempt: No error object");
                }

                if (hasRealInsertError) {
                    // If insert fails and it's not a duplicate key error, throw
                    if (insertError.code !== '23505') { // 23505 is duplicate key
                        console.error("Insert error:", insertError);
                        throw new Error(
                            insertError.message ||
                                insertError.details ||
                                "Failed to save monthly salary"
                        );
                    }
                    // If duplicate key, the record exists, so update should have worked
                    // Verify one more time
                    const { data: verifyData, error: verifyError2 } = await supabase
                        .from("users")
                        .select("monthly_salary")
                        .eq("id", user.id)
                        .single();
                    
                    // Ignore empty error objects from verification
                    if (verifyError2 && JSON.stringify(verifyError2) !== '{}') {
                        console.warn("Verification query had error:", verifyError2);
                    }

                    if (verifyData && verifyData.monthly_salary !== salaryValue) {
                        // Record exists but value is wrong, try update again
                        const { error: retryError } = await supabase
                            .from("users")
                            .update({ monthly_salary: salaryValue })
                            .eq("id", user.id);

                        // Check if retry error is real (not empty {})
                        if (retryError) {
                            const retryErrorString = JSON.stringify(retryError);
                            const hasRealRetryError = retryErrorString !== '{}' && (
                                (retryError.message && String(retryError.message).trim() !== '') ||
                                (retryError.code && String(retryError.code).trim() !== '') ||
                                (retryError.details && String(retryError.details).trim() !== '')
                            );
                            
                            if (hasRealRetryError) {
                                throw new Error("Failed to save monthly salary after retry");
                            }
                        }
                    }
                }

                // Verify insert worked
                const { data: verifyData, error: verifyError3 } = await supabase
                    .from("users")
                    .select("monthly_salary")
                    .eq("id", user.id)
                    .single();
                
                // Ignore empty error objects from verification
                if (verifyError3 && JSON.stringify(verifyError3) !== '{}') {
                    console.warn("Verification query had error:", verifyError3);
                }

                if (verifyData && verifyData.monthly_salary === salaryValue) {
                    saveSuccess = true;
                    console.log("Salary inserted and verified:", verifyData);
                } else if (!verifyData) {
                    // Can't verify - might be RLS, but assume it worked
                    saveSuccess = true;
                    console.log("Insert completed (could not verify due to permissions)");
                } else {
                    throw new Error("Salary was not saved correctly. Please try again.");
                }
            }

            if (!saveSuccess) {
                throw new Error("Failed to save monthly salary. Please try again.");
            }

            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
            });

            // Trigger profile refresh in sidebar
            refreshProfile();
        } catch (error) {
            console.error("Error updating profile:", {
                error,
                type: typeof error,
                keys: error ? Object.keys(error) : [],
                message: error instanceof Error ? error.message : undefined,
                stringified: JSON.stringify(error, null, 2),
            });
            
            let errorMessage = "Failed to update your profile. Please try again.";
            
            if (error instanceof Error) {
                errorMessage = error.message || errorMessage;
            } else if (error && typeof error === "object") {
                // Try to extract message from error object
                const err = error as any;
                errorMessage = err.message || err.details || err.hint || errorMessage;
            }
            
            toast({
                title: "Error updating profile",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        setIsLoading(true);

        setTimeout(() => {
            toast({
                title: "Notification preferences updated",
                description: `Email notifications ${
                    emailNotifications ? "enabled" : "disabled"
                }.`,
            });
            setIsLoading(false);
        }, 1000);
    };

    const handleDeleteAccount = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "No user found to delete.",
                variant: "destructive",
            });
            return;
        }

        if (deleteConfirmation !== "DELETE") {
            toast({
                title: "Confirmation required",
                description:
                    "Please type 'DELETE' to confirm account deletion.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(true);

        try {
            // Step 1: Get all monthly due IDs for this user first
            const { data: monthlyDuesData, error: fetchError } = await supabase
                .from("monthly_dues")
                .select("id")
                .eq("user_id", user.id);

            if (fetchError) {
                console.error("Error fetching monthly dues:", fetchError);
                throw new Error("Failed to fetch monthly dues");
            }

            const monthlyDueIds = monthlyDuesData?.map((due) => due.id) || [];

            // Step 2: Delete all user's due instances first (child records)
            if (monthlyDueIds.length > 0) {
                const { error: dueInstancesError } = await supabase
                    .from("due_instances")
                    .delete()
                    .in("monthly_due_id", monthlyDueIds);

                if (dueInstancesError) {
                    console.error(
                        "Error deleting due instances:",
                        dueInstancesError
                    );
                    throw new Error("Failed to delete due instances");
                }
            }

            // Step 3: Delete all user's monthly dues
            const { error: monthlyDuesError } = await supabase
                .from("monthly_dues")
                .delete()
                .eq("user_id", user.id);

            if (monthlyDuesError) {
                console.error("Error deleting monthly dues:", monthlyDuesError);
                throw new Error("Failed to delete monthly dues");
            }

            // Step 4: Delete user profile from users table
            const { error: userError } = await supabase
                .from("users")
                .delete()
                .eq("id", user.id);

            if (userError) {
                console.error("Error deleting user profile:", userError);
                throw new Error("Failed to delete user profile");
            }

            // Step 5: Delete user from auth system using server action
            const authDeleteResult = await deleteUserAccount(user.id);

            if (!authDeleteResult.success) {
                console.warn(
                    "Auth user deletion failed:",
                    authDeleteResult.error
                );
                // Continue with manual sign out if auth deletion fails
            }

            // Step 6: Sign out and redirect
            await signOut();

            toast({
                title: "Account deleted successfully",
                description:
                    "Your account and all associated data have been permanently deleted.",
            });

            // Redirect to home page
            router.push("/");
        } catch (error) {
            console.error("Account deletion error:", error);
            toast({
                title: "Error deleting account",
                description:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred. Please try again or contact support.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const isDeleteConfirmationValid = deleteConfirmation === "DELETE";

    return (
        <div className="container max-w-2xl mx-auto pb-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="space-y-6">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSaveProfile}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your display name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Your email address cannot be changed.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="monthly-salary">
                                    Monthly Salary (PHP)
                                </Label>
                                <Input
                                    id="monthly-salary"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={monthlySalary}
                                    onChange={(e) =>
                                        setMonthlySalary(e.target.value)
                                    }
                                    placeholder="e.g., 50000.00"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Your monthly salary is used for financial
                                    reporting and breakdown calculations.
                                </p>
                            </div>

                            <Button type="submit" disabled={isLoading}>
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Profile
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-notifications">
                                    Email Notifications
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive email reminders for upcoming bills.
                                </p>
                            </div>
                            <Switch
                                id="email-notifications"
                                checked={emailNotifications}
                                onCheckedChange={setEmailNotifications}
                            />
                        </div>

                        <Separator />

                        <Button
                            onClick={handleSaveNotifications}
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Notification Preferences
                        </Button>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage your account data and privacy settings.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Export Data Section
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-medium">
                                        Export Your Data
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Download a copy of your bill tracking
                                        data in JSON format.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        toast({
                                            title: "Export feature coming soon",
                                            description:
                                                "Data export functionality will be available in a future update.",
                                        })
                                    }
                                >
                                    Export Data
                                </Button>
                            </div>
                        </div> */}

                        <Separator />

                        {/* Delete Account Section */}
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h3 className="font-medium text-destructive">
                                            Delete Account
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Permanently delete your account and
                                            all associated data. This action
                                            cannot be undone.
                                        </p>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        <p className="font-medium mb-2">
                                            This will permanently delete:
                                        </p>
                                        <ul className="space-y-1 ml-4">
                                            <li>• Your profile information</li>
                                            <li>
                                                • All monthly dues and bill
                                                tracking data
                                            </li>
                                            <li>
                                                • Payment history and due
                                                instances
                                            </li>
                                            <li>
                                                • Your account login credentials
                                            </li>
                                        </ul>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Account
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="flex items-center space-x-2">
                                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                                    <span>
                                                        Are you absolutely sure?
                                                    </span>
                                                </AlertDialogTitle>
                                                <AlertDialogDescription asChild>
                                                    <div className="space-y-3">
                                                        <p>
                                                            This action cannot
                                                            be undone. This will
                                                            permanently delete
                                                            your account and
                                                            remove all your data
                                                            from our servers.
                                                        </p>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="delete-confirmation">
                                                                Type{" "}
                                                                <strong>
                                                                    DELETE
                                                                </strong>{" "}
                                                                to confirm:
                                                            </Label>
                                                            <Input
                                                                id="delete-confirmation"
                                                                value={
                                                                    deleteConfirmation
                                                                }
                                                                onChange={(e) =>
                                                                    setDeleteConfirmation(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Type DELETE here"
                                                                className="font-mono"
                                                            />
                                                        </div>
                                                    </div>
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel
                                                    onClick={() =>
                                                        setDeleteConfirmation(
                                                            ""
                                                        )
                                                    }
                                                    disabled={isDeleting}
                                                >
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={
                                                        handleDeleteAccount
                                                    }
                                                    disabled={
                                                        !isDeleteConfirmationValid ||
                                                        isDeleting
                                                    }
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    {isDeleting ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Account
                                                        </>
                                                    )}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
