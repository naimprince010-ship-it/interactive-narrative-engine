-- ============================================================
-- নতুন মাল্টিভার্স স্টোরি যোগ করার টেমপ্লেট
-- Supabase → SQL Editor এ কপি করে আপনার গল্প দিয়ে জায়গা পূরণ করুন
-- ============================================================

-- ১. স্টোরি যোগ করুন (id, title, description, max_players, genre)
INSERT INTO public.stories (id, title, description, max_players, genre)
VALUES (
  'your-story-id',                    -- ইউনিক আইডি (ইংলিশ, যেমন: romance-campus-1)
  'গল্পের শিরোনাম',                   -- শিরোনাম
  'গল্পের সংক্ষিপ্ত বর্ণনা।',          -- বর্ণনা
  3,                                   -- কতজন খেলবে (২ বা ৩ বা ৪)
  'romance'                            -- জেনার: romance, mystery, thriller, scifi, fantasy, horror, comedy, drama, adventure, action ইত্যাদি
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    max_players = EXCLUDED.max_players,
    genre = EXCLUDED.genre;

-- ২. চরিত্রগুলো যোগ করুন (max_players এর সমান সংখ্যা)
INSERT INTO public.character_templates (name, description, story_id)
VALUES
  ('চরিত্র ১ এর নাম', 'চরিত্রের সংক্ষিপ্ত বর্ণনা।', 'your-story-id'),
  ('চরিত্র ২ এর নাম', 'চরিত্রের সংক্ষিপ্ত বর্ণনা।', 'your-story-id'),
  ('চরিত্র ৩ এর নাম', 'চরিত্রের সংক্ষিপ্ত বর্ণনা।', 'your-story-id')
ON CONFLICT (story_id, name) DO UPDATE
SET description = EXCLUDED.description;

-- ৩. প্রথম নোড (শুরু) — node_key অবশ্যই "start" রাখুন
INSERT INTO public.story_nodes (story_id, node_key, title, content, choices, is_ending)
VALUES (
  'your-story-id',
  'start',
  'প্রথম দৃশ্যের শিরোনাম',
  'এখানে গল্পের টেক্সট লিখুন। চরিত্রের নাম দিয়ে আলাদা লাইন দিতে পারেন।',
  '[
    {"key": "choice1", "text": "প্রথম অপশন", "next_node": "second_node_key", "character_specific": null},
    {"key": "choice2", "text": "দ্বিতীয় অপশন", "next_node": "other_node_key", "character_specific": null}
  ]'::jsonb,
  false
)
ON CONFLICT (story_id, node_key) DO UPDATE
SET title = EXCLUDED.title, content = EXCLUDED.content, choices = EXCLUDED.choices;

-- ৪. পরের নোডগুলো — প্রতিটির জন্য আলাদা INSERT
-- node_key = পরের দৃশ্যের ইউনিক কী (যেটা choices এর next_node এ দেবেন)
INSERT INTO public.story_nodes (story_id, node_key, title, content, choices, is_ending)
VALUES (
  'your-story-id',
  'second_node_key',
  'দ্বিতীয় দৃশ্যের শিরোনাম',
  'কন্টেন্ট...',
  '[
    {"key": "next1", "text": "অপশন", "next_node": "ending_node", "character_specific": null}
  ]'::jsonb,
  false
)
ON CONFLICT (story_id, node_key) DO UPDATE
SET title = EXCLUDED.title, content = EXCLUDED.content, choices = EXCLUDED.choices;

-- ৫. শেষ নোড — choices খালি, is_ending = true
INSERT INTO public.story_nodes (story_id, node_key, title, content, choices, is_ending)
VALUES (
  'your-story-id',
  'ending_node',
  'গল্পের শেষ',
  'শেষের টেক্সট...',
  '[]'::jsonb,
  true
)
ON CONFLICT (story_id, node_key) DO UPDATE
SET title = EXCLUDED.title, content = EXCLUDED.content, choices = EXCLUDED.choices, is_ending = EXCLUDED.is_ending;
