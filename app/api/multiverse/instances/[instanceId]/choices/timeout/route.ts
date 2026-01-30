import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { processBotChoices, checkAndProgressStory } from '@/lib/multiverse/botLogic'
import { pickDangerousChoice, applyHealthDamage, getChoiceRisk, countActivePlayers } from '@/lib/multiverse/participantState'

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

type ChoiceDef = { key: string; text: string; next_node: string; dangerous?: boolean; risk_hp?: number }

/**
 * POST /api/multiverse/instances/[instanceId]/choices/timeout
 * Real-time Survival Timer ran out: AI picks a "dangerous" choice for this user.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const instanceId = params.instanceId
    const body = await request.json().catch(() => ({}))
    const nodeId = body?.nodeId

    if (!nodeId) return NextResponse.json({ error: 'Missing nodeId' }, { status: 400 })

    const supabase = getSupabaseServerClient()

    const { data: assignment } = await supabase
      .from('character_assignments')
      .select('instance_id, template_id')
      .eq('user_id', userId)
      .eq('instance_id', instanceId)
      .maybeSingle()

    if (!assignment) return NextResponse.json({ error: 'Not part of this instance' }, { status: 403 })

    const { data: existingChoice } = await supabase
      .from('user_choices')
      .select('id')
      .eq('instance_id', instanceId)
      .eq('user_id', userId)
      .eq('node_id', nodeId)
      .maybeSingle()

    if (existingChoice) {
      return NextResponse.json({ success: true, message: 'Choice already submitted' })
    }

    const { data: node } = await supabase
      .from('story_nodes')
      .select('id, choices')
      .eq('id', nodeId)
      .single()

    if (!node?.choices || !Array.isArray(node.choices)) {
      return NextResponse.json({ error: 'Node has no choices' }, { status: 400 })
    }

    const choices = node.choices as ChoiceDef[]
    const picked = pickDangerousChoice(choices)
    if (!picked) return NextResponse.json({ error: 'No choice available' }, { status: 400 })

    const choiceKey = picked.key

    await supabase.from('user_choices').insert({
      instance_id: instanceId,
      user_id: userId,
      node_id: nodeId,
      choice_key: choiceKey,
    })

    const risk = getChoiceRisk(picked)
    if (risk > 0) {
      await applyHealthDamage(instanceId, userId, risk, 'timeout_dangerous_choice')
    }

    const { data: assignments } = await supabase
      .from('character_assignments')
      .select('health')
      .eq('instance_id', instanceId)
    const totalActive = countActivePlayers((assignments ?? []) as Array<{ health?: number | null }>)

    const { count: choiceCount } = await supabase
      .from('user_choices')
      .select('*', { count: 'exact', head: true })
      .eq('instance_id', instanceId)
      .eq('node_id', nodeId)

    if ((choiceCount || 0) >= totalActive) {
      await checkAndProgressStory(instanceId, nodeId)
    } else {
      await processBotChoices(instanceId, nodeId)
    }

    return NextResponse.json({
      success: true,
      message: 'Timeout: dangerous choice applied',
      choiceKey,
      healthDamage: risk,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Timeout choice failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
