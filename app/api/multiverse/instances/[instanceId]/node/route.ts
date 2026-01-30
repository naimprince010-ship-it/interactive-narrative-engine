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
    const { searchParams } = new URL(request.url)
    const nodeId = searchParams.get('nodeId') || searchParams.get('node_id')

    if (!nodeId) {
      return NextResponse.json({ error: 'Missing nodeId' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()

    // Verify user is part of this instance
    const { data: assignment } = await supabase
      .from('character_assignments')
      .select('instance_id, character_templates!inner(name)')
      .eq('user_id', userId)
      .eq('instance_id', instanceId)
      .maybeSingle()

    if (!assignment) {
      return NextResponse.json({ error: 'Not part of this instance' }, { status: 403 })
    }

    // Get story node
    const { data: node, error: nodeError } = await supabase
      .from('story_nodes')
      .select('*')
      .eq('id', nodeId)
      .single()

    if (nodeError || !node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // Check if user already made a choice for this node
    const { data: userChoice } = await supabase
      .from('user_choices')
      .select('choice_key')
      .eq('instance_id', instanceId)
      .eq('user_id', userId)
      .eq('node_id', nodeId)
      .maybeSingle()

    // Phase 4: perspective-based content — if this node has AI-generated character_perspectives, return content_for_you
    let content_for_you: string | null = null
    let narrator_summary: string | null = null
    const { data: stateRow } = await supabase
      .from('story_state')
      .select('state_data')
      .eq('instance_id', instanceId)
      .maybeSingle()

    const stateData = stateRow?.state_data as {
      current_ai_node_id?: string
      current_ai_content?: {
        character_perspectives: Record<string, string>
        narrator_summary: string
        mood_score?: { tension?: number; romance?: number; mystery?: number; hope?: number }
        hidden_logic?: string
      }
    } | null
    let mood_score: { tension?: number; romance?: number; mystery?: number; hope?: number } | null = null
    let hidden_logic: string | null = null
    if (stateData?.current_ai_node_id === nodeId && stateData?.current_ai_content) {
      narrator_summary = stateData.current_ai_content.narrator_summary
      mood_score = stateData.current_ai_content.mood_score ?? null
      hidden_logic = stateData.current_ai_content.hidden_logic ?? null
      const templates = assignment.character_templates as { name: string } | { name: string }[] | undefined
      const myName = Array.isArray(templates) ? templates[0]?.name : templates?.name
      if (myName && stateData.current_ai_content.character_perspectives[myName]) {
        content_for_you = stateData.current_ai_content.character_perspectives[myName]
      }
    }

    return NextResponse.json({
      node: {
        id: node.id,
        node_key: node.node_key,
        title: node.title,
        content: node.content,
        choices: node.choices,
        is_ending: node.is_ending,
        ...(content_for_you != null && { content_for_you }),
        ...(narrator_summary != null && { narrator_summary }),
        ...(mood_score != null && { mood_score }),
        ...(hidden_logic != null && { hidden_logic }),
      },
      userChoice: userChoice ? { choice_key: userChoice.choice_key } : null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get node'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
