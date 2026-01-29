# AI Story Orchestrator Plan

## সংক্ষেপ

- **Phase 1** — DB & State (টেবিল + স্টেট মেশিন) ✅
- **Phase 2** — `progressStoryInstance(instanceId)` (ট্রিগার + লজিক) ✅
- **Phase 3** — AI (সিস্টেম প্রম্পট + JSON আউটপুট + টোকেন সেভ) ✅
- **Phase 4** — WebSocket (পার্সপেক্টিভ ভিত্তিক পুশ) ✅
- **Phase 5** — Branching (pre-defined vs AI branch) ✅ (Phase 2/3 এ ইমপ্লিমেন্ট)
- **Phase 6** — Checklist (কী কী বানাতে হবে)

---

## Phase 1 — DB & State

- **টেবিল:** `story_instances`, `instance_participants` (অথবা প্রজেক্টের `character_assignments`), `story_choices` (অথবা `user_choices`), `story_state`
- **স্টেট মেশিন:** `current_node_key` — হয় pre-defined নোড কিংবা AI branch (যেমন `ai_branch_xxx`)

*(প্রজেক্টে ইতিমধ্যে: `story_instances`, `character_assignments`, `user_choices`, `story_state`, `story_nodes` — Phase 1 ম্যাপ করা যায়)*

---

## Phase 2 — progressStoryInstance(instanceId)

**ট্রিগার:** সব ইউজার চয়েস দিয়েছে **অথবা** টাইমার ফুরিয়েছে।

**স্টেপ:**
1. লোড ইনস্ট্যান্স / টেমপ্লেট / নোড / চয়েস
2. নেক্সট নোড ঠিক করা — **pre-defined** (চয়েস ম্যাচ) **বা** **AI branch**
3. বাফার বানানো (গত ২–৩ নোডের সামারি — টোকেন সেভ)
4. প্রম্পট + OpenAI
5. JSON পার্স
6. DB আপডেট
7. (Phase 4 এ) WebSocket পুশ

---

## Phase 3 — AI

- **সিস্টেম প্রম্পট টেমপ্লেট:** স্টোরি কনটেক্সট, সিক্রেট প্রোফাইল (ক্যারেক্টার ডেসক্রিপশন), বাফার, চয়েস
- **আউটপুট ফরম্যাট:**
  ```json
  {
    "character_perspectives": {
      "আবির": "...",
      "নীলা": "..."
    },
    "narrator_summary": "...",
    "next_node": "..."
  }
  ```
- **টোকেন সেভ:** শুধু গত ২–৩ নোডের সামারি (Conversation Buffer)

---

## Phase 4 — WebSocket

- প্রতিটি ইউজারকে শুধু তার নিজের **পার্সপেক্টিভ টেক্সট** (`content_for_you`) + শেয়ারড ফিল্ড (`choices`, `is_ending`) পাঠানো

---

## Phase 5 — Branching

- চয়েস ম্যাচ করলে → **pre-defined** `next_node`
- না করলে → **AI branch** — `story_state`-তে সেভ, `node_key` যেমন `ai_branch_xxx`

---

## Phase 6 — Checklist

| আইটেম | বানাতে হবে |
|--------|-------------|
| ব্যাকএন্ড/API | progressStoryInstance কল করার API |
| progressStoryInstance | Phase 2 লজিক |
| টাইমার | সব চয়েস না দিলে টাইমার ফুরিয়ে ট্রিগার |
| WebSocket | Phase 4 পার্সপেক্টিভ পুশ |
| ফ্রন্টএন্ড | নোড/চয়েস UI + পার্সপেক্টিভ রেন্ডারিং |

---

## Cursor কীভাবে করবে (শর্ট রেফারেন্স)

- **সিস্টেম প্রম্পট:** স্টোরি কনটেক্সট + সিক্রেট প্রোফাইল + বাফার + চয়েস
- **স্টেট মেশিন:** `current_node_key` (pre-defined বা AI branch)
- **পার্সপেক্টিভ রেন্ডারিং:** ইউজারকে শুধু তার ক্যারেক্টারের টেক্সট
- **টোকেন এফিশিয়েন্সি:** গত ২–৩ নোডের সামারি
- **JSON রেসপন্স:** `character_perspectives`, `narrator_summary`, `next_node`

---

**প্ল্যান ফাইল পাথ:** `supabase/AI_STORY_ORCHESTRATOR_PLAN.md`
