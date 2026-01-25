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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('storyId')
    const deviceId = searchParams.get('deviceId')
    const userId = await getUserIdFromRequest(request)

    if (!storyId) {
      return NextResponse.json({ error: 'Missing storyId.' }, { status: 400 })
    }

    if (!userId && !deviceId) {
      return NextResponse.json({ error: 'Missing identity.' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    let query = supabase
      .from('reading_progress')
      .select('current_chapter_id, unlocked_chapters, last_read_at')
      .eq('story_id', storyId)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (deviceId) {
      query = query.eq('device_id', deviceId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`)
    }

    if (!data) {
      return NextResponse.json({ progress: null })
    }

    return NextResponse.json({
      progress: {
        currentChapterId: data.current_chapter_id,
        unlockedChapters: data.unlocked_chapters || [],
        lastReadAt: data.last_read_at,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storyId, currentChapterId, unlockedChapters } = body

    if (!storyId || !currentChapterId || !Array.isArray(unlockedChapters)) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const userId = await getUserIdFromRequest(request)
    const deviceId = body.deviceId

    if (!userId && !deviceId) {
      return NextResponse.json({ error: 'Missing identity.' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    const now = new Date().toISOString()

    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from('reading_progress')
      .upsert(
        {
          user_id: userId || null,
          device_id: deviceId || null,
          story_id: storyId,
          current_chapter_id: currentChapterId,
          unlocked_chapters: unlockedChapters,
          last_read_at: now,
          updated_at: now,
        },
        {
          onConflict: userId ? 'user_id,story_id' : 'device_id,story_id',
        }
      )
      .select()
      .single()

    if (error) {
      throw new Error(`Supabase upsert failed: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      progress: {
        currentChapterId: data.current_chapter_id,
        unlockedChapters: data.unlocked_chapters,
        lastReadAt: data.last_read_at,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
