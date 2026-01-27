/**
 * Bot Chat Logic for Multiverse Stories
 * Handles automatic chat messages from bot players
 * Now powered by AI for intelligent, context-aware responses
 */

import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { generateBotResponse, getStoryContext } from './aiBotBrain'

/**
 * Process bot chat messages for an instance
 * Bots will send occasional messages to make the game feel more alive
 */
export async function processBotChat(instanceId: string, delayMs: number = 0) {
  const supabase = getSupabaseServerClient()

  // Add delay if specified (for human-like response timing)
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  console.log(`[botChat] Processing bot chat for instance ${instanceId}`)

  // Get all bot players in this instance
  const { data: botAssignments } = await supabase
    .from('character_assignments')
    .select('user_id, template_id, character_templates!inner(name, id, description)')
    .eq('instance_id', instanceId)
    .like('user_id', 'bot_%')

  if (!botAssignments || botAssignments.length === 0) {
    console.log(`[botChat] No bots found in instance ${instanceId}`)
    return // No bots in this instance
  }

  console.log(`[botChat] Found ${botAssignments.length} bot(s) in instance ${instanceId}`)

  // Get recent bot messages to avoid spam (only check bot messages, not user messages)
  const { data: recentBotMessages } = await supabase
    .from('character_chat')
    .select('created_at, character_id, character_templates!inner(name)')
    .eq('instance_id', instanceId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Check if a bot sent a message recently (only for periodic messages, not user-triggered)
  const isUserTriggered = delayMs > 0 // If delayMs > 0, it means user just sent a message
  
  // For user-triggered messages, always allow reply (skip spam check)
  // For periodic messages, check spam (within last 10 seconds)
  if (!isUserTriggered) {
    const now = new Date()
    const tenSecondsAgo = new Date(now.getTime() - 10000)
    
    const hasRecentBotMessage = recentBotMessages?.some((msg: any) => {
      const msgTime = new Date(msg.created_at)
      // Check if this message is from a bot character
      const isBotMessage = botAssignments.some((bot) => {
        const template = Array.isArray(bot.character_templates)
          ? bot.character_templates[0]
          : bot.character_templates
        return template?.id === msg.character_id
      })
      return isBotMessage && msgTime > tenSecondsAgo
    })

    if (hasRecentBotMessage) {
      console.log(`[botChat] Bot sent message recently (within 10s), skipping periodic message to avoid spam`)
      return
    }
  }

  // Always reply when user sends a message (100% chance - removed random check for user messages)
  // Only use random chance for periodic messages (not triggered by user)
  if (!isUserTriggered && Math.random() > 0.8) {
    console.log(`[botChat] Random chance check failed for periodic message, skipping bot chat`)
    return
  }

  // Select a random bot to send a message
  const randomBotIndex = Math.floor(Math.random() * botAssignments.length)
  const botAssignment = botAssignments[randomBotIndex]

  // Get bot's character info
  const template = Array.isArray(botAssignment.character_templates)
    ? botAssignment.character_templates[0]
    : botAssignment.character_templates
  const botCharacterName = template?.name || ''
  const botCharacterDescription = (template as any)?.description || 'A character in the story'

  // Get story context for AI
  const storyContext = await getStoryContext(instanceId)

  // Get recent messages for context
  const { data: recentMessages } = await supabase
    .from('character_chat')
    .select('message, character_templates!inner(name)')
    .eq('instance_id', instanceId)
    .order('created_at', { ascending: false })
    .limit(10)

  const formattedMessages =
    recentMessages?.map((msg: any) => ({
      character_name: msg.character_templates?.name || 'Unknown',
      message: msg.message,
    })) || []

  // Get the most recent user message (if any)
  const lastUserMessage = formattedMessages.find(
    (msg) => !botAssignments.some((bot) => {
      const botTemplate = Array.isArray(bot.character_templates)
        ? bot.character_templates[0]
        : bot.character_templates
      return botTemplate?.name === msg.character_name
    })
  )?.message

  // Generate AI response
  const randomMessage = await generateBotResponse(
    botCharacterName,
    botCharacterDescription,
    storyContext,
    formattedMessages.reverse(), // Reverse to get chronological order
    lastUserMessage
  )

  // Save bot's chat message
  const { error: chatError } = await supabase
    .from('character_chat')
    .insert({
      instance_id: instanceId,
      character_id: template?.id || botAssignment.template_id,
      message: randomMessage,
    })

  if (chatError) {
    console.error(`[botChat] Failed to save bot chat message for ${botAssignment.user_id}:`, chatError)
    console.error(`[botChat] Error details:`, JSON.stringify(chatError, null, 2))
  } else {
    console.log(`[botChat] ✅ Bot ${botAssignment.user_id} (${botCharacterName}) sent: ${randomMessage}`)
  }
}

/**
 * Start periodic bot chat for an instance
 * This should be called when an instance becomes ACTIVE
 */
export function startBotChatInterval(instanceId: string) {
  // Process bot chat every 30-60 seconds (random interval)
  const interval = 30000 + Math.random() * 30000 // 30-60 seconds

  setTimeout(() => {
    processBotChat(instanceId).catch((error) => {
      console.error('[botChat] Bot chat processing error:', error)
    })

    // Schedule next chat
    startBotChatInterval(instanceId)
  }, interval)
}
