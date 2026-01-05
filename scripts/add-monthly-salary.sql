-- Add monthly_salary column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC(10,2);

-- Verify the column was added (this will show an error if it already exists, which is fine)
-- You can check if the column exists by running:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'monthly_salary';

-- Ensure RLS policies allow users to update their own monthly_salary
-- The existing "Users can update own profile" policy should already cover this,
-- but let's verify it exists:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON users
            FOR UPDATE USING ((select auth.uid()) = id);
    END IF;
END $$;

-- Also ensure users can insert their own profile (in case the record doesn't exist yet)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON users
            FOR INSERT WITH CHECK ((select auth.uid()) = id);
    END IF;
END $$;

