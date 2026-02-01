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

type UserGender = 'male' | 'female' | ''
type PendingJoin = { storyId: string; forceNewInstance: boolean } | null

export default function MultiverseStoriesPage() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [genreFilter, setGenreFilter] = useState<string>('')
  const [showGenderModal, setShowGenderModal] = useState(false)
  const [pendingJoin, setPendingJoin] = useState<PendingJoin>(null)

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

  const openJoinModal = (storyId: string, forceNewInstance = false) => {
    if (!accessToken) {
      router.push('/login')
      return
    }
    setPendingJoin({ storyId, forceNewInstance })
    setShowGenderModal(true)
  }

  const handleJoinStory = async (userGender: UserGender) => {
    if (!accessToken || !pendingJoin) return

    setShowGenderModal(false)
    const { storyId, forceNewInstance } = pendingJoin
    setPendingJoin(null)

    try {
      const response = await fetch(`/api/multiverse/stories/${storyId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forceNewInstance,
          userGender: userGender === 'male' || userGender === 'female' ? userGender : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error: ${data.error || 'Failed to join story'}`)
        return
      }

      if (data.hasCompletedStory) {
        const go = window.confirm(
          "You've finished this timeline! Want to try a different branch? (You'll get a fresh instance.)"
        )
        if (!go) return
      }

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
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-purple-300">
                      👥 {story.max_players} players
                    </div>
                    <button
                      onClick={() => openJoinModal(story.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Join Story
                    </button>
                  </div>
                  <button
                    onClick={() => openJoinModal(story.id, true)}
                    className="text-sm text-purple-300 hover:text-purple-200 underline text-left"
                  >
                    Join New Multiverse (fresh timeline)
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

      {/* Gender selection modal — বিপরীত লিঙ্গের চরিত্র পাবেন */}
      {showGenderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-purple-500/50 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">আপনার লিঙ্গ নির্বাচন করুন</h3>
            <p className="text-purple-200 text-sm mb-4">
              আপনার বিপরীত লিঙ্গের চরিত্র assign করা হবে (পুরুষ → নারী চরিত্র, নারী → পুরুষ চরিত্র)
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleJoinStory('female')}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                নারী (Female)
              </button>
              <button
                onClick={() => handleJoinStory('male')}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                পুরুষ (Male)
              </button>
              <button
                onClick={() => handleJoinStory('')}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-purple-200 rounded-lg transition-colors border border-white/20"
              >
                পছন্দ নেই (যেকোনো চরিত্র)
              </button>
              <button
                onClick={() => { setShowGenderModal(false); setPendingJoin(null) }}
                className="w-full py-2 text-purple-300 hover:text-white text-sm"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
