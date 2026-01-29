import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { processBotChoices, checkAndProgressStory } from '@/lib/multiverse/botLogic'

export const runtime = 'nodejs'

async function getUserIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  if (!token) return null
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user.id
}

/**
 * POST /api/multiverse/instances/[instanceId]/trigger-bot-choices
 * Fallback: frontend calls this when user has submitted choice but story is stuck
 * "Waiting for other players...". Triggers bot choices so story can progress.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const instanceId = params.instanceId
    const body = await request.json().catch(() => ({}))
    const nodeId = body?.nodeId

    if (!nodeId) {
      return NextResponse.json({ error: 'Missing nodeId in body' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()

    const { data: assignment } = await supabase
      .from('character_assignments')
      .select('instance_id')
      .eq('user_id', userId)
      .eq('instance_id', instanceId)
      .maybeSingle()

    if (!assignment) {
      return NextResponse.json({ error: 'Not part of this instance' }, { status: 403 })
    }

    console.log(`[trigger-bot-choices] User ${userId} triggered bot choices for instance ${instanceId}, node ${nodeId}`)

    try {
      await processBotChoices(instanceId, nodeId)
      console.log(`[trigger-bot-choices] Completed for instance ${instanceId}`)
    } catch (error) {
      console.error('[trigger-bot-choices] Error:', error)
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Bot choices failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to trigger bot choices'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
