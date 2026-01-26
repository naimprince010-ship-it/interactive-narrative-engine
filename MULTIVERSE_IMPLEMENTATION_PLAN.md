# Multiverse Implementation Plan

## 🎯 Core Concept Recap

**Multiverse Interactive Storytelling:**
- Multiple users join same story
- Each user secretly assigned a character
- Anonymous interaction (character names only)
- Collective choices create story branches
- Multiple instances = multiverse timelines

---

## 📋 Implementation Steps

### **Phase 1: Database Setup**

#### **Step 1.1: Prisma Setup**
1. Install Prisma: `npm install prisma @prisma/client`
2. Initialize: `npx prisma init`
3. Configure schema (already created)
4. Generate client: `npx prisma generate`
5. Migrate: `npx prisma migrate dev --name init`

#### **Step 1.2: Supabase Integration**
- Use Supabase PostgreSQL
- Set `DATABASE_URL` in `.env`
- Run migrations in Supabase SQL Editor

---

### **Phase 2: Core Logic**

#### **Step 2.1: Character Assignment Logic**

**Function: `joinStory(userId, storyId)`**

```typescript
1. Find available instance:
   - Status = "WAITING" or "ACTIVE"
   - Has empty character slot (< maxPlayers)
   - Same storyId

2. If found:
   - Get unassigned characters in that instance
   - Randomly assign one to user
   - Create CharacterAssignment (isRevealed = false)

3. If not found:
   - Create new StoryInstance
   - Get all characters for story
   - Randomly assign first character to user
   - Set instance status = "WAITING"

4. Return:
   - instanceId
   - characterName (but don't reveal it's theirs)
   - current node
```

#### **Step 2.2: Story Node Rendering**

**Function: `getStoryNodeForUser(instanceId, userId)`**

```typescript
1. Get user's character assignment
2. Get current story node
3. Filter content based on character perspective
4. Show character-specific choices
5. Return personalized node
```

#### **Step 2.3: Choice Submission**

**Function: `submitChoice(instanceId, userId, nodeId, choiceKey)`**

```typescript
1. Save UserChoice
2. Check if all users in instance have chosen
3. If all chosen:
   - Aggregate all choices
   - Determine next node (based on choice combination)
   - Update StoryInstance.currentNodeId
   - Update StoryState
4. Broadcast update to all users in instance
```

#### **Step 2.4: Choice Aggregation**

**Function: `aggregateChoices(instanceId, nodeId)`**

```typescript
1. Get all UserChoices for this node
2. Map choices by character
3. Determine next node:
   - If all agree → Standard path
   - If conflict → Create/use conflict branch
   - If mixed → Use weighted path
4. Return next node ID
```

---

### **Phase 3: API Endpoints**

#### **`POST /api/multiverse/stories/:storyId/join`**
- Join story, get character assignment
- Returns: `{ instanceId, characterName, currentNode }`

#### **`GET /api/multiverse/instances/:instanceId`**
- Get current story state
- Returns: `{ node, characters, status }`

#### **`POST /api/multiverse/instances/:instanceId/choices`**
- Submit choice
- Body: `{ nodeId, choiceKey }`

#### **`GET /api/multiverse/instances/:instanceId/node`**
- Get current node (character-specific view)

#### **`POST /api/multiverse/instances/:instanceId/chat`**
- Send chat message (as character)

#### **`GET /api/multiverse/instances/:instanceId/chat`**
- Get chat history

---

### **Phase 4: Frontend Components**

#### **Components Needed:**
1. `MultiverseStoryReader.tsx` - Main story view
2. `CharacterChat.tsx` - Anonymous chat panel
3. `ChoicePanel.tsx` - Character-specific choices
4. `InstanceStatus.tsx` - Show other characters' status
5. `CharacterReveal.tsx` - Reveal screen

---

### **Phase 5: Real-time Sync**

#### **Socket.io Integration:**
- Story state updates
- Chat messages
- Choice submissions
- Character reveals

---

## 🔄 User Flow

```
1. User browses stories
   ↓
2. Clicks "Join Story"
   ↓
3. System assigns character (secret)
   ↓
4. User sees story from character perspective
   ↓
5. Other users join same instance
   ↓
6. All see story, make choices
   ↓
7. Choices aggregate → Story progresses
   ↓
8. Chat as characters (anonymous)
   ↓
9. Story branches based on collective choices
   ↓
10. Character reveal at climax
   ↓
11. Story ends → Show multiverse comparison
```

---

## 🗄️ Database Queries

### **Find Available Instance:**
```sql
SELECT * FROM story_instances
WHERE story_id = $1
  AND status IN ('WAITING', 'ACTIVE')
  AND (
    SELECT COUNT(*) FROM character_assignments
    WHERE instance_id = story_instances.id
  ) < max_players
LIMIT 1;
```

### **Get Unassigned Characters:**
```sql
SELECT ct.* FROM character_templates ct
WHERE ct.story_id = $1
  AND ct.id NOT IN (
    SELECT template_id FROM character_assignments
    WHERE instance_id = $2
  );
```

---

## 🎯 Next Steps

1. ✅ Create `.cursorrules`
2. ✅ Create Prisma schema
3. ⏳ Install Prisma dependencies
4. ⏳ Run migrations
5. ⏳ Implement `joinStory` logic
6. ⏳ Create API endpoints
7. ⏳ Build frontend components
