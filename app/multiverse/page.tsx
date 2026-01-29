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
  genre: string | null
}

const GENRES = [
  { value: '', label: 'সব জেনার' },
  { value: 'mystery', label: 'মিস্ট্রি' },
  { value: 'romance', label: 'রোমান্স' },
  { value: 'thriller', label: 'থ্রিলার' },
  { value: 'scifi', label: 'সাই-ফাই' },
  { value: 'fantasy', label: 'ফ্যান্টাসি' },
  { value: 'horror', label: 'হরর' },
  { value: 'comedy', label: 'কমেডি' },
  { value: 'drama', label: 'ড্রামা' },
  { value: 'adventure', label: 'অ্যাডভেঞ্চার' },
  { value: 'action', label: 'অ্যাকশন' },
  { value: 'slice_of_life', label: 'স্লাইস অফ লাইফ' },
  { value: 'historical', label: 'ঐতিহাসিক' },
  { value: 'crime', label: 'ক্রাইম / ডিটেকটিভ' },
  { value: 'supernatural', label: 'সুপারন্যাচারাল' },
  { value: 'family', label: 'পারিবারিক' },
  { value: 'psychological', label: 'সাইকোলজিক্যাল' },
  { value: 'tragedy', label: 'ট্র্যাজেডি' },
  { value: 'inspirational', label: 'অনুপ্রেরণাদায়ক' },
]

export default function MultiverseStoriesPage() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [genreFilter, setGenreFilter] = useState<string>('')

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
        let query = supabase
          .from('stories')
          .select('id, title, description, max_players, genre')
          .order('created_at', { ascending: false })
        if (genreFilter) {
          query = query.eq('genre', genreFilter)
        }
        const { data, error } = await query

        if (error) throw error
        setStories(data || [])
      } catch (error) {
        console.error('Failed to load stories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStories()
  }, [genreFilter])

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
          <p className="text-purple-200 mb-2">
            সবার choice মিলে গল্প এগোবে। গোপন চরিত্র নিয়ে চ্যাট করুন, বট বা বন্ধুদের সঙ্গে খেলুন।
          </p>
          <p className="text-purple-300 text-sm mb-4">
            জয়েন করলে আপনি একটা গল্পের চরিত্র পাবেন (কেউ জানবে না কে কোন চরিত্র)। সবার choice জমা হলে গল্প পরের দৃশ্যে যাবে।
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-purple-300 text-sm">জেনার:</span>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              {GENRES.map((g) => (
                <option key={g.value || 'all'} value={g.value} className="bg-purple-900 text-white">
                  {g.label}
                </option>
              ))}
            </select>
          </div>
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
                {story.genre && (
                  <span className="inline-block text-xs bg-purple-600/50 text-purple-200 px-2 py-0.5 rounded mb-2">
                    {GENRES.find((g) => g.value === story.genre)?.label || story.genre}
                  </span>
                )}
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
