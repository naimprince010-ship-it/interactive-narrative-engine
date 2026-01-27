/**
 * AI Bot Brain for Multiverse Stories
 * Uses AI to generate intelligent, context-aware responses for bot characters
 */

import OpenAI from 'openai'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * Generate AI response for a bot character
 * @param characterName - Name of the bot character
 * @param characterDescription - Character's personality/description
 * @param storyContext - Current story node content
 * @param recentMessages - Recent chat messages for context
 * @param userMessage - The user's message (if responding to one)
 * @returns AI-generated response
 */
export async function generateBotResponse(
  characterName: string,
  characterDescription: string,
  storyContext: string,
  recentMessages: Array<{ character_name: string; message: string }>,
  userMessage?: string
): Promise<string> {
  // If no API key, fallback to simple responses
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[aiBotBrain] No OPENAI_API_KEY found, using fallback responses')
    return getFallbackResponse(characterName, userMessage)
  }

  try {
    // Build conversation context
    const conversationHistory = recentMessages
      .slice(-5) // Last 5 messages for context
      .map((msg) => `${msg.character_name}: ${msg.message}`)
      .join('\n')

    // Build the prompt
    const systemPrompt = `You are ${characterName}, a character in an interactive story game. 

Character Description: ${characterDescription}

Story Context: ${storyContext}

Your role:
- Respond naturally and in-character
- Keep responses SHORT (1-2 sentences max, but meaningful)
- Be conversational, engaging, and specific to the context
- React to what other characters say with relevant responses
- Stay true to your character's personality
- Use simple, natural language (mix of English and Bengali if appropriate)
- Don't be overly dramatic or formal
- NEVER send empty or one-word responses
- Make your response relevant to the conversation and story context

${userMessage ? `A user just said: "${userMessage}"\nRespond to them naturally and specifically address what they said.` : 'Send a brief, natural message that fits the current story situation and moves the conversation forward.'}`

    const userPrompt = userMessage
      ? `Respond to: "${userMessage}"\n\nRecent conversation:\n${conversationHistory || 'No recent messages'}`
      : `Send a brief message that fits the story context.\n\nRecent conversation:\n${conversationHistory || 'No recent messages'}`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using cheaper model for cost efficiency
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 100, // Keep responses short
      temperature: 0.8, // Some creativity but not too random
    })

    const response = completion.choices[0]?.message?.content?.trim()

    if (!response || response.length === 0) {
      console.warn(`[aiBotBrain] Empty response from AI for ${characterName}, using fallback`)
      return getFallbackResponse(characterName, userMessage)
    }

    // Ensure response is not too short (at least 3 characters)
    if (response.length < 3) {
      console.warn(`[aiBotBrain] Response too short (${response.length} chars) for ${characterName}, using fallback`)
      return getFallbackResponse(characterName, userMessage)
    }

    console.log(`[aiBotBrain] Generated response for ${characterName}: ${response}`)
    return response
  } catch (error) {
    console.error(`[aiBotBrain] AI generation error:`, error)
    // Fallback to simple response
    return getFallbackResponse(characterName, userMessage)
  }
}

/**
 * Fallback responses when AI is not available
 */
function getFallbackResponse(characterName: string, userMessage?: string): string {
  if (userMessage) {
    // Respond to user message with more engaging responses
    const responses = [
      'I understand what you mean.',
      'That\'s an interesting point.',
      'Let me think about that for a moment.',
      'I see where you\'re coming from.',
      'That makes sense to me.',
      'I agree with your perspective.',
      'Hmm, that\'s something to consider.',
      'You raise a good point there.',
      'I hadn\'t thought of it that way.',
      'That\'s worth discussing further.',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // General message - more engaging
  const responses = [
    'What do you all think about this situation?',
    'This is getting quite interesting.',
    'I think we should discuss our options.',
    'Let\'s think carefully about what to do next.',
    'I wonder what will happen if we proceed.',
    'We need to be cautious here.',
    'This situation requires careful consideration.',
    'I\'m curious to see how this unfolds.',
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Get story context for AI
 */
export async function getStoryContext(instanceId: string): Promise<string> {
  const supabase = getSupabaseServerClient()

  try {
    // Get current instance and node
    const { data: instance } = await supabase
      .from('story_instances')
      .select('current_node_id, story_id, stories!inner(title)')
      .eq('id', instanceId)
      .single()

    if (!instance || !instance.current_node_id) {
      return 'The story is just beginning.'
    }

    // Get story title
    const storyTitle = Array.isArray((instance as any).stories)
      ? (instance as any).stories[0]?.title
      : (instance as any).stories?.title

    // Get current node content
    const { data: node } = await supabase
      .from('story_nodes')
      .select('title, content')
      .eq('id', instance.current_node_id)
      .single()

    if (!node) {
      return 'The story is progressing.'
    }

    return `Story: ${storyTitle || 'Unknown'}\nCurrent Scene: ${node.title}\n${node.content || ''}`
  } catch (error) {
    console.error('[aiBotBrain] Error getting story context:', error)
    return 'The story is progressing.'
  }
}
