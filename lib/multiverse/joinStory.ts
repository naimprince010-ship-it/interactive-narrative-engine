/**
 * Multiverse Story Join Logic
 * Handles character assignment and instance management
 */

import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { processBotChoices } from '@/lib/multiverse/botLogic'

type JoinStoryResult = {
  instanceId: string
  characterName: string
  characterId: string
  currentNodeId: string | null
  instanceStatus: 'WAITING' | 'ACTIVE' | 'COMPLETED'
  message: string
}

/**
 * Join a story - finds available instance or creates new one
 * Assigns character secretly to user
 */
export async function joinStory(
  userId: string,
  storyId: string
): Promise<JoinStoryResult> {
  const supabase = getSupabaseServerClient()

  // Step 1: Check if user already in an active instance of this story
  const { data: existingAssignment } = await supabase
    .from('character_assignments')
    .select('instance_id, story_instances!inner(status)')
    .eq('user_id', userId)
    .eq('story_instances.story_id', storyId)
    .eq('story_instances.status', 'ACTIVE')
    .maybeSingle()

  if (existingAssignment) {
    // User already in active instance, return that
    const { data: instance } = await supabase
      .from('story_instances')
      .select('id, current_node_id, status')
      .eq('id', existingAssignment.instance_id)
      .single()

    const { data: character } = await supabase
      .from('character_assignments')
      .select('character_templates!inner(name, id)')
      .eq('instance_id', existingAssignment.instance_id)
      .eq('user_id', userId)
      .single()

    // Type-safe character template extraction
    if (!character) {
      throw new Error('Character assignment not found')
    }

    const template = Array.isArray(character.character_templates)
      ? character.character_templates[0]
      : character.character_templates

    if (!template) {
      throw new Error('Character template not found')
    }

    return {
      instanceId: instance!.id,
      characterName: template.name || '',
      characterId: template.id || '',
      currentNodeId: instance!.current_node_id,
      instanceStatus: instance!.status as 'WAITING' | 'ACTIVE' | 'COMPLETED',
      message: 'Already in active story instance',
    }
  }

  // Step 2: Find available instance with empty slot
  const { data: story } = await supabase
    .from('stories')
    .select('id, max_players')
    .eq('id', storyId)
    .single()

  if (!story) {
    throw new Error('Story not found')
  }

  // Get instances with available slots
  const { data: instances } = await supabase
    .from('story_instances')
    .select('id, status')
    .eq('story_id', storyId)
    .in('status', ['WAITING', 'ACTIVE'])
    .order('created_at', { ascending: true })

  let targetInstanceId: string | null = null

  // Check each instance for available slots
  for (const instance of instances || []) {
    const { count } = await supabase
      .from('character_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('instance_id', instance.id)

    if ((count || 0) < story.max_players) {
      targetInstanceId = instance.id
      break
    }
  }

  // Step 3: If no available instance, create new one
  if (!targetInstanceId) {
    const { data: newInstance, error: instanceError } = await supabase
      .from('story_instances')
      .insert({
        story_id: storyId,
        status: 'WAITING',
        current_node_id: null, // Will be set when story starts
      })
      .select()
      .single()

    if (instanceError || !newInstance) {
      throw new Error(`Failed to create instance: ${instanceError?.message}`)
    }

    targetInstanceId = newInstance.id
  }

  // Step 4: Get unassigned characters in this instance
  const { data: assignedCharacters } = await supabase
    .from('character_assignments')
    .select('template_id')
    .eq('instance_id', targetInstanceId)

  const assignedIds = (assignedCharacters || []).map((a) => a.template_id)

  // Get available characters (not yet assigned in this instance)
  let availableCharactersQuery = supabase
    .from('character_templates')
    .select('id, name')
    .eq('story_id', storyId)

  if (assignedIds.length > 0) {
    availableCharactersQuery = availableCharactersQuery.not('id', 'in', `(${assignedIds.join(',')})`)
  }

  const { data: availableCharacters } = await availableCharactersQuery

  if (!availableCharacters || availableCharacters.length === 0) {
    throw new Error('No available characters in story')
  }

  // Step 5: Randomly assign character
  const randomIndex = Math.floor(Math.random() * availableCharacters.length)
  const assignedCharacter = availableCharacters[randomIndex]

  // Step 6: Create character assignment (SECRET - isRevealed = false)
  const { data: assignment, error: assignError } = await supabase
    .from('character_assignments')
    .insert({
      user_id: userId,
      instance_id: targetInstanceId,
      template_id: assignedCharacter.id,
      is_revealed: false,
    })
    .select()
    .single()

  if (assignError || !assignment) {
    throw new Error(`Failed to assign character: ${assignError?.message}`)
  }

  // Step 7: Fill remaining slots with bot players
  const { count: playerCount } = await supabase
    .from('character_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('instance_id', targetInstanceId)

  const slotsRemaining = story.max_players - (playerCount || 0)

  // Fill empty slots with bots
  if (slotsRemaining > 0) {
    // Get remaining unassigned characters
    const { data: allAssignedChars } = await supabase
      .from('character_assignments')
      .select('template_id')
      .eq('instance_id', targetInstanceId)

    const allAssignedIds = (allAssignedChars || []).map((a) => a.template_id)

    // Get all characters for the story
    const { data: allCharacters } = await supabase
      .from('character_templates')
      .select('id, name')
      .eq('story_id', storyId)

    // Filter out already assigned characters
    const remainingCharacters = (allCharacters || []).filter(
      (char) => !allAssignedIds.includes(char.id)
    )

    // Assign bots to remaining characters
    if (remainingCharacters && remainingCharacters.length > 0) {
      const botsToCreate = Math.min(slotsRemaining, remainingCharacters.length)
      
      for (let i = 0; i < botsToCreate; i++) {
        const botCharacter = remainingCharacters[i]
        const botUserId = `bot_${targetInstanceId}_${botCharacter.id}`

        await supabase
          .from('character_assignments')
          .insert({
            user_id: botUserId,
            instance_id: targetInstanceId,
            template_id: botCharacter.id,
            is_revealed: false,
          })
      }
    }
  }

  // Step 8: Check if instance is now full, update status
  const { count: finalPlayerCount } = await supabase
    .from('character_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('instance_id', targetInstanceId)

  if (finalPlayerCount === story.max_players) {
    // All slots filled, activate instance
    await supabase
      .from('story_instances')
      .update({ status: 'ACTIVE' })
      .eq('id', targetInstanceId)

    // Set starting node if not set
    const { data: instance } = await supabase
      .from('story_instances')
      .select('current_node_id')
      .eq('id', targetInstanceId)
      .single()

    if (!instance?.current_node_id) {
      // Get starting node for story
      const { data: startNode } = await supabase
        .from('story_nodes')
        .select('id')
        .eq('story_id', storyId)
        .eq('node_key', 'start')
        .maybeSingle()

      if (startNode) {
        await supabase
          .from('story_instances')
          .update({ current_node_id: startNode.id })
          .eq('id', targetInstanceId)

        // Trigger bot choices for starting node (async, don't wait)
        setTimeout(() => {
          processBotChoices(targetInstanceId, startNode.id).catch((error) => {
            console.error('Bot choice processing error:', error)
          })
        }, 2000) // Wait 2 seconds after story starts
      }
    }
  }

  // Step 8: Get current instance state
  if (!targetInstanceId) {
    throw new Error('Failed to get or create instance')
  }

  const { data: finalInstance } = await supabase
    .from('story_instances')
    .select('id, current_node_id, status')
    .eq('id', targetInstanceId)
    .single()

  return {
    instanceId: targetInstanceId,
    characterName: assignedCharacter.name,
    characterId: assignedCharacter.id,
    currentNodeId: finalInstance?.current_node_id || null,
    instanceStatus: (finalInstance?.status as 'WAITING' | 'ACTIVE' | 'COMPLETED') || 'WAITING',
    message: finalPlayerCount === story.max_players
      ? 'Story instance activated! All players joined.'
      : `Waiting for ${story.max_players - (finalPlayerCount || 0)} more players...`,
  }
}
