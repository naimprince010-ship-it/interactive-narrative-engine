'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabaseClient'

type Story = {
  id: string
  title: string
  description: string | null
  max_players: number
}

export default function MultiverseStoriesPage() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token || null
      setAccessToken(token)
    }
    fetchSession()
  }, [])

  useEffect(() => {
    const loadStories = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from('stories')
          .select('id, title, description, max_players')
          .order('created_at', { ascending: false })

        if (error) throw error
        setStories(data || [])
      } catch (error) {
        console.error('Failed to load stories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStories()
  }, [])

  const handleJoinStory = async (storyId: string) => {
    if (!accessToken) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/multiverse/stories/${storyId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error: ${data.error || 'Failed to join story'}`)
        return
      }

      // Redirect to story instance
      router.push(`/multiverse/play/${data.instanceId}`)
    } catch (error) {
      console.error('Failed to join story:', error)
      alert('Failed to join story. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading stories...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Multiverse Stories
          </h1>
          <p className="text-purple-200">
            Join interactive stories where multiple players shape the narrative together
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center">
            <p className="text-white text-lg">No stories available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  {story.title}
                </h2>
                <p className="text-purple-200 mb-4 line-clamp-3">
                  {story.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-purple-300">
                    👥 {story.max_players} players
                  </div>
                  <button
                    onClick={() => handleJoinStory(story.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Join Story
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-purple-300 hover:text-purple-200 underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
