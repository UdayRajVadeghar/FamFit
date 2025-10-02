-- ============================================
-- Cleanup Script for Duplicate Users
-- ============================================
-- Use this ONLY if you have duplicate user records from dev/testing
-- and are getting "Unique constraint failed on the fields: (`email`)" errors

-- STEP 1: Check for duplicate emails
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- STEP 2: View all users to identify which ones to keep
SELECT id, email, name, "createdAt", "updatedAt"
FROM users
ORDER BY email, "createdAt";

-- STEP 3: OPTION A - If you want to start fresh (DANGEROUS - deletes ALL users)
-- UNCOMMENT ONLY IF YOU'RE SURE:
-- TRUNCATE TABLE users CASCADE;

-- STEP 4: OPTION B - Delete specific user by ID (safer)
-- Replace 'old_user_id_here' with the actual ID you want to remove
-- DELETE FROM users WHERE id = 'old_user_id_here';

-- STEP 5: OPTION C - Delete users with no family memberships (cleanup orphaned records)
-- This is usually safe for testing/dev cleanup
DELETE FROM users 
WHERE id NOT IN (
  SELECT DISTINCT "userId" FROM "FamilyMember"
) AND id NOT IN (
  SELECT DISTINCT "createdBy" FROM "Family"
) AND id NOT IN (
  SELECT DISTINCT "userId" FROM "Progress"
);

-- STEP 6: Verify cleanup
SELECT id, email, name FROM users ORDER BY email;

