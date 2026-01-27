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
- IMPORTANT: Use a natural mix of Bengali (বাংলা) and English in your responses - this is how people actually talk in Bangladesh
- Example: "Ami bhabchi je amra ekhon ki korbo. What do you think?" or "This is interesting. Amader ekhon sobar opinion jante hobe."
- Don't be overly dramatic or formal
- NEVER send empty or one-word responses
- Make your response relevant to the conversation and story context
- Continue conversations naturally - ask questions, share thoughts, react to others

${userMessage ? `A user just said: "${userMessage}"\nRespond to them naturally in a mix of Bengali and English, and specifically address what they said.` : 'Send a brief, natural message in a mix of Bengali and English that fits the current story situation and moves the conversation forward. You can ask questions, share your thoughts, or react to what others have said.'}`

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
    // Respond to user message with Bengali-English mix
    const responses = [
      'Ami bujhte parchi. That makes sense.',
      'Interesting point. Ami bhabchi ekhon ki korbo.',
      'Hmm, let me think about that. Ekhon ki korbo amra?',
      'I see what you mean. Amader sobar opinion jante hobe.',
      'That\'s a good point. Ami agree kori.',
      'Ami bhabchi ekhon sobar kotha shunbo.',
      'You\'re right. Ekhon amader plan korte hobe.',
      'Ami bujhte parchi. What do you all think?',
      'Interesting. Amader ekhon careful hote hobe.',
      'I agree. Ekhon ki korbo amra?',
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // General message - Bengali-English mix, more engaging
  const responses = [
    'Amader sobar ki mone hoche ekhon? What do you all think?',
    'This is getting interesting. Ami bhabchi ekhon ki korbo.',
    'Amader ekhon plan korte hobe. What should we do?',
    'I think we should discuss. Amader sobar opinion jante hobe.',
    'Ekhon ki korbo amra? Let\'s think carefully.',
    'This situation is tricky. Amader careful hote hobe.',
    'Ami curious je ekhon ki hobe. What do you think?',
    'Amader ekhon sobar kotha shunbo. Let\'s discuss our options.',
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
