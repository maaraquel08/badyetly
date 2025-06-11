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
                    .select("name")
                    .eq("id", user.id)
                    .single();

                if (!error && data) {
                    setName(data.name || "");
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
        setIsLoading(true);

        try {
            const { error } = await updateProfile({ name });

            if (error) {
                throw error;
            }

            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
            });

            // Trigger profile refresh in sidebar
            refreshProfile();
        } catch (error) {
            toast({
                title: "Error updating profile",
                description: "Failed to update your profile. Please try again.",
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
        <div className="container max-w-4xl py-8">
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
