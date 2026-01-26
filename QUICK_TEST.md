# Quick API Testing Guide

## 🚀 Quick Start

### **Step 1: Create Test Data**

1. Open Supabase SQL Editor
2. Run `supabase/test_data.sql`
3. Verify: Should see "Story created", "Characters created: 3", "Nodes created: 7"

---

### **Step 2: Start Server**

```bash
npm run dev
```

Server will run on `http://localhost:3000`

---

### **Step 3: Get Auth Token**

**Option A: From Browser (Easiest)**
1. Open your app in browser
2. Login with your account
3. Open DevTools (F12)
4. Go to **Application** → **Local Storage** → `http://localhost:3000`
5. Find `sb-<project-id>-auth-token`
6. Copy the `access_token` value

**Option B: From Supabase Dashboard**
1. Go to Supabase → **Authentication** → **Users**
2. Find your user
3. Get user ID (you'll need this for testing)

---

### **Step 4: Test Endpoints**

#### **Method 1: Browser Console (Easiest)**

1. Open browser console (F12)
2. Paste this code (replace `YOUR_TOKEN`):

```javascript
const token = 'YOUR_ACCESS_TOKEN_HERE';
const storyId = 'test-multiverse-story-1';

// Test 1: Join Story
fetch(`http://localhost:3000/api/multiverse/stories/${storyId}/join`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Join Result:', data);
  window.instanceId = data.instanceId;
  
  // Test 2: Get Instance
  return fetch(`http://localhost:3000/api/multiverse/instances/${data.instanceId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
})
.then(r => r.json())
.then(data => {
  console.log('✅ Instance Details:', data);
});
```

---

#### **Method 2: Using cURL**

```bash
# Replace YOUR_TOKEN with actual token
TOKEN="YOUR_ACCESS_TOKEN_HERE"

# Test 1: Join Story
curl -X POST http://localhost:3000/api/multiverse/stories/test-multiverse-story-1/join \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Test 2: Get Instance (replace INSTANCE_ID from previous response)
curl -X GET http://localhost:3000/api/multiverse/instances/INSTANCE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

#### **Method 3: Using Postman/Thunder Client**

**Request 1: Join Story**
- Method: `POST`
- URL: `http://localhost:3000/api/multiverse/stories/test-multiverse-story-1/join`
- Headers:
  - `Authorization: Bearer YOUR_TOKEN`
  - `Content-Type: application/json`

**Request 2: Get Instance**
- Method: `GET`
- URL: `http://localhost:3000/api/multiverse/instances/{instanceId}`
- Headers:
  - `Authorization: Bearer YOUR_TOKEN`

---

## ✅ Expected Results

### **Join Story Response:**
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

### **Get Instance Response:**
```json
{
  "instance": {
    "id": "uuid-here",
    "storyId": "test-multiverse-story-1",
    "status": "WAITING",
    "currentNodeId": null,
    "createdAt": "2026-01-19T..."
  },
  "characters": [
    { "name": "আবির", "id": "uuid" }
  ],
  "myCharacter": {
    "name": "আবির",
    "id": "uuid",
    "description": "A tech-savvy college student...",
    "isRevealed": false
  }
}
```

---

## 🧪 Testing Multiple Users

To test multiple users joining:

1. **Open 3 browser tabs** (or use incognito)
2. **Login with different accounts** (or same account in different tabs)
3. **Run join story in each tab**
4. **Watch instance status change:**
   - User 1: WAITING (2 more needed)
   - User 2: WAITING (1 more needed)
   - User 3: ACTIVE (all joined!)

---

## 🐛 Troubleshooting

### **401 Unauthorized**
- Check token is valid
- Token format: `Bearer <token>` (with space)
- Token might be expired - get new one

### **500 Internal Server Error**
- Check server console for errors
- Verify test data exists in Supabase
- Check database connection

### **Story not found**
- Run `supabase/test_data.sql` again
- Verify story ID: `test-multiverse-story-1`

### **No available characters**
- All characters assigned? Create new instance
- Or reset test data

---

## 📊 Quick Checklist

- [ ] Test data created (`test_data.sql` run)
- [ ] Server running (`npm run dev`)
- [ ] Auth token obtained
- [ ] Join story endpoint tested
- [ ] Get instance endpoint tested
- [ ] Multiple users tested (optional)

---

## 🎯 Next Steps

Once API testing works:
1. ✅ Build frontend components
2. ✅ Implement choice submission
3. ✅ Add real-time sync
4. ✅ Create story reader UI
