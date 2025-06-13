-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE due_instances ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Monthly dues policies
CREATE POLICY "Users can view own monthly dues" ON monthly_dues
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own monthly dues" ON monthly_dues
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own monthly dues" ON monthly_dues
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own monthly dues" ON monthly_dues
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Due instances policies
CREATE POLICY "Users can view own due instances" ON due_instances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monthly_dues 
      WHERE monthly_dues.id = due_instances.monthly_due_id 
      AND monthly_dues.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own due instances" ON due_instances
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM monthly_dues 
      WHERE monthly_dues.id = due_instances.monthly_due_id 
      AND monthly_dues.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own due instances" ON due_instances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM monthly_dues 
      WHERE monthly_dues.id = due_instances.monthly_due_id 
      AND monthly_dues.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own due instances" ON due_instances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM monthly_dues 
      WHERE monthly_dues.id = due_instances.monthly_due_id 
      AND monthly_dues.user_id = (select auth.uid())
    )
  );
