# Multiverse Schema Setup Instructions

## ⚠️ Important: Run Schema First, Then Verify!

---

## **Step 1: Create Tables (Run This First!)**

### **File:** `supabase/multiverse_schema.sql`

1. Open Supabase Dashboard → **SQL Editor**
2. Open the file `supabase/multiverse_schema.sql`
3. **Copy the ENTIRE content** of the file
4. Paste it in Supabase SQL Editor
5. Click **RUN** (or press Ctrl+Enter)
6. Wait for "Success" message

**Expected Result:** 
```
Success. No rows returned
```
(This is normal - it's a CREATE statement, not a SELECT)

---

## **Step 2: Verify Tables Were Created**

### **File:** `supabase/QUICK_VERIFY.sql`

1. After Step 1 completes, open `supabase/QUICK_VERIFY.sql`
2. Copy the entire content
3. Paste in Supabase SQL Editor
4. Click **RUN**

**Expected Results:**

```sql
-- Check 1: Should show total_tables = 8
total_tables | table_names
8           | stories, character_templates, story_instances, ...

-- Check 2: Should show rls_enabled_count = 8
rls_enabled_count
8

-- Check 3: Should show policies for each table
tablename              | policy_count
stories                | 1
character_templates    | 0
story_instances        | 1
...

-- Final Summary: Should show all ✅ PASS
tables_check | rls_check | policies_check
✅ PASS      | ✅ PASS   | ✅ PASS
```

---

## **Step 3: If Verification Fails**

### **Problem: Tables still not found**

**Solution:**
1. Check if you ran `multiverse_schema.sql` completely
2. Look for any error messages in SQL Editor
3. Check Supabase Dashboard → **Table Editor** → See if tables appear there
4. If errors occurred, check which table failed and fix the SQL

### **Common Issues:**

#### **Issue 1: "relation already exists"**
- Tables might already exist from previous run
- Solution: Drop and recreate, or use `CREATE TABLE IF NOT EXISTS` (already in SQL)

#### **Issue 2: "permission denied"**
- Check if you're using the correct Supabase project
- Make sure you have admin access

#### **Issue 3: "syntax error"**
- Check for typos in SQL
- Make sure you copied the entire file

---

## **Quick Checklist:**

- [ ] Opened Supabase SQL Editor
- [ ] Copied `multiverse_schema.sql` content
- [ ] Ran the SQL (got "Success" message)
- [ ] Ran `QUICK_VERIFY.sql`
- [ ] Got 8 tables in verification
- [ ] Got RLS enabled on all tables
- [ ] Got policies created

---

## **Manual Verification (Alternative)**

If you want to check manually:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'stories',
    'character_templates', 
    'story_instances',
    'character_assignments',
    'story_nodes',
    'character_chat',
    'user_choices',
    'story_state'
  );
```

Should return **8 rows**.

---

## **Next Steps After Setup:**

Once verification passes:
1. ✅ Database schema is ready
2. ✅ You can start using the multiverse API endpoints
3. ✅ Test `joinStory` function
4. ✅ Create test stories and characters

---

## **Need Help?**

If verification still fails after running the schema:
1. Check Supabase Dashboard → **Table Editor** → See what tables exist
2. Check **Database** → **Tables** → Look for multiverse tables
3. Share the error message you're getting
