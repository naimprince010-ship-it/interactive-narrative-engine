-- Verification Queries for Multiverse Schema
-- Run these in Supabase SQL Editor to verify everything is set up correctly

-- ============================================
-- 1. Check if all tables exist
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'stories',
    'character_templates',
    'story_instances',
    'character_assignments',
    'story_nodes',
    'character_chat',
    'user_choices',
    'story_state'
  )
ORDER BY table_name;

-- Expected: 8 rows (one for each table)

-- ============================================
-- 2. Check table columns and structure
-- ============================================

-- Stories table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'stories'
ORDER BY ordinal_position;

-- Character templates
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'character_templates'
ORDER BY ordinal_position;

-- Story instances
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'story_instances'
ORDER BY ordinal_position;

-- Character assignments
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'character_assignments'
ORDER BY ordinal_position;

-- ============================================
-- 3. Check foreign key constraints
-- ============================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'character_templates',
    'story_instances',
    'character_assignments',
    'story_nodes',
    'character_chat',
    'user_choices',
    'story_state'
  )
ORDER BY tc.table_name, kcu.column_name;

-- Expected: Multiple foreign keys showing relationships

-- ============================================
-- 4. Check indexes
-- ============================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'stories',
    'character_templates',
    'story_instances',
    'character_assignments',
    'story_nodes',
    'character_chat',
    'user_choices',
    'story_state'
  )
ORDER BY tablename, indexname;

-- Expected: Multiple indexes for performance

-- ============================================
-- 5. Check unique constraints
-- ============================================
SELECT
  tc.table_name,
  kcu.column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'character_templates',
    'character_assignments',
    'story_nodes',
    'user_choices',
    'story_state'
  )
ORDER BY tc.table_name;

-- Expected: Unique constraints on key columns

-- ============================================
-- 6. Check RLS (Row Level Security) status
-- ============================================
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'stories',
    'character_templates',
    'story_instances',
    'character_assignments',
    'story_nodes',
    'character_chat',
    'user_choices',
    'story_state'
  )
ORDER BY tablename;

-- Expected: rowsecurity = true for all tables

-- ============================================
-- 7. Check RLS Policies
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'stories',
    'character_templates',
    'story_instances',
    'character_assignments',
    'story_nodes',
    'character_chat',
    'user_choices',
    'story_state'
  )
ORDER BY tablename, policyname;

-- Expected: Multiple policies for each table

-- ============================================
-- 8. Quick test: Insert sample data (optional)
-- ============================================
-- Uncomment below to test insertions

/*
-- Test story creation
INSERT INTO public.stories (id, title, description, max_players)
VALUES ('test-story-1', 'Test Story', 'A test story', 3)
ON CONFLICT (id) DO NOTHING;

-- Test character template
INSERT INTO public.character_templates (name, description, story_id)
VALUES ('Test Character', 'A test character', 'test-story-1')
ON CONFLICT DO NOTHING;

-- Verify insertions
SELECT * FROM public.stories WHERE id = 'test-story-1';
SELECT * FROM public.character_templates WHERE story_id = 'test-story-1';

-- Cleanup (optional)
-- DELETE FROM public.character_templates WHERE story_id = 'test-story-1';
-- DELETE FROM public.stories WHERE id = 'test-story-1';
*/

-- ============================================
-- 9. Summary Check (All-in-one)
-- ============================================
SELECT 
  'Tables' as check_type,
  COUNT(*) as count,
  STRING_AGG(table_name, ', ' ORDER BY table_name) as items
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'stories',
    'character_templates',
    'story_instances',
    'character_assignments',
    'story_nodes',
    'character_chat',
    'user_choices',
    'story_state'
  )

UNION ALL

SELECT 
  'RLS Enabled Tables' as check_type,
  COUNT(*) as count,
  STRING_AGG(tablename, ', ' ORDER BY tablename) as items
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN (
    'stories',
    'character_templates',
    'story_instances',
    'character_assignments',
    'story_nodes',
    'character_chat',
    'user_choices',
    'story_state'
  )

UNION ALL

SELECT 
  'RLS Policies' as check_type,
  COUNT(*) as count,
  STRING_AGG(policyname, ', ' ORDER BY policyname) as items
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'stories',
    'character_templates',
    'story_instances',
    'character_assignments',
    'story_nodes',
    'character_chat',
    'user_choices',
    'story_state'
  );

-- Expected: 
-- Tables: 8
-- RLS Enabled Tables: 8
-- RLS Policies: 5 or more
