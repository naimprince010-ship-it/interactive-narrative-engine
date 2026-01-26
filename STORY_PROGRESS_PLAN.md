# Story Reading Progress Tracking - Full Plan

## 🎯 Objectives

1. User dashboard থেকে story list দেখানো
2. Story reading progress track করা (কোন chapter এ আছে)
3. Resume reading functionality
4. Progress sync across devices (user_id based)
5. Visual progress indicators

---

## 📋 Implementation Plan

### **Phase 1: Database Schema (Supabase)**

#### **Table: `reading_progress`**

```sql
create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text, -- Supabase auth user ID
  device_id text, -- For anonymous users
  story_id text not null,
  current_chapter_id text not null,
  unlocked_chapters text[] not null default array[]::text[],
  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, story_id),
  unique(device_id, story_id)
);

create index if not exists reading_progress_user_id_idx on public.reading_progress (user_id);
create index if not exists reading_progress_device_id_idx on public.reading_progress (device_id);
create index if not exists reading_progress_story_id_idx on public.reading_progress (story_id);

alter table public.reading_progress enable row level security;
```

**Features:**
- `user_id` (authenticated users) OR `device_id` (anonymous)
- `current_chapter_id` - এখন কোন chapter এ আছে
- `unlocked_chapters` - কোন chapters unlock হয়েছে
- `last_read_at` - শেষ কখন পড়েছে
- Unique constraint: এক user/device এক story-এর জন্য এক progress

---

### **Phase 2: API Endpoints**

#### **1. GET `/api/progress?storyId=xxx`**
- Get user's progress for a story
- Returns: `{ currentChapterId, unlockedChapters, lastReadAt }`

#### **2. POST `/api/progress`**
- Save/update reading progress
- Body: `{ storyId, currentChapterId, unlockedChapters }`
- Auto-detect `user_id` (from auth) or `device_id`

#### **3. GET `/api/progress/all`**
- Get all stories with progress
- Returns: `[{ storyId, currentChapterId, progress, lastReadAt }]`

---

### **Phase 3: User Dashboard Updates**

#### **New Section: "My Stories"**

**Features:**
1. **Story Cards Grid:**
   - Story title, description
   - Progress bar (কত % পড়েছে)
   - "Continue Reading" button (যদি progress থাকে)
   - "Start Reading" button (নতুন story)
   - Last read timestamp

2. **Progress Indicators:**
   - Visual progress bar
   - "Chapter X of Y" text
   - Unlocked chapters count

3. **Quick Actions:**
   - Resume from last chapter
   - Start from beginning
   - View all stories

---

### **Phase 4: Story Reader Updates**

#### **Auto-save Progress:**
- Chapter change হলে automatically save
- Choice select করার পর progress update
- Premium chapter unlock হলে progress update

#### **Resume Functionality:**
- Story page load হলে last chapter দেখাবে
- "Continue from Chapter X" option

---

### **Phase 5: Progress Calculation**

#### **Progress Percentage:**
```
Progress % = (Unlocked Chapters / Total Chapters) × 100
```

#### **Chapter Status:**
- ✅ Read
- 🔒 Locked (Premium)
- 📖 Current
- ⏭️ Skipped (not read yet)

---

## 🔄 Data Flow

### **Reading Flow:**
1. User dashboard → Story list দেখবে
2. "Continue Reading" → Story page → Last chapter load
3. Chapter পড়া → Choice select → Next chapter
4. Progress auto-save → Database update
5. Dashboard refresh → Updated progress দেখাবে

### **Sync Flow:**
1. User login → `user_id` based progress load
2. Device change → Same `user_id` → Progress sync
3. Anonymous → `device_id` based (local only)

---

## 📊 UI Components

### **Dashboard Story Card:**
```
┌─────────────────────────────┐
│ Story Title                 │
│ Description...              │
│ ━━━━━━━━━━━━━━━━━━━━━ 75%  │
│ Chapter 8 of 12             │
│ Last read: 2 hours ago      │
│ [Continue Reading]          │
└─────────────────────────────┘
```

### **Progress Bar:**
- Green: Read chapters
- Yellow: Current chapter
- Gray: Locked/Unread

---

## 🗄️ Database Queries

### **Get Progress:**
```sql
SELECT * FROM reading_progress 
WHERE (user_id = $1 OR device_id = $2) 
  AND story_id = $3;
```

### **Update Progress:**
```sql
INSERT INTO reading_progress (user_id, device_id, story_id, current_chapter_id, unlocked_chapters)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (user_id, story_id) 
DO UPDATE SET 
  current_chapter_id = EXCLUDED.current_chapter_id,
  unlocked_chapters = EXCLUDED.unlocked_chapters,
  updated_at = NOW();
```

---

## ✅ Implementation Checklist

- [ ] Create `reading_progress` table in Supabase
- [ ] Create API endpoints (`/api/progress/*`)
- [ ] Update story reader to auto-save progress
- [ ] Add "My Stories" section to dashboard
- [ ] Add progress indicators (bars, percentages)
- [ ] Add "Continue Reading" functionality
- [ ] Test progress sync (user_id vs device_id)
- [ ] Test resume from last chapter
- [ ] Add progress calculation logic
- [ ] Update UI with visual progress

---

## 🎨 UI Mockup

### **Dashboard:**
```
┌─────────────────────────────────────────┐
│ User Dashboard                          │
├─────────────────────────────────────────┤
│ Token Balance: 🪙 500                   │
├─────────────────────────────────────────┤
│ My Stories                               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ Story 1  │ │ Story 2  │ │ Story 3  ││
│ │ ████░░░░ │ │ ████████ │ │ ░░░░░░░░ ││
│ │ 50%      │ │ 100%     │ │ 0%       ││
│ │ Continue │ │ Complete │ │ Start    ││
│ └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────┘
```

---

## 🔐 Security

- RLS enabled on `reading_progress`
- Users can only see their own progress
- Service role for API writes
- Validation: story_id must exist in stories.ts

---

## 📝 Next Steps

1. **Create SQL schema** → `supabase/reading_progress.sql`
2. **Create API routes** → `app/api/progress/`
3. **Update dashboard** → Add "My Stories" section
4. **Update story reader** → Auto-save progress
5. **Test end-to-end** → Full flow verification
