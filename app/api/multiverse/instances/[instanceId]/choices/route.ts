import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { processBotChoices } from '@/lib/multiverse/botLogic'

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
    const body = await request.json()
    const { nodeId, choiceKey } = body

    if (!nodeId || !choiceKey) {
      return NextResponse.json({ error: 'Missing nodeId or choiceKey' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()

    // Verify user is part of this instance
    const { data: assignment } = await supabase
      .from('character_assignments')
      .select('instance_id, template_id')
      .eq('user_id', userId)
      .eq('instance_id', instanceId)
      .maybeSingle()

    if (!assignment) {
      return NextResponse.json({ error: 'Not part of this instance' }, { status: 403 })
    }

    // Check if user already made a choice for this node
    const { data: existingChoice } = await supabase
      .from('user_choices')
      .select('id')
      .eq('instance_id', instanceId)
      .eq('user_id', userId)
      .eq('node_id', nodeId)
      .maybeSingle()

    if (existingChoice) {
      return NextResponse.json({ error: 'Choice already submitted for this node' }, { status: 400 })
    }

    // Save user's choice
    const { error: choiceError } = await supabase
      .from('user_choices')
      .insert({
        instance_id: instanceId,
        user_id: userId,
        node_id: nodeId,
        choice_key: choiceKey,
      })

    if (choiceError) {
      throw new Error(`Failed to save choice: ${choiceError.message}`)
    }

    // Trigger bot choices processing (async, don't wait)
    processBotChoices(instanceId, nodeId).catch((error) => {
      console.error('Bot choice processing error:', error)
    })

    // TODO: Check if all players (including bots) made choices, then progress to next node

    return NextResponse.json({ success: true, message: 'Choice submitted' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit choice'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
