import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

async function getUserIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  if (!token) {
    return null
  }

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return null
  }

  return data.user.id
}

export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const instanceId = params.instanceId
    const supabase = getSupabaseServerClient()

    // Verify user is part of this instance
    const { data: assignment } = await supabase
      .from('character_assignments')
      .select('instance_id')
      .eq('user_id', userId)
      .eq('instance_id', instanceId)
      .maybeSingle()

    if (!assignment) {
      return NextResponse.json({ error: 'Not part of this instance' }, { status: 403 })
    }

    // Get instance details
    const { data: instance, error: instanceError } = await supabase
      .from('story_instances')
      .select('id, story_id, status, current_node_id, created_at')
      .eq('id', instanceId)
      .single()

    if (instanceError || !instance) {
      throw new Error(`Instance not found: ${instanceError?.message}`)
    }

    // Get story max_players
    const { data: story } = await supabase
      .from('stories')
      .select('max_players')
      .eq('id', instance.story_id)
      .single()

    const maxPlayers = story?.max_players || 3

    // Get all characters in this instance (with user_id to identify bots)
    const { data: characters } = await supabase
      .from('character_assignments')
      .select('user_id, character_templates!inner(name, id)')
      .eq('instance_id', instanceId)

    // Get user's character (for their perspective)
    const { data: userCharacter } = await supabase
      .from('character_assignments')
      .select('character_templates!inner(name, id, description), is_revealed')
      .eq('instance_id', instanceId)
      .eq('user_id', userId)
      .single()

    // Type-safe character mapping with bot identification
    const formattedCharacters = (characters || []).map((c: any) => {
      const template = Array.isArray(c.character_templates)
        ? c.character_templates[0]
        : c.character_templates
      const isBot = c.user_id?.startsWith('bot_') || false
      return {
        name: template?.name || '',
        id: template?.id || '',
        isBot,
      }
    })

    // Type-safe user character
    const formattedUserCharacter = userCharacter
      ? (() => {
          const template = Array.isArray(userCharacter.character_templates)
            ? userCharacter.character_templates[0]
            : userCharacter.character_templates
          return {
            name: template?.name || '',
            id: template?.id || '',
            description: template?.description || '',
            isRevealed: userCharacter.is_revealed || false,
          }
        })()
      : null

    return NextResponse.json({
      instance: {
        id: instance.id,
        storyId: instance.story_id,
        status: instance.status,
        currentNodeId: instance.current_node_id,
        createdAt: instance.created_at,
        maxPlayers,
      },
      characters: formattedCharacters,
      myCharacter: formattedUserCharacter,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get instance'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
