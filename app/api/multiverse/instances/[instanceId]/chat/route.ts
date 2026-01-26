import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { processBotChat } from '@/lib/multiverse/botChat'

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

    // Get chat messages with character names
    const { data: messages, error: messagesError } = await supabase
      .from('character_chat')
      .select(
        'id, character_id, message, created_at, character_templates!inner(name)'
      )
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw new Error(`Failed to load messages: ${messagesError.message}`)
    }

    // Format messages
    const formattedMessages =
      messages?.map((msg: any) => ({
        id: msg.id,
        character_id: msg.character_id,
        character_name: msg.character_templates.name,
        message: msg.message,
        created_at: msg.created_at,
      })) || []

    return NextResponse.json({
      messages: formattedMessages,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get messages'
    return NextResponse.json({ error: message }, { status: 500 })
  }
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
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()

    // Get user's character assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('character_assignments')
      .select('template_id')
      .eq('user_id', userId)
      .eq('instance_id', instanceId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Not part of this instance' },
        { status: 403 }
      )
    }

    // Save chat message
    const { error: insertError } = await supabase.from('character_chat').insert({
      instance_id: instanceId,
      character_id: assignment.template_id,
      message: message.trim(),
    })

    if (insertError) {
      throw new Error(`Failed to send message: ${insertError.message}`)
    }

    // Trigger bot chat response (async, don't wait)
    // Bots will respond to user messages after a delay
    setTimeout(() => {
      processBotChat(instanceId).catch((error) => {
        console.error('[chat] Bot chat processing error:', error)
      })
    }, 3000 + Math.random() * 2000) // 3-5 seconds delay for bot response

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
