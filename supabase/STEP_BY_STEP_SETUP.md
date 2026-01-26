# Step-by-Step: Multiverse Schema Setup

## 🎯 Current Situation
You're seeing "No rows returned" because **tables haven't been created yet**. 

---

## ✅ **STEP 1: Create All Tables**

### **What to do:**
1. Open file: `supabase/multiverse_schema.sql`
2. **Select ALL content** (Ctrl+A)
3. **Copy** (Ctrl+C)
4. Go to Supabase Dashboard → **SQL Editor**
5. **Paste** the entire SQL script
6. Click **RUN** button (or press Ctrl+Enter)

### **What you'll see:**
```
Success. No rows returned
```
✅ **This is CORRECT!** CREATE statements don't return rows.

### **What happens:**
- Creates 8 tables
- Sets up indexes
- Enables RLS
- Creates policies

---

## ✅ **STEP 2: Verify Tables Exist**

### **After Step 1 completes, run this:**

```sql
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

### **Expected Result:**
Should show **8 rows**:
- stories
- character_templates
- story_instances
- character_assignments
- story_nodes
- character_chat
- user_choices
- story_state

---

## ✅ **STEP 3: Full Verification**

Run the complete verification:

1. Open `supabase/QUICK_VERIFY.sql`
2. Copy entire content
3. Paste in SQL Editor
4. Run

### **Expected Results:**

**Check 1:**
```
total_tables: 8
```

**Check 2:**
```
rls_enabled_count: 8
```

**Final Summary:**
```
tables_check: ✅ PASS
rls_check: ✅ PASS
policies_check: ✅ PASS
```

---

## 🔍 **Alternative: Check in Table Editor**

If you want to see tables visually:

1. Supabase Dashboard → **Table Editor** (left sidebar)
2. You should see all 8 tables listed:
   - stories
   - character_templates
   - story_instances
   - character_assignments
   - story_nodes
   - character_chat
   - user_choices
   - story_state

---

## ⚠️ **If Still Getting "No rows returned":**

### **Check these:**

1. **Did you run the CREATE script?**
   - Make sure you ran `multiverse_schema.sql` completely
   - Check for any error messages

2. **Check Table Editor:**
   - Go to Supabase → Table Editor
   - See if tables appear there

3. **Check for errors:**
   - Look at SQL Editor history
   - See if any CREATE statement failed

4. **Try this test:**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
   - This shows ALL tables in public schema
   - Look for multiverse tables in the list

---

## 📋 **Quick Checklist:**

- [ ] Opened `multiverse_schema.sql` file
- [ ] Copied ENTIRE content (all 147 lines)
- [ ] Pasted in Supabase SQL Editor
- [ ] Clicked RUN
- [ ] Got "Success" message
- [ ] Ran verification query
- [ ] Got 8 tables in results

---

## 🎉 **Once Verified:**

After you see 8 tables:
1. ✅ Schema is ready
2. ✅ You can test API endpoints
3. ✅ You can create test stories
4. ✅ Multiverse system is ready!

---

## 💡 **Pro Tip:**

If you're unsure if tables were created:
- Go to **Table Editor** in Supabase
- You'll see all tables visually
- Much easier than SQL queries!
