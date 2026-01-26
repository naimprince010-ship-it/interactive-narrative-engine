/**
 * Bot Chat Logic for Multiverse Stories
 * Handles automatic chat messages from bot players
 */

import { getSupabaseServerClient } from '@/lib/supabaseServer'

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
    .select('user_id, template_id, character_templates!inner(name, id)')
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

  // Check if a bot sent a message recently (within last 20 seconds)
  const now = new Date()
  const twentySecondsAgo = new Date(now.getTime() - 20000)
  
  const hasRecentBotMessage = recentBotMessages?.some((msg: any) => {
    const msgTime = new Date(msg.created_at)
    // Check if this message is from a bot character
    const isBotMessage = botAssignments.some((bot) => {
      const template = Array.isArray(bot.character_templates)
        ? bot.character_templates[0]
        : bot.character_templates
      return template?.id === msg.character_id
    })
    return isBotMessage && msgTime > twentySecondsAgo
  })

  if (hasRecentBotMessage) {
    console.log(`[botChat] Bot sent message recently, skipping to avoid spam`)
    return
  }

  // Higher chance for bot to reply (70% chance when triggered)
  if (Math.random() > 0.7) {
    console.log(`[botChat] Random chance check failed, skipping bot chat`)
    return
  }

  // Select a random bot to send a message
  const randomBotIndex = Math.floor(Math.random() * botAssignments.length)
  const botAssignment = botAssignments[randomBotIndex]

  // Get bot's character name
  const template = Array.isArray(botAssignment.character_templates)
    ? botAssignment.character_templates[0]
    : botAssignment.character_templates
  const botCharacterName = template?.name || ''

  // Simple bot chat messages (can be improved with character-specific messages)
  const botMessages = [
    'Interesting...',
    'Hmm, what should we do?',
    'I see...',
    'Let me think...',
    'This is getting interesting.',
    'What do you all think?',
    'I agree.',
    'Not sure about that...',
    'Okay, let\'s see what happens.',
    'Sounds good to me.',
    'Yeah, I think so too.',
    'That makes sense.',
    'We should be careful here.',
    'Let\'s proceed carefully.',
    'I\'m with you on this.',
  ]

  const randomMessage = botMessages[Math.floor(Math.random() * botMessages.length)]

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
  } else {
    console.log(`[botChat] Bot ${botAssignment.user_id} (${botCharacterName}) sent: ${randomMessage}`)
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
