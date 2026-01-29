/**
 * Phase 2: progressStoryInstance(instanceId)
 * Trigger: all users have chosen OR timer expired.
 * Steps: load instance/template/node/choices → next node (pre-defined or AI branch)
 *        → buffer → prompt + OpenAI → JSON parse → DB update.
 */

import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { processBotChoices } from './botLogic'
import {
  buildOrchestratorPrompt,
  callOrchestrator,
  type CharacterProfile,
  type ChoiceByCharacter,
  type OrchestratorOutput,
} from './aiOrchestrator'

const NODE_HISTORY_MAX = 3
const SUMMARY_MAX_LEN = 150

type InstanceRow = {
  id: string
  story_id: string
  status: string
  current_node_id: string | null
}

type NodeRow = {
  id: string
  node_key: string
  title: string
  content: string
  choices: Array<{ key: string; text: string; next_node: string }> | null
  is_ending: boolean
}

type TemplateShape = { name: string; description?: string }

type AssignmentRow = {
  user_id: string
  template_id: string
  character_templates: TemplateShape | TemplateShape[]
}

type UserChoiceRow = {
  user_id: string
  choice_key: string
}

type StoryStateData = {
  node_history?: Array<{ node_key: string; title: string; summary: string }>
  current_ai_content?: { character_perspectives: Record<string, string>; narrator_summary: string }
  current_ai_node_id?: string
}

/**
 * Load instance, story, current node, assignments (with character name/description), choices for current node.
 */
async function loadInstanceData(instanceId: string) {
  const supabase = getSupabaseServerClient()

  const { data: instance, error: instErr } = await supabase
    .from('story_instances')
    .select('id, story_id, status, current_node_id')
    .eq('id', instanceId)
    .single()

  if (instErr || !instance) {
    throw new Error(`Instance not found: ${instanceId}`)
  }

  if ((instance as InstanceRow).status !== 'ACTIVE') {
    return null
  }

  const currentNodeId = (instance as InstanceRow).current_node_id
  if (!currentNodeId) {
    return null
  }

  const { data: story } = await supabase
    .from('stories')
    .select('id, title')
    .eq('id', (instance as InstanceRow).story_id)
    .single()

  const { data: currentNode, error: nodeErr } = await supabase
    .from('story_nodes')
    .select('id, node_key, title, content, choices, is_ending')
    .eq('id', currentNodeId)
    .single()

  if (nodeErr || !currentNode) {
    throw new Error(`Current node not found: ${currentNodeId}`)
  }

  const { data: assignments } = await supabase
    .from('character_assignments')
    .select('user_id, template_id, character_templates!inner(name, description)')
    .eq('instance_id', instanceId)

  const { data: userChoices } = await supabase
    .from('user_choices')
    .select('user_id, choice_key')
    .eq('instance_id', instanceId)
    .eq('node_id', currentNodeId)

  const { count: totalPlayers } = await supabase
    .from('character_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('instance_id', instanceId)

  const choiceCount = userChoices?.length ?? 0
  if (choiceCount < (totalPlayers ?? 0)) {
    return null
  }

  const choices = (currentNode as NodeRow).choices as Array<{ key: string; text: string; next_node: string }> | null
  const choicesByCharacter: ChoiceByCharacter[] = []
  const characterProfiles: CharacterProfile[] = []

  for (const a of assignments || []) {
    const ct = (a as AssignmentRow).character_templates
    const t: TemplateShape | undefined = Array.isArray(ct) ? ct[0] : ct
    const name = t?.name || ''
    const desc = t?.description || ''
    characterProfiles.push({ name, description: desc })

    const uc = userChoices?.find((c: UserChoiceRow) => c.user_id === (a as AssignmentRow).user_id)
    if (uc) {
      const choiceDef = choices?.find((c) => c.key === (uc as UserChoiceRow).choice_key)
      choicesByCharacter.push({
        character_name: name,
        choice_key: (uc as UserChoiceRow).choice_key,
        choice_text: choiceDef?.text || (uc as UserChoiceRow).choice_key,
      })
    }
  }

  return {
    instance: instance as InstanceRow,
    story,
    currentNode: currentNode as NodeRow,
    assignments: (assignments || []) as AssignmentRow[],
    userChoices: (userChoices || []) as UserChoiceRow[],
    characterProfiles,
    choicesByCharacter,
    choices,
  }
}

/**
 * Build buffer from story_state.state_data.node_history (last NODE_HISTORY_MAX).
 */
function getBuffer(stateData: StoryStateData | null): Array<{ node_key: string; title: string; summary: string }> {
  const history = stateData?.node_history ?? []
  return history.slice(-NODE_HISTORY_MAX)
}

/**
 * Append current node to node_history and trim to last NODE_HISTORY_MAX.
 */
function appendToNodeHistory(
  current: Array<{ node_key: string; title: string; summary: string }>,
  node: NodeRow
): Array<{ node_key: string; title: string; summary: string }> {
  const summary = (node.content || node.title).slice(0, SUMMARY_MAX_LEN)
  const next = [...current, { node_key: node.node_key, title: node.title, summary }]
  return next.slice(-NODE_HISTORY_MAX)
}

/**
 * All users chose the same choice_key.
 */
function allSameChoice(choicesByCharacter: ChoiceByCharacter[]): { same: boolean; choiceKey?: string } {
  if (choicesByCharacter.length === 0) return { same: false }
  const first = choicesByCharacter[0].choice_key
  const same = choicesByCharacter.every((c) => c.choice_key === first)
  return same ? { same: true, choiceKey: first } : { same: false }
}

/**
 * Get pre-defined next node id from current node choices.
 */
async function getPredefinedNextNodeId(
  storyId: string,
  choices: NodeRow['choices'],
  choiceKey: string
): Promise<string | null> {
  if (!choices || !Array.isArray(choices)) return null
  const choice = choices.find((c) => c.key === choiceKey)
  if (!choice?.next_node) return null

  const supabase = getSupabaseServerClient()
  const { data: nextNode } = await supabase
    .from('story_nodes')
    .select('id')
    .eq('story_id', storyId)
    .eq('node_key', choice.next_node)
    .maybeSingle()

  return (nextNode as { id: string } | null)?.id ?? null
}

/**
 * Upsert story_state: node_history, optional current_ai_content + current_ai_node_id.
 */
async function upsertStoryState(
  instanceId: string,
  nodeHistory: Array<{ node_key: string; title: string; summary: string }>,
  currentAiContent?: { character_perspectives: Record<string, string>; narrator_summary: string },
  currentAiNodeId?: string
) {
  const supabase = getSupabaseServerClient()

  const { data: existing } = await supabase
    .from('story_state')
    .select('id, state_data')
    .eq('instance_id', instanceId)
    .maybeSingle()

  const stateData: StoryStateData = {
    ...((existing?.state_data as StoryStateData) ?? {}),
    node_history: nodeHistory,
  }
  if (currentAiContent !== undefined) stateData.current_ai_content = currentAiContent
  else delete stateData.current_ai_content
  if (currentAiNodeId !== undefined) stateData.current_ai_node_id = currentAiNodeId
  else delete stateData.current_ai_node_id

  if (existing) {
    await supabase
      .from('story_state')
      .update({ state_data: stateData, updated_at: new Date().toISOString() })
      .eq('instance_id', instanceId)
  } else {
    await supabase.from('story_state').insert({
      instance_id: instanceId,
      current_node_id: null,
      state_data: stateData,
      updated_at: new Date().toISOString(),
    })
  }
}

/**
 * Phase 2: progressStoryInstance(instanceId)
 * Call when all users have submitted choices (or timer expired).
 */
export async function progressStoryInstance(instanceId: string): Promise<void> {
  const supabase = getSupabaseServerClient()

  const data = await loadInstanceData(instanceId)
  if (!data) {
    return
  }

  const { instance, story, currentNode, characterProfiles, choicesByCharacter, choices } = data

  if (currentNode.is_ending) {
    await supabase
      .from('story_instances')
      .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
      .eq('id', instanceId)
    return
  }

  const { data: stateRow } = await supabase
    .from('story_state')
    .select('state_data')
    .eq('instance_id', instanceId)
    .maybeSingle()

  const stateData = (stateRow?.state_data as StoryStateData) ?? null
  const buffer = getBuffer(stateData)
  const nodeHistory = appendToNodeHistory(stateData?.node_history ?? [], currentNode)

  const same = allSameChoice(choicesByCharacter)

  if (same.same && same.choiceKey) {
    const nextNodeId = await getPredefinedNextNodeId(instance.story_id, choices, same.choiceKey)
    if (nextNodeId) {
      await supabase
        .from('story_instances')
        .update({ current_node_id: nextNodeId })
        .eq('id', instanceId)

      await upsertStoryState(instanceId, nodeHistory, undefined, undefined)

      const { data: nextNode } = await supabase
        .from('story_nodes')
        .select('id, choices')
        .eq('id', nextNodeId)
        .single()

      if (nextNode && (nextNode as NodeRow).choices?.length) {
        setTimeout(() => {
          processBotChoices(instanceId, nextNodeId).catch((e) => console.error('[progressStoryInstance] bot choices:', e))
        }, 2000)
      }
      return
    }
  }

  const storyTitle = (story as { title?: string })?.title ?? 'Story'
  const prompt = buildOrchestratorPrompt(
    storyTitle,
    currentNode.title,
    currentNode.content,
    characterProfiles,
    buffer,
    choicesByCharacter
  )

  let output: OrchestratorOutput
  try {
    output = await callOrchestrator(prompt)
  } catch (e) {
    console.error('[progressStoryInstance] Orchestrator error:', e)
    output = {
      character_perspectives: { Default: 'The story continues.' },
      narrator_summary: 'The group moves on.',
      next_node: 'ai_branch_fallback',
    }
  }

  const nextNodeKey = output.next_node.replace(/\s/g, '_')
  const { data: existingNode } = await supabase
    .from('story_nodes')
    .select('id')
    .eq('story_id', instance.story_id)
    .eq('node_key', nextNodeKey)
    .maybeSingle()

  let nextNodeId: string

  if (existingNode) {
    nextNodeId = (existingNode as { id: string }).id
  } else {
    const { data: newNode, error: insertErr } = await supabase
      .from('story_nodes')
      .insert({
        story_id: instance.story_id,
        node_key: nextNodeKey,
        title: 'AI Branch',
        content: output.narrator_summary,
        choices: [],
        is_ending: false,
      })
      .select('id')
      .single()

    if (insertErr || !newNode) {
      console.error('[progressStoryInstance] Failed to create AI node:', insertErr)
      return
    }
    nextNodeId = (newNode as { id: string }).id
  }

  await supabase
    .from('story_instances')
    .update({ current_node_id: nextNodeId })
    .eq('id', instanceId)

  await upsertStoryState(instanceId, nodeHistory, {
    character_perspectives: output.character_perspectives,
    narrator_summary: output.narrator_summary,
  }, nextNodeId)

  console.log(`[progressStoryInstance] ✅ Instance ${instanceId} progressed to AI branch: ${nextNodeKey}`)
}
