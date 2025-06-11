"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { AuthGuard } from "@/components/auth-guard";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { signUp, signInWithGoogle } = useAuth();

    // Password validation
    const passwordsMatch = password === confirmPassword;
    const showPasswordError = confirmPassword.length > 0 && !passwordsMatch;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate passwords match
        if (!passwordsMatch) {
            toast({
                title: "Password mismatch",
                description: "Please make sure both passwords match.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await signUp(email, password, name);

            if (error) {
                toast({
                    title: "Signup failed",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Account created",
                    description:
                        "Please check your email to verify your account.",
                });
                router.push("/login");
            }
        } catch (error) {
            toast({
                title: "Signup failed",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setIsGoogleLoading(true);

        try {
            const { error } = await signInWithGoogle();

            if (error) {
                toast({
                    title: "Google signup failed",
                    description: error.message,
                    variant: "destructive",
                });
                setIsGoogleLoading(false);
            }
            // If successful, the user will be redirected via OAuth flow
        } catch (error) {
            toast({
                title: "Google signup failed",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
            setIsGoogleLoading(false);
        }
    };

    return (
        <AuthGuard requireAuth={false}>
            <div className="flex min-h-screen items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center mb-6">
                            <CalendarCheck className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-2xl text-center">
                            Create an account
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter your information to create an account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleSignup}
                            disabled={isGoogleLoading}
                        >
                            {isGoogleLoading ? (
                                "Creating account..."
                            ) : (
                                <>
                                    <svg
                                        className="mr-2 h-4 w-4"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    minLength={6}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Password must be at least 6 characters long.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                    className={
                                        showPasswordError
                                            ? "border-red-500 focus-visible:ring-red-500"
                                            : ""
                                    }
                                />
                                {showPasswordError && (
                                    <div className="flex items-center space-x-2 text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Passwords do not match.</span>
                                    </div>
                                )}
                                {confirmPassword.length > 0 &&
                                    passwordsMatch && (
                                        <div className="flex items-center space-x-2 text-sm text-green-600">
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span>Passwords match.</span>
                                        </div>
                                    )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    isLoading ||
                                    !passwordsMatch ||
                                    password.length < 6
                                }
                            >
                                {isLoading
                                    ? "Creating account..."
                                    : "Create account"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-primary underline-offset-4 hover:underline"
                            >
                                Log in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </AuthGuard>
    );
}
