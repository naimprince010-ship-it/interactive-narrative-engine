-- Action-Oriented Narrative: Health, Inventory, Real-time Events
-- Run once in Supabase SQL Editor

-- 1. Health and inventory on character_assignments (participants)
ALTER TABLE public.character_assignments
  ADD COLUMN IF NOT EXISTS health integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS inventory jsonb NOT NULL DEFAULT '[]';

COMMENT ON COLUMN public.character_assignments.health IS 'HP: 0 = spectator (out of timeline)';
COMMENT ON COLUMN public.character_assignments.inventory IS 'Item keys e.g. ["old_key", "flashlight"]';

-- 2. Instance events for real-time broadcast (health_loss, item_found)
CREATE TABLE IF NOT EXISTS public.instance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES public.story_instances(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS instance_events_instance_created_idx
  ON public.instance_events(instance_id, created_at DESC);

ALTER TABLE public.instance_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for their instances"
  ON public.instance_events FOR SELECT
  USING (
    instance_id IN (
      SELECT instance_id FROM public.character_assignments
      WHERE user_id = auth.uid()::text
    )
  );

-- Service role can insert (API will insert via service or anon with RLS bypass)
-- For API inserts we need: allow insert for authenticated users who are in the instance
CREATE POLICY "Users in instance can insert events"
  ON public.instance_events FOR INSERT
  WITH CHECK (
    instance_id IN (
      SELECT instance_id FROM public.character_assignments
      WHERE user_id = auth.uid()::text
    )
  );

-- 3. Realtime for instance_events (broadcast to all players)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'instance_events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.instance_events;
  END IF;
END $$;
