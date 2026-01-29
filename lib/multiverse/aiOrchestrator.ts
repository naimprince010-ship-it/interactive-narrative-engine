/**
 * AI Story Orchestrator (Phase 3)
 * System prompt + JSON output (character_perspectives, narrator_summary, next_node)
 * Token efficiency: only last 2–3 nodes summary (buffer)
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export type OrchestratorOutput = {
  character_perspectives: Record<string, string>
  narrator_summary: string
  next_node: string
}

export type CharacterProfile = {
  name: string
  description: string
}

export type ChoiceByCharacter = {
  character_name: string
  choice_key: string
  choice_text: string
}

/**
 * Build system prompt: story context, secret profiles, buffer, choices
 */
export function buildOrchestratorPrompt(
  storyTitle: string,
  currentNodeTitle: string,
  currentNodeContent: string,
  characterProfiles: CharacterProfile[],
  buffer: Array<{ node_key: string; title: string; summary: string }>,
  choicesByCharacter: ChoiceByCharacter[]
): string {
  const bufferText =
    buffer.length > 0
      ? buffer
          .map((b) => `- ${b.title}: ${b.summary}`)
          .join('\n')
      : 'No previous nodes.'

  const profilesText = characterProfiles
    .map((p) => `- ${p.name}: ${p.description || 'A character in the story.'}`)
    .join('\n')

  const choicesText = choicesByCharacter
    .map((c) => `${c.character_name} chose "${c.choice_text}" (key: ${c.choice_key})`)
    .join('\n')

  return `You are the story orchestrator for an interactive multiverse story. The story title is: ${storyTitle}.

Current scene: ${currentNodeTitle}
Current scene content: ${currentNodeContent}

Character profiles (secret – use for perspective text only):
${profilesText}

Recent story buffer (last 2–3 nodes, for context only – keep responses token-efficient):
${bufferText}

Choices just made by each character:
${choicesText}

Your task:
1. Write a SHORT narrator_summary (2–4 sentences) that advances the story based on these choices. Mix of Bengali and English is fine.
2. For each character, write a SHORT character_perspectives entry (1–3 sentences) – what that character sees/feels/thinks in this moment. Use their name as key. Keep it in-character and token-efficient.
3. Decide next_node: either a pre-defined key like "ending_happy" or a new AI branch key like "ai_branch_conflict" (no spaces). If the choices clearly point to one outcome, use a simple key; if conflicting, use ai_branch_*.

Respond with ONLY a valid JSON object, no markdown, no extra text:
{"character_perspectives":{"CharacterName":"...","OtherName":"..."},"narrator_summary":"...","next_node":"..."}`
}

/**
 * Call OpenAI and parse JSON output
 */
export async function callOrchestrator(prompt: string): Promise<OrchestratorOutput> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[aiOrchestrator] No OPENAI_API_KEY, using fallback')
    return getFallbackOrchestratorOutput()
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) {
      return getFallbackOrchestratorOutput()
    }

    const parsed = JSON.parse(raw) as OrchestratorOutput
    if (
      !parsed.character_perspectives ||
      typeof parsed.narrator_summary !== 'string' ||
      typeof parsed.next_node !== 'string'
    ) {
      console.warn('[aiOrchestrator] Invalid shape, using fallback')
      return getFallbackOrchestratorOutput()
    }

    return parsed
  } catch (error) {
    console.error('[aiOrchestrator] Error:', error)
    return getFallbackOrchestratorOutput()
  }
}

function getFallbackOrchestratorOutput(): OrchestratorOutput {
  return {
    character_perspectives: {
      Default: 'The story continues. Everyone reacts to what just happened.',
    },
    narrator_summary: 'The group moves forward, each carrying their own thoughts.',
    next_node: 'ai_branch_fallback',
  }
}
