import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { processBotChoices, checkAndProgressStory } from '@/lib/multiverse/botLogic'

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

    console.log(`[choices] User ${userId} submitted choice ${choiceKey} for node ${nodeId}`)

    // Check if all players have made choices (including bots)
    // This will also trigger bot choices if needed
    // Get total players count
    const { count: totalPlayers } = await supabase
      .from('character_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('instance_id', instanceId)

    // Get current choices count
    const { count: choiceCount } = await supabase
      .from('user_choices')
      .select('*', { count: 'exact', head: true })
      .eq('instance_id', instanceId)
      .eq('node_id', nodeId)

    console.log(`[choices] Current choices: ${choiceCount}/${totalPlayers} for node ${nodeId}`)

    // Process bot choices and story progression - await to ensure execution
    // Vercel serverless functions can handle up to 10 seconds execution time
    // Bot choices with reduced delays should complete within this time
    if ((choiceCount || 0) < (totalPlayers || 0)) {
      console.log(`[choices] Triggering bot choices for remaining players...`)
      console.log(`[choices] Missing ${(totalPlayers || 0) - (choiceCount || 0)} choice(s)`)
      // Await bot choices to ensure they execute before function returns
      try {
        await processBotChoices(instanceId, nodeId)
        console.log(`[choices] Bot choices processing completed`)
      } catch (error) {
        console.error('[choices] Bot choice processing error:', error)
        console.error('[choices] Error details:', error instanceof Error ? error.message : String(error))
        console.error('[choices] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        // Don't fail the request if bot choices fail, but log the error
      }
    } else {
      // All choices are in, check and progress story
      console.log(`[choices] All choices submitted, checking story progression...`)
      try {
        await checkAndProgressStory(instanceId, nodeId)
        console.log(`[choices] Story progression check completed`)
      } catch (error) {
        console.error('[choices] Story progression error:', error)
        console.error('[choices] Error details:', error instanceof Error ? error.message : String(error))
        // Don't fail the request if story progression fails
      }
    }

    return NextResponse.json({ success: true, message: 'Choice submitted' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit choice'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
