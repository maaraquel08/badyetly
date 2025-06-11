import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const next = searchParams.get("next") ?? "/dashboard";

    if (error) {
        return NextResponse.redirect(
            `${origin}/login?error=oauth_error&message=${encodeURIComponent(
                error
            )}`
        );
    }

    if (code) {
        try {
            const cookieStore = await cookies();

            // Create the server client with the new SSR package
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() {
                            return cookieStore.getAll();
                        },
                        setAll(cookiesToSet) {
                            try {
                                cookiesToSet.forEach(
                                    ({ name, value, options }) => {
                                        cookieStore.set(name, value, options);
                                    }
                                );
                            } catch (error) {
                                // The `setAll` method was called from a Server Component.
                                // This can be ignored if you have middleware refreshing
                                // user sessions.
                            }
                        },
                    },
                }
            );

            const { data, error: exchangeError } =
                await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
                console.error("OAuth exchange error:", exchangeError);
                return NextResponse.redirect(
                    `${origin}/login?error=exchange_failed&message=${encodeURIComponent(
                        exchangeError.message
                    )}`
                );
            }

            // Debug: Log the user data we received from OAuth
            if (data.user) {
                console.log("OAuth success - User data:", {
                    id: data.user.id,
                    email: data.user.email,
                    metadata: data.user.user_metadata,
                    app_metadata: data.user.app_metadata,
                });
            }

            // Successful authentication, redirect to the intended page
            return NextResponse.redirect(`${origin}${next}`);
        } catch (error) {
            return NextResponse.redirect(
                `${origin}/login?error=callback_exception&message=${encodeURIComponent(
                    String(error)
                )}`
            );
        }
    }

    return NextResponse.redirect(`${origin}/login?error=no_code`);
}
