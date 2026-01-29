-- Run this once in Supabase SQL Editor
-- 1) RLS policy for story_state (so users can read their instance's state + Realtime works)
-- 2) Enable Realtime for story_instances and story_state

-- 1. story_state: Users can only see state for instances they're part of
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'story_state' AND policyname = 'Users can view story_state for their instances'
  ) THEN
    CREATE POLICY "Users can view story_state for their instances" ON public.story_state
      FOR SELECT
      USING (
        instance_id IN (
          SELECT instance_id FROM public.character_assignments
          WHERE user_id = auth.uid()::text
        )
      );
  END IF;
END $$;

-- 2. Realtime: Add tables to supabase_realtime publication (Phase 4)
-- Run these two lines. If you get "already member of publication" then skip that line.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'story_instances') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.story_instances;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'story_state') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.story_state;
  END IF;
END $$;
