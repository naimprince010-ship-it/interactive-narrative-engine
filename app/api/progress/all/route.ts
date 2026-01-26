import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { stories } from '@/data/stories'

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
    const deviceId = searchParams.get('deviceId')
    const userId = await getUserIdFromRequest(request)

    if (!userId && !deviceId) {
      return NextResponse.json({ error: 'Missing identity.' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    let query = supabase.from('reading_progress').select('story_id, current_chapter_id, unlocked_chapters, last_read_at')

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (deviceId) {
      query = query.eq('device_id', deviceId)
    }

    const { data: progressData, error } = await query

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`)
    }

    // Map progress to stories
    const progressMap = new Map(
      (progressData || []).map((p) => [
        p.story_id,
        {
          currentChapterId: p.current_chapter_id,
          unlockedChapters: p.unlocked_chapters || [],
          lastReadAt: p.last_read_at,
        },
      ])
    )

    // Calculate progress for each story
    const storiesWithProgress = stories.map((story) => {
      const progress = progressMap.get(story.id)
      const totalChapters = story.chapters.length
      const unlockedCount = progress ? progress.unlockedChapters.length : 0
      const progressPercent = totalChapters > 0 ? Math.round((unlockedCount / totalChapters) * 100) : 0

      return {
        storyId: story.id,
        title: story.title,
        description: story.description,
        progress: progress
          ? {
              currentChapterId: progress.currentChapterId,
              unlockedChapters: progress.unlockedChapters,
              progressPercent,
              unlockedCount,
              totalChapters,
              lastReadAt: progress.lastReadAt,
            }
          : null,
      }
    })

    return NextResponse.json({ stories: storiesWithProgress })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
