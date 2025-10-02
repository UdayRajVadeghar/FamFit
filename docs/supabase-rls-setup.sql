-- ============================================
-- Supabase RLS Policies for FamFit Application
-- ============================================
-- Run this in your Supabase SQL Editor

-- First, drop all existing policies on the users table
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view other users" ON users;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow INSERT for authenticated users matching their own ID
CREATE POLICY "users_insert_policy"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

-- Policy 2: Allow UPDATE for authenticated users on their own record
CREATE POLICY "users_update_policy"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Policy 3: Allow SELECT for all authenticated users (needed for family features)
CREATE POLICY "users_select_policy"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

