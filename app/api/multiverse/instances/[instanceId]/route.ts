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

    // Get all characters in this instance (without revealing assignments)
    const { data: characters } = await supabase
      .from('character_assignments')
      .select('character_templates!inner(name, id)')
      .eq('instance_id', instanceId)

    // Get user's character (for their perspective)
    const { data: userCharacter } = await supabase
      .from('character_assignments')
      .select('character_templates!inner(name, id, description), is_revealed')
      .eq('instance_id', instanceId)
      .eq('user_id', userId)
      .single()

    return NextResponse.json({
      instance: {
        id: instance.id,
        storyId: instance.story_id,
        status: instance.status,
        currentNodeId: instance.current_node_id,
        createdAt: instance.created_at,
      },
      characters: (characters || []).map((c) => ({
        name: c.character_templates.name,
        id: c.character_templates.id,
      })),
      myCharacter: userCharacter
        ? {
            name: userCharacter.character_templates.name,
            id: userCharacter.character_templates.id,
            description: userCharacter.character_templates.description,
            isRevealed: userCharacter.is_revealed,
          }
        : null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get instance'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
