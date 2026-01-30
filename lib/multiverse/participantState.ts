/**
 * Action-Oriented Narrative: Health, Inventory, Real-time Events
 * Apply damage, emit instance_events for broadcast (health_loss, item_found).
 */

import { getSupabaseServerClient } from '@/lib/supabaseServer'

const DEFAULT_HP = 100

type ChoiceDef = {
  key: string
  text: string
  next_node: string
  dangerous?: boolean
  risk_hp?: number
}

/**
 * Apply HP damage to a participant; emit health_loss event.
 * Returns new health (max 0).
 */
export async function applyHealthDamage(
  instanceId: string,
  userId: string,
  amount: number,
  reason?: string
): Promise<number> {
  if (amount <= 0) return DEFAULT_HP
  const supabase = getSupabaseServerClient()

  const { data: row } = await supabase
    .from('character_assignments')
    .select('health')
    .eq('instance_id', instanceId)
    .eq('user_id', userId)
    .single()

  const current = (row as { health?: number } | null)?.health ?? DEFAULT_HP
  const next = Math.max(0, current - amount)

  await supabase
    .from('character_assignments')
    .update({ health: next })
    .eq('instance_id', instanceId)
    .eq('user_id', userId)

  await supabase.from('instance_events').insert({
    instance_id: instanceId,
    event_type: 'health_loss',
    payload: { user_id: userId, amount, reason, new_health: next },
  })

  return next
}

/**
 * Add item to participant inventory; emit item_found event.
 */
export async function addInventoryItem(
  instanceId: string,
  userId: string,
  itemKey: string
): Promise<string[]> {
  const supabase = getSupabaseServerClient()

  const { data: row } = await supabase
    .from('character_assignments')
    .select('inventory')
    .eq('instance_id', instanceId)
    .eq('user_id', userId)
    .single()

  const inv = (row as { inventory?: string[] } | null)?.inventory ?? []
  const next = Array.isArray(inv) ? [...inv, itemKey] : [itemKey]

  await supabase
    .from('character_assignments')
    .update({ inventory: next })
    .eq('instance_id', instanceId)
    .eq('user_id', userId)

  await supabase.from('instance_events').insert({
    instance_id: instanceId,
    event_type: 'item_found',
    payload: { user_id: userId, item_key: itemKey },
  })

  return next
}

/**
 * Get choice definition risk: risk_hp amount or 10 if dangerous.
 */
export function getChoiceRisk(choice: ChoiceDef): number {
  if (choice.risk_hp != null && choice.risk_hp > 0) return choice.risk_hp
  if (choice.dangerous) return 10
  return 0
}

/**
 * Pick a "dangerous" choice from node choices (for timeout).
 */
export function pickDangerousChoice(choices: ChoiceDef[]): ChoiceDef | null {
  const dangerous = choices.filter((c) => c.dangerous || (c.risk_hp != null && c.risk_hp > 0))
  if (dangerous.length > 0) return dangerous[Math.floor(Math.random() * dangerous.length)]
  return choices.length > 0 ? choices[0] : null
}

/**
 * Count active players (health > 0); spectators (health 0) don't block story progression.
 */
export function countActivePlayers(assignments: Array<{ health?: number | null }>): number {
  return assignments.filter((a) => (a.health ?? 100) > 0).length
}
