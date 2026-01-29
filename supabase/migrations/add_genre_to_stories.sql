-- Add genre to stories for filtering and building by genre
-- Run in Supabase SQL Editor if you don't use migrations

ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS genre text DEFAULT 'mystery';

COMMENT ON COLUMN public.stories.genre IS 'Story genre: mystery, romance, thriller, scifi, fantasy, horror, comedy, drama, adventure, action, slice_of_life, historical, crime, supernatural, family, psychological, tragedy, inspirational';

-- Optional: update existing story with genre
UPDATE public.stories
SET genre = 'mystery'
WHERE id = 'test-multiverse-story-1' AND (genre IS NULL OR genre = '');
