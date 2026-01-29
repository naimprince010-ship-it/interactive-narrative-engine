import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { processBotChat } from '@/lib/multiverse/botChat'

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
 * POST /api/multiverse/instances/[instanceId]/trigger-bot-chat
 * Client calls this after sending a message (e.g. after 3–5s delay) so bot reply
 * runs in a new request. Fixes bot reply not running on Vercel serverless when
 * the chat POST returns and the function is frozen/killed before processBotChat runs.
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

    console.log(`[trigger-bot-chat] User triggered bot chat for instance ${instanceId}`)

    await processBotChat(instanceId, 0)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[trigger-bot-chat] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to trigger bot chat'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
