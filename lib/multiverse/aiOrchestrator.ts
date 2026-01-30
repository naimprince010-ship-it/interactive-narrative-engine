/**
 * AI Story Orchestrator — Dungeon Master of the multiverse
 * - System prompt + Secret Character Profile injection every turn
 * - Conversation Buffer: last 3 nodes from story_state (token truncation)
 * - Zod schema validation; auto-retry on parse fail or missing character_perspectives
 * - Multiverse forking: when choices are drastically different → new branch_id (ai_branch_*)
 * - mood_score (emotional tone); hidden_logic (the "why" for debugging)
 */

import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// Zod schema for AI response — validate structure, reduce hallucinations
const MoodScoreSchema = z.object({
  tension: z.number().min(0).max(1).optional().default(0.5),
  romance: z.number().min(0).max(1).optional().default(0),
  mystery: z.number().min(0).max(1).optional().default(0),
  hope: z.number().min(0).max(1).optional().default(0.5),
})

const OrchestratorOutputSchema = z.object({
  character_perspectives: z.record(z.string(), z.string()),
  narrator_summary: z.string(),
  next_node: z.string(),
  mood_score: MoodScoreSchema.optional(),
  hidden_logic: z.string().optional(),
})

export type OrchestratorOutput = z.infer<typeof OrchestratorOutputSchema>

export type CharacterProfile = {
  name: string
  description: string
}

export type ChoiceByCharacter = {
  character_name: string
  choice_key: string
  choice_text: string
}

const MAX_RETRIES = 2
const BUFFER_NODES = 3

/**
 * Detailed System Prompt: AI as Dungeon Master; Secret Character Profile injected every turn.
 * - Perspective Leakage: FORBID mentioning Character A's secret details in Character B's perspective.
 * - Context Overflow: Initial Story Setting is ALWAYS at top; only the middle history (buffer) is truncated to last BUFFER_NODES.
 */
export function buildOrchestratorPrompt(
  storyTitle: string,
  currentNodeTitle: string,
  currentNodeContent: string,
  characterProfiles: CharacterProfile[],
  buffer: Array<{ node_key: string; title: string; summary: string }>,
  choicesByCharacter: ChoiceByCharacter[],
  options?: { shorterRetry?: boolean; initialStorySetting?: string }
): string {
  // Only truncate the middle history; keep Initial Story Setting always at top (passed in)
  const truncatedBuffer =
    buffer.length > 0
      ? buffer
          .slice(-BUFFER_NODES)
          .map((b) => `- ${b.title}: ${b.summary}`)
          .join('\n')
      : 'No previous nodes.'

  const profilesText = characterProfiles
    .map((p) => `- ${p.name}: ${p.description || 'A character in the story.'}`)
    .join('\n')

  const choicesText = choicesByCharacter
    .map((c) => `${c.character_name} chose "${c.choice_text}" (key: ${c.choice_key})`)
    .join('\n')

  const characterNamesList = characterProfiles.map((p) => p.name).join(', ')
  const initialSetting =
    options?.initialStorySetting?.trim() || `Story: ${storyTitle}. Core plot and tone must stay consistent.`

  if (options?.shorterRetry) {
    return `Initial Story Setting (keep): ${initialSetting}\n\nStory: ${storyTitle}. Scene: ${currentNodeTitle}. Choices: ${choicesText}. Respond with ONLY valid JSON, no markdown. Required keys: character_perspectives (object with keys: ${characterNamesList}), narrator_summary (string), next_node (string, e.g. ai_branch_xxx), mood_score (object: tension, romance, mystery, hope 0-1), hidden_logic (string). Do NOT put Character A's secrets in Character B's perspective.`
  }

  return `You are the Dungeon Master of an interactive multiverse story.

## Initial Story Setting (ALWAYS keep — core plot rules; do not truncate)
${initialSetting}

## Secret Character Profiles (inject into every turn — never break character)
${profilesText}

CRITICAL — Perspective Leakage: Each character's perspective text must contain ONLY what that character would know, see, or feel. NEVER mention Character A's secret details (from their profile) inside Character B's perspective. Each perspective is that character's private view; no leaking other characters' backstories or secrets.

## Current scene
Title: ${currentNodeTitle}
Content: ${currentNodeContent}

## Conversation Buffer (last ${BUFFER_NODES} nodes only — middle history; use for continuity, stay token-efficient)
${truncatedBuffer}

## Choices just made
${choicesText}

## Your task
1. narrator_summary: 2–4 sentences advancing the story. Bengali + English mix OK. Token-efficient.
2. character_perspectives: For EVERY character (${characterNamesList}), one short entry (1–3 sentences). Key = exact character name. In-character. NEVER put another character's secret or backstory in a character's perspective — only that character's own view.
3. next_node: If choices agree → use a pre-defined key like "ending_happy". If choices are DRASTICALLY DIFFERENT or conflicting → create a NEW branch: "ai_branch_" + short_id. Do NOT force the story back to the main plot when players diverge — fork the multiverse.
4. mood_score: Emotional tone for this beat. Numbers 0–1. E.g. tension, romance, mystery, hope. Frontend will use for music/atmosphere.
5. hidden_logic: One sentence explaining WHY you took the story in this direction (for debugging and quality).

Respond with ONLY a valid JSON object, no markdown:
{"character_perspectives":{"<name>":"..."}, "narrator_summary":"...", "next_node":"...", "mood_score":{"tension":0.5,"romance":0,"mystery":0,"hope":0.5}, "hidden_logic":"..."}`
}

/**
 * Parse and validate with Zod. Returns null if invalid.
 */
function parseAndValidate(raw: string, requiredCharacterNames: string[]): OrchestratorOutput | null {
  try {
    const json = JSON.parse(raw) as unknown
    const parsed = OrchestratorOutputSchema.safeParse(json)
    if (!parsed.success) {
      console.warn('[aiOrchestrator] Zod validation failed:', parsed.error.flatten())
      return null
    }
    const out = parsed.data
    // Validation: every required character must have a perspective
    for (const name of requiredCharacterNames) {
      if (!out.character_perspectives[name] || typeof out.character_perspectives[name] !== 'string') {
        console.warn('[aiOrchestrator] Missing character_perspectives for:', name)
        return null
      }
    }
    return out
  } catch {
    return null
  }
}

/**
 * Call OpenAI and parse JSON. Auto-retry: if parsing fails or character_perspectives missing, retry with shorter prompt.
 */
export async function callOrchestrator(
  prompt: string,
  requiredCharacterNames: string[],
  shortPrompt?: string
): Promise<OrchestratorOutput> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[aiOrchestrator] No OPENAI_API_KEY, using fail-safe output')
    return getFailSafeOrchestratorOutput(requiredCharacterNames)
  }

  let lastError: unknown
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const usePrompt = attempt > 0 && shortPrompt ? shortPrompt : prompt
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: usePrompt }],
        max_tokens: 500,
        temperature: 0.7,
      })

      const raw = completion.choices[0]?.message?.content?.trim()
      if (!raw) continue

      const parsed = parseAndValidate(raw, requiredCharacterNames)
      if (parsed) {
        if (attempt > 0) console.log('[aiOrchestrator] Succeeded on retry', attempt)
        return parsed
      }
    } catch (error) {
      lastError = error
      console.warn('[aiOrchestrator] Attempt', attempt + 1, 'failed:', error)
    }
  }

  console.error('[aiOrchestrator] All retries failed:', lastError)
  return getFailSafeOrchestratorOutput(requiredCharacterNames)
}

/**
 * Fail-safe: when Zod still fails after MAX_RETRIES, return generic text for all characters
 * so the instance does not get stuck forever.
 */
function getFailSafeOrchestratorOutput(characterNames: string[]): OrchestratorOutput {
  const genericText = 'The story continues. Everyone carries their own thoughts.'
  const perspectives: Record<string, string> = {}
  for (const name of characterNames) {
    perspectives[name] = genericText
  }
  if (Object.keys(perspectives).length === 0) perspectives.Default = genericText
  return {
    character_perspectives: perspectives,
    narrator_summary: 'The group moves forward, each carrying their own thoughts.',
    next_node: 'ai_branch_fallback',
    mood_score: { tension: 0.5, romance: 0, mystery: 0, hope: 0.5 },
    hidden_logic: 'Fail-safe: Zod validation failed after retries; generic output to avoid stuck instance.',
  }
}

/** Alias for when no API key — same generic output so instance never gets stuck. */
function getFallbackOrchestratorOutput(characterNames: string[]): OrchestratorOutput {
  return getFailSafeOrchestratorOutput(characterNames)
}
