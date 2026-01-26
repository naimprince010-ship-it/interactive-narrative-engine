-- Test Data for Multiverse System - FIXED VERSION
-- Run this AFTER schema setup to create test story
-- Copy and paste the ENTIRE file into Supabase SQL Editor

-- ============================================
-- STEP 1: Create the story
-- ============================================
INSERT INTO public.stories (id, title, description, max_players)
VALUES (
  'test-multiverse-story-1',
  'The Phone Call Mystery',
  'Three friends receive a mysterious phone call that changes everything. Each person plays a different character with their own perspective.',
  3
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    max_players = EXCLUDED.max_players;

-- ============================================
-- STEP 2: Create character templates
-- ============================================
INSERT INTO public.character_templates (name, description, story_id)
VALUES
  (
    'আবির',
    'A tech-savvy college student who loves solving puzzles. You are curious and analytical.',
    'test-multiverse-story-1'
  ),
  (
    'নীলা',
    'A creative writer who sees patterns in everything. You are intuitive and emotional.',
    'test-multiverse-story-1'
  ),
  (
    'রাহুল',
    'A practical engineer who thinks logically. You are calm under pressure and methodical.',
    'test-multiverse-story-1'
  )
ON CONFLICT (story_id, name) DO UPDATE
SET description = EXCLUDED.description;

-- ============================================
-- STEP 3: Create story nodes
-- ============================================

-- Starting node
INSERT INTO public.story_nodes (story_id, node_key, title, content, choices, is_ending)
VALUES (
  'test-multiverse-story-1',
  'start',
  'The Phone Rings',
  'It''s 11 PM on a Friday night. You and your friends are hanging out when suddenly, all three phones ring simultaneously. The caller ID shows "UNKNOWN". 

আবির, আপনি আপনার phone-এ দেখেন: "Incoming call from UNKNOWN - 3 missed calls already"

নীলা, আপনার phone-এ message আসে: "Answer the call. Your future depends on it."

রাহুল, আপনি notice করেন: "All three phones ringing at exact same time - statistically impossible."

What do you do?',
  '[
    {
      "key": "answer",
      "text": "Answer the call",
      "next_node": "phone_answered",
      "character_specific": null
    },
    {
      "key": "ignore",
      "text": "Ignore and block the number",
      "next_node": "phone_ignored",
      "character_specific": null
    },
    {
      "key": "investigate",
      "text": "Try to trace the number first",
      "next_node": "investigating",
      "character_specific": ["আবির", "রাহুল"]
    }
  ]'::jsonb,
  false
)
ON CONFLICT (story_id, node_key) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    choices = EXCLUDED.choices;

-- Phone answered node
INSERT INTO public.story_nodes (story_id, node_key, title, content, choices, is_ending)
VALUES (
  'test-multiverse-story-1',
  'phone_answered',
  'The Voice',
  'You answer the call. A distorted voice speaks: "You have 24 hours. Make the right choice, or face the consequences."

আবির: The voice sounds like it''s using a voice changer. You notice a pattern in the distortion.

নীলা: Something about the voice feels familiar, but you can''t place it.

রাহুল: The timing is too precise. This is coordinated.

The call ends abruptly.',
  '[
    {
      "key": "discuss",
      "text": "Discuss with friends what to do",
      "next_node": "group_discussion",
      "character_specific": null
    },
    {
      "key": "act_alone",
      "text": "Take action alone",
      "next_node": "solo_action",
      "character_specific": null
    }
  ]'::jsonb,
  false
)
ON CONFLICT (story_id, node_key) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    choices = EXCLUDED.choices;

-- Phone ignored node
INSERT INTO public.story_nodes (story_id, node_key, title, content, choices, is_ending)
VALUES (
  'test-multiverse-story-1',
  'phone_ignored',
  'Silence',
  'You ignore the call and block the number. But something feels wrong. The silence is too heavy.

Hours pass. Nothing happens. But you can''t shake the feeling that you made a mistake.

The next morning, you wake up to find your phones have been wiped clean. All contacts, messages, photos - gone.',
  '[
    {
      "key": "panic",
      "text": "Panic and try to recover data",
      "next_node": "ending_data_lost",
      "character_specific": null
    },
    {
      "key": "stay_calm",
      "text": "Stay calm and investigate",
      "next_node": "investigating",
      "character_specific": null
    }
  ]'::jsonb,
  false
)
ON CONFLICT (story_id, node_key) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    choices = EXCLUDED.choices;

-- Group discussion node
INSERT INTO public.story_nodes (story_id, node_key, title, content, choices, is_ending)
VALUES (
  'test-multiverse-story-1',
  'group_discussion',
  'The Decision',
  'You all gather together and discuss the mysterious call. Each of you brings a different perspective:

আবির suggests tracing the call and analyzing the pattern.
নীলা feels there''s a deeper meaning, something symbolic.
রাহুল wants to take a systematic approach and document everything.

Together, you decide...',
  '[
    {
      "key": "unite",
      "text": "Work together as a team",
      "next_node": "ending_together",
      "character_specific": null
    },
    {
      "key": "split",
      "text": "Split up and investigate separately",
      "next_node": "ending_separate",
      "character_specific": null
    }
  ]'::jsonb,
  false
)
ON CONFLICT (story_id, node_key) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    choices = EXCLUDED.choices;

-- Ending nodes
INSERT INTO public.story_nodes (story_id, node_key, title, content, choices, is_ending)
VALUES
  (
    'test-multiverse-story-1',
    'ending_together',
    'Together We Stand',
    'By working together, you uncover the truth: it was a social experiment testing friendship and trust. You passed the test, and your bond grows stronger.

This is just the beginning of your adventure...',
    '[]'::jsonb,
    true
  ),
  (
    'test-multiverse-story-1',
    'ending_separate',
    'Paths Diverged',
    'You go your separate ways. Each of you discovers different pieces of the puzzle, but never the full picture.

Years later, you wonder: what if you had stayed together?',
    '[]'::jsonb,
    true
  ),
  (
    'test-multiverse-story-1',
    'ending_data_lost',
    'The Price of Ignoring',
    'Your data is lost forever. But you learn a valuable lesson: sometimes, ignoring a call can cost you everything.

The mystery remains unsolved.',
    '[]'::jsonb,
    true
  )
ON CONFLICT (story_id, node_key) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content,
    choices = EXCLUDED.choices,
    is_ending = EXCLUDED.is_ending;

-- ============================================
-- STEP 4: Verify the data
-- ============================================
SELECT 'Story created:' as status, id, title FROM public.stories WHERE id = 'test-multiverse-story-1';
SELECT 'Characters created:' as status, COUNT(*) as count FROM public.character_templates WHERE story_id = 'test-multiverse-story-1';
SELECT 'Nodes created:' as status, COUNT(*) as count FROM public.story_nodes WHERE story_id = 'test-multiverse-story-1';
