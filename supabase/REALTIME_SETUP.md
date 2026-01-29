# Phase 4: Supabase Realtime Setup

পার্সপেক্টিভ ভিত্তিক পুশের জন্য `story_instances` এবং `story_state` টেবিলে Realtime চালু করুন।

## Option A: SQL একবার চালান (সুপারিশ)

**Supabase Dashboard** → **SQL Editor** → New query → নিচের ফাইলটার কনটেন্ট পেস্ট করে **Run** দিন:

**ফাইল:** `supabase/migrations/enable_realtime_and_story_state_rls.sql`

এই স্ক্রিপ্ট করবে:
1. **story_state** এর জন্য RLS policy (যে ইউজার যে instance-এ আছে শুধু সেই instance-এর state দেখতে পারবে)
2. **Realtime** publication-এ `story_instances` ও `story_state` যোগ (ইতিমধ্যে থাকলে স্কিপ করে)

## Option B: Dashboard থেকে

1. **Supabase Dashboard** → আপনার প্রজেক্ট
2. **Database** → **Replication**
3. **Tables** তালিকায় নিচের টেবিলগুলো **Enable** করুন:
   - `story_instances`
   - `story_state`

এ ক্ষেত্রে **story_state** এর জন্য RLS policy আলাদা চালু করতে হবে (নিচের policy টা SQL Editor এ রান করুন):

```sql
CREATE POLICY "Users can view story_state for their instances" ON public.story_state
  FOR SELECT USING (
    instance_id IN (
      SELECT instance_id FROM public.character_assignments
      WHERE user_id = auth.uid()::text
    )
  );
```

## কীভাবে কাজ করে

- ক্লায়েন্ট `story_instances` (filter: `id = instanceId`) এবং `story_state` (filter: `instance_id = instanceId`) এর উপর **postgres_changes** সাবস্ক্রাইব করে।
- যখন `progressStoryInstance` বা অন্য লজিক এই টেবিল আপডেট করে, সব সাবস্ক্রাইবারকে ইভেন্ট যায়।
- প্লে পেজ ইভেন্ট পেলে instance ডেটা রিফেচ করে; MultiverseStoryReader নোড রিফেচ করে এবং ইউজার তার `content_for_you` + শেয়ারড `choices`, `is_ending` পায়।

## Fallback

Realtime চালু না থাকলে প্লে পেজ ও স্টোরি রিডার ৫ সেকেন্ড পর পর পোলিং করবে।
