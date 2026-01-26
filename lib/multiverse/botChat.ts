/**
 * Bot Chat Logic for Multiverse Stories
 * Handles automatic chat messages from bot players
 */

import { getSupabaseServerClient } from '@/lib/supabaseServer'

/**
 * Process bot chat messages for an instance
 * Bots will send occasional messages to make the game feel more alive
 */
export async function processBotChat(instanceId: string) {
  const supabase = getSupabaseServerClient()

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

  // Get recent chat messages to avoid spam
  const { data: recentMessages } = await supabase
    .from('character_chat')
    .select('created_at')
    .eq('instance_id', instanceId)
    .order('created_at', { ascending: false })
    .limit(10)

  // If there are recent messages (within last 30 seconds), don't spam
  const now = new Date()
  const thirtySecondsAgo = new Date(now.getTime() - 30000)
  
  const hasRecentMessages = recentMessages?.some((msg) => {
    const msgTime = new Date(msg.created_at)
    return msgTime > thirtySecondsAgo
  })

  if (hasRecentMessages) {
    console.log(`[botChat] Recent messages found, skipping bot chat to avoid spam`)
    return
  }

  // Random chance for a bot to send a message (30% chance)
  if (Math.random() > 0.3) {
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
