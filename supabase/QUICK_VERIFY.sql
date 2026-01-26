-- Quick Verification Script
-- Copy-paste this in Supabase SQL Editor for fast check

-- ✅ Check 1: All 8 tables exist?
SELECT 
  COUNT(*) as total_tables,
  STRING_AGG(table_name, ', ') as table_names
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
  );

-- Expected: total_tables = 8

-- ✅ Check 2: RLS enabled on all tables?
SELECT 
  COUNT(*) as rls_enabled_count
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
  );

-- Expected: rls_enabled_count = 8

-- ✅ Check 3: RLS policies exist?
SELECT 
  tablename,
  COUNT(*) as policy_count
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
GROUP BY tablename
ORDER BY tablename;

-- Expected: At least 1 policy per table

-- ✅ Check 4: Foreign keys exist?
SELECT 
  COUNT(*) as foreign_key_count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema = 'public'
  AND table_name IN (
    'character_templates',
    'story_instances',
    'character_assignments',
    'story_nodes',
    'character_chat',
    'user_choices',
    'story_state'
  );

-- Expected: foreign_key_count >= 7

-- ✅ Check 5: Indexes exist?
SELECT 
  COUNT(DISTINCT tablename) as tables_with_indexes,
  COUNT(*) as total_indexes
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
  );

-- Expected: tables_with_indexes >= 5, total_indexes >= 10

-- ✅ FINAL SUMMARY
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('stories', 'character_templates', 'story_instances', 
                             'character_assignments', 'story_nodes', 'character_chat', 
                             'user_choices', 'story_state')) = 8 
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as tables_check,
  
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables 
          WHERE schemaname = 'public' 
          AND rowsecurity = true 
          AND tablename IN ('stories', 'character_templates', 'story_instances', 
                           'character_assignments', 'story_nodes', 'character_chat', 
                           'user_choices', 'story_state')) = 8 
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as rls_check,
  
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename IN ('stories', 'character_templates', 'story_instances', 
                           'character_assignments', 'story_nodes', 'character_chat', 
                           'user_choices', 'story_state')) >= 5 
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as policies_check;
