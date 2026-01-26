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

    // TODO: Filter content based on character perspective
    // For now, return node as-is

    return NextResponse.json({
      node: {
        id: node.id,
        node_key: node.node_key,
        title: node.title,
        content: node.content,
        choices: node.choices,
        is_ending: node.is_ending,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get node'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
