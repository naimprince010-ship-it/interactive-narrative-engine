/**
 * Bot Logic for Multiverse Stories
 * Handles automatic choice-making for bot players
 */

import { getSupabaseServerClient } from '@/lib/supabaseServer'

/**
 * Process bot choices for a given node
 * Bots will make choices after a random delay (2-5 seconds) to seem human-like
 */
export async function processBotChoices(instanceId: string, nodeId: string) {
  const supabase = getSupabaseServerClient()

  console.log(`[botLogic] 🔵 Starting bot choices processing for instance ${instanceId}, node ${nodeId}`)

  try {
    // Get all bot players in this instance
    const { data: botAssignments, error: botQueryError } = await supabase
      .from('character_assignments')
      .select('user_id, template_id, character_templates!inner(name, id)')
      .eq('instance_id', instanceId)
      .like('user_id', 'bot_%')

    if (botQueryError) {
      console.error(`[botLogic] ❌ Error querying bot assignments:`, botQueryError)
      return
    }

    if (!botAssignments || botAssignments.length === 0) {
      console.log(`[botLogic] ⚠️ No bots found in instance ${instanceId}`)
      // Debug: Check all assignments to see what's there
      const { data: allAssignments } = await supabase
        .from('character_assignments')
        .select('user_id')
        .eq('instance_id', instanceId)
      console.log(`[botLogic] 📊 All assignments in instance:`, allAssignments?.map(a => a.user_id))
      return // No bots in this instance
    }

    console.log(`[botLogic] ✅ Found ${botAssignments.length} bot(s) in instance ${instanceId}`)
    console.log(`[botLogic] 📋 Bot user IDs:`, botAssignments.map(b => b.user_id))

    // Get the current node to see available choices
    const { data: node, error: nodeError } = await supabase
      .from('story_nodes')
      .select('id, choices')
      .eq('id', nodeId)
      .single()

    if (nodeError) {
      console.error(`[botLogic] ❌ Error fetching node ${nodeId}:`, nodeError)
      return
    }

    if (!node || !node.choices) {
      console.log(`[botLogic] ⚠️ Node ${nodeId} not found or has no choices`)
      return
    }

    console.log(`[botLogic] ✅ Node ${nodeId} found with ${Array.isArray(node.choices) ? node.choices.length : 0} choices`)

  const choices = node.choices as Array<{
    key: string
    text: string
    next_node: string
    character_specific?: string[] | null
  }>

    // Process each bot's choice
    let processedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const botAssignment of botAssignments) {
      console.log(`[botLogic] 🔄 Processing bot ${botAssignment.user_id}...`)
      
      // Check if bot already made a choice for this node
      const { data: existingChoice, error: checkError } = await supabase
        .from('user_choices')
        .select('id')
        .eq('instance_id', instanceId)
        .eq('user_id', botAssignment.user_id)
        .eq('node_id', nodeId)
        .maybeSingle()

      if (checkError) {
        console.error(`[botLogic] ❌ Error checking existing choice for ${botAssignment.user_id}:`, checkError)
        errorCount++
        continue
      }

      if (existingChoice) {
        console.log(`[botLogic] ⏭️ Bot ${botAssignment.user_id} already made a choice, skipping`)
        skippedCount++
        continue // Bot already made a choice
      }

    // Get bot's character name
    const template = Array.isArray(botAssignment.character_templates)
      ? botAssignment.character_templates[0]
      : botAssignment.character_templates
    const botCharacterName = template?.name || ''

    // Filter choices available to this bot's character
    const availableChoices = choices.filter((choice) => {
      if (!choice.character_specific || choice.character_specific.length === 0) {
        return true // Available to all
      }
      return choice.character_specific.includes(botCharacterName)
    })

    if (availableChoices.length === 0) {
      continue // No choices available for this bot
    }

    // Very minimal delay for serverless compatibility (0.2-1 second)
    // Fast enough to prevent timeouts while still processing all bots
    const delay = Math.random() * 800 + 200 // 200-1000ms
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Simple bot logic: Random choice (can be improved with character traits)
    const randomIndex = Math.floor(Math.random() * availableChoices.length)
    const selectedChoice = availableChoices[randomIndex]

    // Save bot's choice
    const { error: botChoiceError } = await supabase
      .from('user_choices')
      .insert({
        instance_id: instanceId,
        user_id: botAssignment.user_id,
        node_id: nodeId,
        choice_key: selectedChoice.key,
      })

      if (botChoiceError) {
        console.error(`[botLogic] ❌ Failed to save bot choice for ${botAssignment.user_id}:`, botChoiceError)
        errorCount++
        continue
      }

      console.log(`[botLogic] ✅ Bot ${botAssignment.user_id} (${botCharacterName}) chose: ${selectedChoice.key}`)
      processedCount++
    }

    console.log(`[botLogic] 📊 Bot processing summary: ${processedCount} processed, ${skippedCount} skipped, ${errorCount} errors`)

    // After all bots have made choices, check and progress story
    // Only check once after processing all bots, not after each bot
    console.log(`[botLogic] 🔄 Finished processing all bot choices, checking story progression...`)
    await checkAndProgressStory(instanceId, nodeId)
  } catch (error) {
    console.error(`[botLogic] ❌ Fatal error in processBotChoices:`, error)
    throw error // Re-throw to be caught by caller
  }
}

/**
 * Check if all players made choices, then progress to next node.
 * Delegates to progressStoryInstance (Phase 2: pre-defined or AI branch).
 */
export async function checkAndProgressStory(instanceId: string, _currentNodeId: string) {
  const { progressStoryInstance } = await import('./progressStoryInstance')
  const supabase = getSupabaseServerClient()

  const { count: totalPlayers } = await supabase
    .from('character_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('instance_id', instanceId)

  const { count: choiceCount } = await supabase
    .from('user_choices')
    .select('*', { count: 'exact', head: true })
    .eq('instance_id', instanceId)
    .eq('node_id', _currentNodeId)

  if ((choiceCount || 0) >= (totalPlayers || 0)) {
    console.log(`[botLogic] All choices submitted! Calling progressStoryInstance...`)
    await progressStoryInstance(instanceId)
  }
}
