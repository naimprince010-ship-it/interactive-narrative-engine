# গল্প বানানো ও বড় করা গাইড

## ১. জেনার অনুযায়ী মাল্টিভার্স গল্প বানানো

### ধাপ ১: Supabase এ `genre` কলাম যোগ করা (একবার)

Supabase Dashboard → SQL Editor এ এই কোয়েরি চালান:

```sql
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS genre text DEFAULT 'mystery';
```

**জেনার মান (সব জেনার):**  
`mystery`, `romance`, `thriller`, `scifi`, `fantasy`, `horror`, `comedy`, `drama`, `adventure`, `action`, `slice_of_life`, `historical`, `crime`, `supernatural`, `family`, `psychological`, `tragedy`, `inspirational`

### ধাপ ২: নতুন গল্প যোগ করা (জেনার সহ)

```sql
INSERT INTO public.stories (id, title, description, max_players, genre)
VALUES (
  'your-story-id',
  'গল্পের শিরোনাম',
  'সংক্ষিপ্ত বর্ণনা',
  3,
  'romance'
);
```

### ধাপ ৩: চরিত্র ও নোড যোগ করা

`supabase/test_data_FIXED.sql` ফাইল দেখুন — একইভাবে:

1. **character_templates** – গল্পের চরিত্রগুলো (name, description, story_id)
2. **story_nodes** – প্রতিটি দৃশ্য (node_key, title, content, choices JSON, is_ending)

অ্যাপে Multiverse পেজে এখন **জেনার ফিল্টার** আছে — দিয়ে শুধু সেই জেনারের গল্প দেখানো যায়।

---

## ২. মাল্টিভার্স গল্প বড় করা (নতুন নোড/দৃশ্য যোগ)

গল্প বড় করতে নতুন **story_nodes** যোগ করুন। প্রতিটি নোডে:

- **node_key:** ইউনিক কী (যেমন `chapter_2`, `ending_happy`)
- **title:** দৃশ্যের শিরোনাম
- **content:** টেক্সট
- **choices:** JSON অ্যারে — প্রতিটি choice এ `key`, `text`, `next_node` (পরের নোডের node_key)
- **is_ending:** শেষ দৃশ্য হলে `true`

**উদাহরণ — নতুন নোড যোগ:**

```sql
INSERT INTO public.story_nodes (story_id, node_key, title, content, choices, is_ending)
VALUES (
  'test-multiverse-story-1',
  'new_chapter_key',
  'নতুন অধ্যায়ের শিরোনাম',
  'এখানে কন্টেন্ট...',
  '[
    {"key": "choice1", "text": "প্রথম অপশন", "next_node": "next_node_key", "character_specific": null},
    {"key": "choice2", "text": "দ্বিতীয় অপশন", "next_node": "another_node_key", "character_specific": null}
  ]'::jsonb,
  false
);
```

**পুরনো নোডে নতুন choice যোগ করতে:** সেই নোডের `choices` JSON আপডেট করুন — নতুন অবজেক্ট যোগ করে `next_node` যেখানে যাবে সেখানে একটা নোড আগে থেকে তৈরি রাখুন।

---

## ৩. সিঙ্গেল-প্লেয়ার গল্প বড় করা (`data/stories.ts`)

`data/stories.ts` এ গল্প অ্যারে আছে। বড় করতে:

1. **নতুন চ্যাপ্টার যোগ:** সেই গল্পের `chapters` অ্যারে তে নতুন অবজেক্ট যোগ করুন।
2. **Choice থেকে লিংক:** যেখানে যেতে চান সেখানে `nextChapterId` দিয়ে ওই চ্যাপ্টারের `id` দিন।
3. **শেষ অধ্যায়:** `choices: []` রাখুন।

উদাহরণ স্ট্রাকচার:

```ts
{
  id: 'new-chapter-id',
  title: 'অধ্যায়ের শিরোনাম',
  content: 'কন্টেন্ট...',
  isPremium: false,
  storyId: '1',
  choices: [
    { id: 'c1', text: 'অপশন ১', nextChapterId: 'next-chapter-id' },
  ],
}
```

---

## ৪. সংক্ষেপ

| কাজ | কোথায় | কিভাবে |
|-----|--------|--------|
| জেনার দিয়ে গল্প বানানো | Supabase `stories` | `genre` কলাম + INSERT (id, title, description, max_players, genre) |
| জেনার দিয়ে ফিল্টার | অ্যাপ | Multiverse পেজে জেনার ড্রপডাউন |
| মাল্টিভার্স গল্প বড় করা | Supabase `story_nodes` | নতুন নোড INSERT; পুরনো নোডের choices এ নতুন choice + next_node |
| সিঙ্গেল গল্প বড় করা | `data/stories.ts` | নতুন chapter যোগ + choices এ nextChapterId |

Migration ফাইল: `supabase/migrations/add_genre_to_stories.sql`  
টেস্ট ডেটা উদাহরণ: `supabase/test_data_FIXED.sql`
