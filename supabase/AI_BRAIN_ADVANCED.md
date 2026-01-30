# AI Brain — Advanced Steps (Dungeon Master)

## বর্তমানে যা ইমপ্লিমেন্ট হয়েছে

- **Conversation Buffer:** `story_state.state_data.node_history` — গত ৩ নোডের সামারি (টোকেন ট্রাঙ্কেশন)
- **Secret Character Profile:** প্রতিটি টার্নে প্রম্পটে ক্যারেক্টার প্রোফাইল ইনজেক্ট
- **Zod Schema:** AI আউটপুট ভ্যালিডেশন; পার্স ফেইল বা character_perspectives কম থাকলে অটো-রিট্রাই (শর্টার প্রম্পট)
- **Multiverse Forking:** চয়েস ড্রাস্টিক্যালি আলাদা হলে AI কে বলা হয় নতুন `ai_branch_*` বানাতে, মেইন প্লটে জোর করা হয় না
- **mood_score:** Emotional tone (tension, romance, mystery, hope 0–1) — ফ্রন্টএন্ড মিউজিক/ব্যাকগ্রাউন্ড কালার এর জন্য
- **hidden_logic:** AI কেন গল্পটা এই দিকে নিল — ডিবাগিং ও মান নিয়ন্ত্রণের জন্য

---

## ক. Character Memory Vectors (Long-term Memory)

গল্প অনেক লম্বা হলে (যেমন ৫০ নোড) AI শুরুর কথা ভুলে যাবে।

**সমাধান:** Vector Database ব্যবহার করুন।

- **Supabase pgvector:** `supabase/vector` এক্সটেনশন চালু করে একটি টেবিল বানান যেখানে প্রতিটি চরিত্রের গুরুত্বপূর্ণ অতীত ঘটনা এমবেড করে সেভ করা হবে।
- **অথবা Pinecone:** বাহিরের সার্ভিস হিসেবে ব্যবহার করতে পারেন।

**স্ট্রাকচার (আইডিয়া):**

```sql
-- Supabase SQL Editor: pgvector extension চালু করুন (Supabase Dashboard → Database → Extensions → vector)
create table if not exists public.character_memory_vectors (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.story_instances(id) on delete cascade,
  character_id uuid not null references public.character_templates(id) on delete cascade,
  content text not null,
  embedding vector(1536),  -- OpenAI embedding dimension
  node_key text,
  created_at timestamptz not null default now()
);

create index on public.character_memory_vectors using ivfflat (embedding vector_cosine_ops) with (lists = 100);
```

**ফ্লো:**

1. নতুন নোড জেনারেট হওয়ার পর গুরুত্বপূর্ণ ঘটনা টেক্সট থেকে এমবেড বানিয়ে `character_memory_vectors` এ insert করুন।
2. অরকেস্ট্রেটর কল করার আগে বর্তমান ইনস্ট্যান্স + ক্যারেক্টারদের জন্য vector similarity search করে প্রাসঙ্গিক মেমরি টেক্সট নিয়ে প্রম্পটে যোগ করুন।

**লং-টার্ম ভিশন:** Vector Memory তখনই ইমপ্লিমেন্ট করবেন যখন একটি গল্প **২০–৩০টি নোড** পার করবে। তার আগ পর্যন্ত বর্তমান **৩-নোড বাফার** যথেষ্ট।

---

## খ. Emotional Tone Controller (mood_score)

এআই শুধু টেক্সট দেয় না — `mood_score` দেয় (যেমন tension 0.8, romance 0.2)। এই স্কোর অনুযায়ী ফ্রন্টএন্ডে মিউজিক বা ব্যাকগ্রাউন্ড কালার বদলানো যায়।

**API:** `GET /api/multiverse/instances/[instanceId]/node?nodeId=...` রেসপন্সে যখন AI নোড থাকে তখন `node.mood_score` ও `node.hidden_logic` আসে।

**ফ্রন্টএন্ড ব্যবহার:**

- `mood_score.tension` বেশি হলে ডার্ক/টেন্স মিউজিক বা লাল/গাঢ় ব্যাকগ্রাউন্ড
- `mood_score.romance` বেশি হলে সফট মিউজিক বা গোলাপি/নরম কালার
- `mood_score.mystery` বা `mood_score.hope` অনুযায়ী অ্যাটমস্ফিয়ার বদলানো

---

## গ. Hidden Narrative Logic (hidden_logic)

AI আউটপুটে `hidden_logic` ফিল্ড বাধ্য করা হয়েছে: সে কেন গল্পটিকে এই দিকে নিল তার এক লাইন ব্যাখ্যা। ডিবাগিং এবং গল্পের মান নিয়ন্ত্রণে ব্যবহার করুন।

- API থেকে `node.hidden_logic` পাবেন (যদি AI নোড হয়)।
- ডেভ টুল বা অ্যাডমিন প্যানেলে দেখাতে পারেন; প্রডাকশনে লুকিয়ে রাখতে পারেন।

---

## চেকলিস্ট (করা হয়েছে)

| টাস্ক | স্ট্যাটাস |
|--------|-----------|
| Token Truncation — buffer শুধু last 3 nodes | ✅ `NODE_HISTORY_MAX = 3`, buffer slice(-3) |
| Zod Schema — AI response structure validate | ✅ `OrchestratorOutputSchema` + safeParse |
| System Prompt — detailed AI Narrator prompt | ✅ Dungeon Master prompt + Secret Profile + Buffer + Forking |
| Auto-Retry — JSON parse fail হলে শর্টার প্রম্পটে রিট্রাই | ✅ MAX_RETRIES, shortPrompt on retry |
| Character perspectives missing হলে রিট্রাই | ✅ parseAndValidate requiredCharacterNames |
