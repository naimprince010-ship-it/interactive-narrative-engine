# API Testing Guide - Multiverse System

## 🎯 Prerequisites

1. ✅ Database schema setup complete
2. ✅ Test data created (run `supabase/test_data.sql`)
3. ✅ User authentication working (Supabase Auth)
4. ✅ Server running (`npm run dev`)

---

## 📋 Test Data Setup

### **Step 1: Create Test Data**

Run this SQL in Supabase SQL Editor:

```sql
-- File: supabase/test_data.sql
-- This creates:
-- - 1 test story: "The Phone Call Mystery"
-- - 3 characters: আবির, নীলা, রাহুল
-- - Multiple story nodes with choices
```

---

## 🔌 API Endpoints to Test

### **1. Join Story Endpoint**

**Endpoint:** `POST /api/multiverse/stories/[storyId]/join`

**Purpose:** User joins a story and gets assigned a character

**Request:**
```bash
POST http://localhost:3000/api/multiverse/stories/test-multiverse-story-1/join
Headers:
  Authorization: Bearer <supabase_access_token>
```

**Expected Response:**
```json
{
  "success": true,
  "instanceId": "uuid-here",
  "characterName": "আবির",
  "characterId": "uuid-here",
  "currentNodeId": null,
  "instanceStatus": "WAITING",
  "message": "Waiting for 2 more players..."
}
```

**Test Cases:**
1. ✅ First user joins → Creates new instance, assigned character
2. ✅ Second user joins → Joins same instance, different character
3. ✅ Third user joins → Instance becomes ACTIVE
4. ✅ Fourth user joins → Creates new instance (max 3 players)

---

### **2. Get Instance Details**

**Endpoint:** `GET /api/multiverse/instances/[instanceId]`

**Purpose:** Get current story state and character info

**Request:**
```bash
GET http://localhost:3000/api/multiverse/instances/{instanceId}
Headers:
  Authorization: Bearer <supabase_access_token>
```

**Expected Response:**
```json
{
  "instance": {
    "id": "uuid-here",
    "storyId": "test-multiverse-story-1",
    "status": "ACTIVE",
    "currentNodeId": "uuid-here",
    "createdAt": "2026-01-19T..."
  },
  "characters": [
    {
      "name": "আবির",
      "id": "uuid-here"
    },
    {
      "name": "নীলা",
      "id": "uuid-here"
    },
    {
      "name": "রাহুল",
      "id": "uuid-here"
    }
  ],
  "myCharacter": {
    "name": "আবির",
    "id": "uuid-here",
    "description": "A tech-savvy college student...",
    "isRevealed": false
  }
}
```

**Test Cases:**
1. ✅ Get instance as participant → Returns full details
2. ✅ Get instance as non-participant → Returns 403 Forbidden
3. ✅ Get instance without auth → Returns 401 Unauthorized

---

## 🧪 Testing Methods

### **Method 1: Using cURL (Terminal)**

```bash
# 1. Get auth token first (from Supabase)
# Login via your app and get the access token

# 2. Join story
curl -X POST http://localhost:3000/api/multiverse/stories/test-multiverse-story-1/join \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# 3. Get instance details
curl -X GET http://localhost:3000/api/multiverse/instances/INSTANCE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### **Method 2: Using Postman/Thunder Client**

1. **Create Request:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/multiverse/stories/test-multiverse-story-1/join`
   - Headers:
     - `Authorization: Bearer YOUR_ACCESS_TOKEN`
     - `Content-Type: application/json`

2. **Send Request** and check response

---

### **Method 3: Using Browser Console (Frontend)**

```javascript
// In browser console (after login)
const token = 'YOUR_SUPABASE_ACCESS_TOKEN';

// Join story
fetch('http://localhost:3000/api/multiverse/stories/test-multiverse-story-1/join', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Join result:', data);
  // Save instanceId for next request
  window.instanceId = data.instanceId;
});

// Get instance details
fetch(`http://localhost:3000/api/multiverse/instances/${window.instanceId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('Instance:', data));
```

---

### **Method 4: Create Test Script**

Create `test-api.js`:

```javascript
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const STORY_ID = 'test-multiverse-story-1';
const TOKEN = 'YOUR_ACCESS_TOKEN'; // Get from Supabase

async function testJoinStory() {
  const response = await fetch(`${BASE_URL}/api/multiverse/stories/${STORY_ID}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('Join Story:', data);
  return data.instanceId;
}

async function testGetInstance(instanceId) {
  const response = await fetch(`${BASE_URL}/api/multiverse/instances/${instanceId}`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`
    }
  });
  
  const data = await response.json();
  console.log('Get Instance:', data);
}

// Run tests
(async () => {
  try {
    const instanceId = await testJoinStory();
    await testGetInstance(instanceId);
  } catch (error) {
    console.error('Test failed:', error);
  }
})();
```

Run: `node test-api.js`

---

## ✅ Expected Test Results

### **Test 1: First User Joins**
- ✅ Creates new `story_instances` record
- ✅ Status = "WAITING"
- ✅ Creates `character_assignments` record
- ✅ Returns character name (secretly assigned)
- ✅ Message: "Waiting for 2 more players..."

### **Test 2: Second User Joins**
- ✅ Joins same instance
- ✅ Gets different character
- ✅ Message: "Waiting for 1 more player..."

### **Test 3: Third User Joins**
- ✅ Joins same instance
- ✅ Gets last character
- ✅ Instance status changes to "ACTIVE"
- ✅ `current_node_id` set to "start" node
- ✅ Message: "Story instance activated! All players joined."

### **Test 4: Get Instance**
- ✅ Returns instance details
- ✅ Shows all 3 characters
- ✅ Shows user's own character (with description)
- ✅ `isRevealed: false` (character identity secret)

---

## 🐛 Common Issues & Solutions

### **Issue 1: 401 Unauthorized**
**Problem:** Missing or invalid auth token

**Solution:**
- Get valid Supabase access token
- Check token format: `Bearer <token>`
- Verify token hasn't expired

### **Issue 2: 500 Internal Server Error**
**Problem:** Database query failed

**Solution:**
- Check if test data exists
- Verify story ID: `test-multiverse-story-1`
- Check Supabase logs for errors

### **Issue 3: Story not found**
**Problem:** Story doesn't exist in database

**Solution:**
- Run `supabase/test_data.sql` again
- Verify story exists: `SELECT * FROM stories WHERE id = 'test-multiverse-story-1';`

### **Issue 4: No available characters**
**Problem:** All characters already assigned

**Solution:**
- Create new story instance
- Or reset test data

---

## 📊 Testing Checklist

- [ ] Test data created in Supabase
- [ ] Server running (`npm run dev`)
- [ ] Auth token obtained
- [ ] First user joins story
- [ ] Second user joins story
- [ ] Third user joins story (instance activates)
- [ ] Get instance details
- [ ] Verify character assignment (secret)
- [ ] Test error cases (unauthorized, not found)

---

## 🚀 Next Steps After Testing

Once API endpoints work:
1. ✅ Build frontend components
2. ✅ Implement choice submission
3. ✅ Add real-time sync (Socket.io)
4. ✅ Create story node rendering
5. ✅ Implement choice aggregation

---

## 💡 Tips

1. **Use multiple browser tabs** to simulate multiple users
2. **Check Supabase Table Editor** to see data being created
3. **Use browser DevTools Network tab** to inspect requests
4. **Check server console** for any errors
5. **Verify database** after each test

---

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________

✅ Join Story (User 1): PASS/FAIL
✅ Join Story (User 2): PASS/FAIL
✅ Join Story (User 3): PASS/FAIL
✅ Get Instance: PASS/FAIL
✅ Error Handling: PASS/FAIL

Notes:
_________________________________
_________________________________
```
