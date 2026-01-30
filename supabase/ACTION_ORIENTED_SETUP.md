# Action-Oriented Narrative (Adrenaline Rush)

Real-time Survival Timer, HP Bar, Inventory, and instance_events broadcast.

## 1. Migration (run once)

**Supabase SQL Editor** → run: `supabase/migrations/add_health_inventory_and_events.sql`

- **character_assignments:** `health` (default 100), `inventory` (jsonb default [])
- **instance_events:** table for broadcasting `health_loss`, `item_found` to all players
- **Realtime:** `instance_events` added to publication

## 2. Behaviour

- **15-second Choice Timer:** When choices appear, a red countdown runs. If the user doesn’t choose in 15s, the backend picks a “dangerous” choice (timeout API) and may apply HP damage.
- **HP Bar:** Each participant has `health` (0–100). Risky choices (node choice `dangerous: true` or `risk_hp: N`) reduce HP. At 0, the user is a spectator (no choices).
- **Active players:** Only participants with `health > 0` are counted for “all choices in” → story progression. Spectators do not block.
- **instance_events:** On health change or item found, an event is inserted; clients subscribed to the instance get it and can refetch (e.g. HP bar).

## 3. Node choice shape (optional)

In `story_nodes.choices` you can add:

- `dangerous: true` — timeout or selection can apply default risk (e.g. 10 HP)
- `risk_hp: number` — exact HP to subtract when this choice is taken

## 4. Loot / Inventory (Phase 2)

- `participantState.addInventoryItem(instanceId, userId, itemKey)` is implemented.
- Add an API (e.g. POST `/api/.../inventory`) and story nodes that grant items and gates that require items (e.g. “need_key”) when you want full loot flow.
