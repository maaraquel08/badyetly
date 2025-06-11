# Authentication Deployment Guide

## Pre-Deployment Checklist

### 1. Supabase Dashboard Configuration

**In your Supabase Dashboard:**

1. Go to **Authentication > URL Configuration**
2. Add your production domain to **Site URL**:

    ```
    https://your-production-domain.com
    ```

3. Add redirect URLs to **Redirect URLs**:
    ```
    https://your-production-domain.com/auth/callback
    https://localhost:3000/auth/callback (keep for local development)
    ```

### 2. Environment Variables

**Set these environment variables in your production deployment platform:**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For different platforms:**

#### Vercel:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add the variables above

#### Netlify:

1. Go to Site settings > Environment variables
2. Add the variables above

#### Railway/Render:

1. Go to your app settings
2. Add environment variables

### 3. Google OAuth Configuration

**In Google Cloud Console:**

1. Go to **APIs & Services > Credentials**
2. Select your OAuth 2.0 Client ID
3. Add your production domain to **Authorized JavaScript origins**:
    ```
    https://your-production-domain.com
    ```
4. Add your production callback to **Authorized redirect URIs**:
    ```
    https://your-supabase-project.supabase.co/auth/v1/callback
    ```

### 4. Testing Authentication in Production

**Test these scenarios:**

1. **Google OAuth Login**:

    - Click "Continue with Google"
    - Complete Google authentication
    - Should redirect to `/dashboard`

2. **Email/Password Login**:

    - Use existing account credentials
    - Should login successfully

3. **Error Handling**:
    - Test with invalid credentials
    - Verify error messages display correctly

### 5. Common Production Issues & Solutions

#### Issue: "OAuth Error" or "Invalid Redirect URI"

**Solution:**

-   Double-check redirect URLs in both Supabase and Google Console
-   Ensure URLs match exactly (no trailing slashes, correct protocol)

#### Issue: "Authentication Failed" in production but works locally

**Solution:**

-   Verify environment variables are set correctly
-   Check Supabase project URL and keys
-   Ensure domain is added to Site URL in Supabase

#### Issue: User profile not created after Google login

**Solution:**

-   Check if handleUserProfile function is working
-   Verify users table exists in database
-   Check RLS policies allow user creation

### 6. Monitoring & Debugging

**Add temporary logging for production debugging:**

```typescript
// In auth-provider.tsx - temporarily add for debugging
const handleUserProfile = async (user: User) => {
    try {
        console.log("Creating user profile for:", user.email); // Remove after debugging
        // ... rest of function
    } catch (error) {
        console.error("Profile creation failed:", error); // Remove after debugging
    }
};
```

**Remove console.log statements after confirming everything works.**

### 7. Security Best Practices

1. **Environment Variables:**

    - Never commit `.env` files to git
    - Use different Supabase projects for development/production if needed

2. **Redirect URLs:**

    - Only add trusted domains
    - Use HTTPS in production

3. **RLS Policies:**
    - Ensure proper Row Level Security is enabled
    - Test that users can only access their own data

### 8. Deployment Commands

```bash
# Build and test locally first
pnpm run build

# If build succeeds, deploy
git add .
git commit -m "Production auth configuration"
git push origin main
```

### 9. Post-Deployment Verification

1. Visit production site
2. Test Google OAuth login
3. Test email/password login
4. Verify user profile creation
5. Check that protected routes work correctly
6. Test sign out functionality

### 10. Rollback Plan

If authentication fails in production:

1. **Immediate fix:** Revert to previous working commit
2. **Debug:** Check browser developer tools for errors
3. **Logs:** Check deployment platform logs for server errors
4. **Supabase:** Check Supabase dashboard for authentication attempts

## Quick Debug Checklist

-   [ ] Environment variables set correctly
-   [ ] Supabase Site URL includes production domain
-   [ ] Redirect URLs configured in Supabase
-   [ ] Google OAuth redirect URIs configured
-   [ ] HTTPS used for all production URLs
-   [ ] Database users table exists
-   [ ] RLS policies allow user operations
