# Add Story Data to Supabase

## Problem
Multiverse Stories page showing "No stories available yet" - database is empty.

## Solution
Run the test data SQL file in Supabase to add a sample story.

---

## Steps to Add Story Data

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/ysgzjoyffzlxlbjxswso/sql/new
2. Or: Dashboard → SQL Editor → New Query

### Step 2: Run Test Data SQL
1. Copy the entire content of `supabase/test_data.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Data
After running, you should see:
- ✅ "Story created: test-multiverse-story-1"
- ✅ "Characters created: 3"
- ✅ "Nodes created: 7"

---

## What Gets Created

### Story
- **ID:** `test-multiverse-story-1`
- **Title:** "The Phone Call Mystery"
- **Max Players:** 3

### Characters
1. **আবির** - Tech-savvy college student
2. **নীলা** - Creative writer
3. **রাহুল** - Practical engineer

### Story Nodes
- Starting node: "The Phone Rings"
- Multiple branching paths
- 3 different endings

---

## After Adding Data

1. **Refresh** the Multiverse Stories page
2. You should see "The Phone Call Mystery" story
3. Click "Join Story" to test

---

## Quick Copy-Paste

If you just want to add one story quickly, run this in Supabase SQL Editor:

```sql
-- Quick Story Insert
INSERT INTO public.stories (id, title, description, max_players)
VALUES (
  'test-multiverse-story-1',
  'The Phone Call Mystery',
  'Three friends receive a mysterious phone call that changes everything.',
  3
)
ON CONFLICT (id) DO NOTHING;
```

Then run the full `test_data.sql` file for complete setup.

---

## Troubleshooting

### Error: "relation does not exist"
→ Run `multiverse_schema.sql` first to create tables

### Error: "duplicate key"
→ Data already exists, that's fine! Just refresh the page.

### Still showing "No stories"
→ Check Supabase Table Editor → `stories` table → Should see 1 row
