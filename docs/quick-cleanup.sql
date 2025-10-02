-- ============================================
-- QUICK DATABASE CLEANUP
-- ============================================
-- Since your database is empty/minimal, this will clean everything
-- Run this in Supabase SQL Editor

-- Step 1: Check what data exists
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Family Members', COUNT(*) FROM "FamilyMember"
UNION ALL
SELECT 'Families', COUNT(*) FROM "Family"
UNION ALL
SELECT 'Progress', COUNT(*) FROM "Progress";

-- Step 2: Delete all data (cascade will remove related records)
-- UNCOMMENT THE LINES BELOW ONLY IF YOU WANT TO START FRESH

-- TRUNCATE TABLE "Progress" CASCADE;
-- TRUNCATE TABLE "FamilyMember" CASCADE;
-- TRUNCATE TABLE "Family" CASCADE;
-- TRUNCATE TABLE users CASCADE;

-- Step 3: OR just delete orphaned users (safer option)
DELETE FROM users 
WHERE id NOT IN (
  SELECT DISTINCT "userId" FROM "FamilyMember"
) AND id NOT IN (
  SELECT DISTINCT "createdBy" FROM "Family"
) AND id NOT IN (
  SELECT DISTINCT "userId" FROM "Progress"
);

-- Step 4: Verify
SELECT * FROM users;

