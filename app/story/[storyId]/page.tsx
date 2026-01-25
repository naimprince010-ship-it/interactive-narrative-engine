'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getStoryById, getChapterByStoryAndId } from '@/data/stories'
import { Chapter } from '@/types/story'
import PaymentModal from '@/components/PaymentModal'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabaseClient'

export default function StoryPage() {
  const params = useParams()
  const storyId = params.storyId as string
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null)
  const [unlockedChapters, setUnlockedChapters] = useState<Set<string>>(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [tokenBalance, setTokenBalance] = useState<number | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const tokenCost = 10

  const story = getStoryById(storyId)

  useEffect(() => {
    if (story) {
      const savedProgress = localStorage.getItem(`story-${storyId}`)
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        setCurrentChapterId(progress.currentChapterId || story.startingChapterId)
        setUnlockedChapters(new Set(progress.unlockedChapters || [story.startingChapterId]))
      } else {
        setCurrentChapterId(story.startingChapterId)
        setUnlockedChapters(new Set([story.startingChapterId]))
      }
    }
  }, [storyId, story])

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
    const storedDeviceId = localStorage.getItem('device-id')
    if (storedDeviceId) {
      setDeviceId(storedDeviceId)
      return
    }

    const generated = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`

    localStorage.setItem('device-id', generated)
    setDeviceId(generated)
  }, [])

  useEffect(() => {
    if (!deviceId && !accessToken) {
      return
    }

    const cacheKey = accessToken ? `token-balance-user` : `token-balance-${deviceId}`
    const cached = cacheKey ? localStorage.getItem(cacheKey) : null
    if (cached) {
      const parsed = Number(cached)
      if (!Number.isNaN(parsed)) {
        setTokenBalance(parsed)
      }
    }

    const url = accessToken ? '/api/tokens' : `/api/tokens?deviceId=${deviceId}`
    fetch(url, {
      headers: accessToken ? { authorization: `Bearer ${accessToken}` } : undefined,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text())
        }
        return response.json()
      })
      .then((data) => {
        if (typeof data.balance === 'number') {
          setTokenBalance(data.balance)
          if (cacheKey) {
            localStorage.setItem(cacheKey, String(data.balance))
          }
        }
      })
      .catch(() => {
        // Ignore fetch errors for now
      })
  }, [accessToken, deviceId])

  useEffect(() => {
    if (currentChapterId && story) {
      const chapterData = getChapterByStoryAndId(storyId, currentChapterId)
      setChapter(chapterData || null)
    }
  }, [currentChapterId, storyId, story])

  const handleChoiceClick = async (nextChapterId: string) => {
    const nextChapter = getChapterByStoryAndId(storyId, nextChapterId)
    
    if (nextChapter?.isPremium && !unlockedChapters.has(nextChapterId)) {
      if ((!deviceId && !accessToken) || tokenBalance === null || tokenBalance < tokenCost) {
        setPendingChapterId(nextChapterId)
        setShowPaymentModal(true)
        return
      }

      try {
        const response = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            action: 'spend',
            deviceId,
            amount: tokenCost,
          }),
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        const data = await response.json()
        if (typeof data.balance === 'number') {
          setTokenBalance(data.balance)
          const cacheKey = accessToken ? 'token-balance-user' : `token-balance-${deviceId}`
          if (cacheKey) {
            localStorage.setItem(cacheKey, String(data.balance))
          }
        }
      } catch {
        setPendingChapterId(nextChapterId)
        setShowPaymentModal(true)
        return
      }
    }

    setCurrentChapterId(nextChapterId)
    const newUnlocked = new Set(unlockedChapters)
    newUnlocked.add(nextChapterId)
    setUnlockedChapters(newUnlocked)

    // Save progress
    if (story) {
      localStorage.setItem(`story-${storyId}`, JSON.stringify({
        currentChapterId: nextChapterId,
        unlockedChapters: Array.from(newUnlocked),
      }))
    }
  }

  const handlePaymentSuccess = async (balance: number) => {
    if (!deviceId && !accessToken) {
      return
    }

    setTokenBalance(balance)
    const cacheKey = accessToken ? 'token-balance-user' : `token-balance-${deviceId}`
    if (cacheKey) {
      localStorage.setItem(cacheKey, String(balance))
    }

    if (!pendingChapterId) {
      setShowPaymentModal(false)
      return
    }

    if (balance < tokenCost) {
      setShowPaymentModal(false)
      setPendingChapterId(null)
      return
    }

    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'spend',
          deviceId,
          amount: tokenCost,
        }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      if (typeof data.balance === 'number') {
        setTokenBalance(data.balance)
        const spendCacheKey = accessToken ? 'token-balance-user' : `token-balance-${deviceId}`
        if (spendCacheKey) {
          localStorage.setItem(spendCacheKey, String(data.balance))
        }
      }

      const newUnlocked = new Set(unlockedChapters)
      newUnlocked.add(pendingChapterId)
      setUnlockedChapters(newUnlocked)
      setCurrentChapterId(pendingChapterId)

      if (story) {
        localStorage.setItem(`story-${storyId}`, JSON.stringify({
          currentChapterId: pendingChapterId,
          unlockedChapters: Array.from(newUnlocked),
        }))
      }
    } catch {
      // Ignore spend failure
    } finally {
      setShowPaymentModal(false)
      setPendingChapterId(null)
    }
  }

  if (!story || !chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Story not found</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-purple-300 hover:text-white">
            ← Back to Stories
          </Link>
          <div className="text-yellow-200 text-sm bg-yellow-500/10 border border-yellow-500/40 px-3 py-1 rounded-full">
            🪙 {tokenBalance ?? '...'}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-2">{story.title}</h1>
            <h2 className="text-2xl font-semibold text-purple-300 mb-6">{chapter.title}</h2>
            
            {chapter.isPremium && (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
                <p className="text-yellow-200 font-semibold">🌟 Premium Chapter</p>
              </div>
            )}

            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-lg text-white whitespace-pre-line leading-relaxed">
                {chapter.content}
              </p>
            </div>

            {chapter.choices.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">Your Choices:</h3>
                {chapter.choices.map((choice) => {
                  const nextChapter = getChapterByStoryAndId(storyId, choice.nextChapterId)
                  const isLocked =
                    nextChapter?.isPremium &&
                    !unlockedChapters.has(choice.nextChapterId)
                  const displayText = isLocked
                    ? 'পরের পাতা উল্টান (১০ টোকেন লাগবে)'
                    : choice.text
                  
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleChoiceClick(choice.nextChapterId)}
                      disabled={isLocked}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        isLocked
                          ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium shadow-lg hover:scale-105'
                      }`}
                    >
                      {displayText}
                      {isLocked && (
                        <span className="ml-2 text-yellow-400">🔒</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xl text-purple-300 mb-4">The End</p>
                <Link
                  href="/"
                  className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Return to Stories
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          onClose={() => {
            setShowPaymentModal(false)
            setPendingChapterId(null)
          }}
          onSuccess={handlePaymentSuccess}
          chapterTitle={pendingChapterId ? getChapterByStoryAndId(storyId, pendingChapterId)?.title || 'Chapter' : 'Chapter'}
        />
      )}
    </main>
  )
}
