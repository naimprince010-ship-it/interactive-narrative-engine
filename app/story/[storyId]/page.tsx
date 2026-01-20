'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getStoryById, getChapterByStoryAndId } from '@/data/stories'
import { Chapter } from '@/types/story'
import PaymentModal from '@/components/PaymentModal'
import Link from 'next/link'

export default function StoryPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const storyId = params.storyId as string
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null)
  const [unlockedChapters, setUnlockedChapters] = useState<Set<string>>(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [hasVerifiedPayment, setHasVerifiedPayment] = useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)

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
    if (currentChapterId && story) {
      const chapterData = getChapterByStoryAndId(storyId, currentChapterId)
      setChapter(chapterData || null)
    }
  }, [currentChapterId, storyId, story])

  useEffect(() => {
    const paymentFlag = localStorage.getItem(`story-payment-${storyId}`)
    if (paymentFlag) {
      setHasVerifiedPayment(true)
    }
  }, [storyId])

  useEffect(() => {
    const paymentID =
      searchParams.get('paymentID') ||
      searchParams.get('paymentId') ||
      searchParams.get('payment_id')

    if (!paymentID || !storyId || !deviceId || isVerifyingPayment) {
      return
    }

    setIsVerifyingPayment(true)

    fetch('/api/bkash/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'execute',
        storyId,
        paymentID,
        deviceId,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text())
        }
        return response.json()
      })
      .then((data) => {
        if (data.success) {
          localStorage.setItem(`story-payment-${storyId}`, 'true')
          setHasVerifiedPayment(true)
          const pending = localStorage.getItem(`story-pending-${storyId}`)
          if (pending) {
            handlePaymentSuccess(pending)
          }
        }
      })
      .catch(() => {
        // Ignore and allow manual retry via modal
      })
      .finally(() => {
        setIsVerifyingPayment(false)
        router.replace(`/story/${storyId}`)
      })
  }, [deviceId, isVerifyingPayment, router, searchParams, storyId])

  const handleChoiceClick = async (nextChapterId: string) => {
    const nextChapter = getChapterByStoryAndId(storyId, nextChapterId)
    
    if (nextChapter?.isPremium && !unlockedChapters.has(nextChapterId)) {
      if (hasVerifiedPayment && story) {
        const newUnlocked = new Set(unlockedChapters)
        newUnlocked.add(nextChapterId)
        setUnlockedChapters(newUnlocked)
        setCurrentChapterId(nextChapterId)
        localStorage.setItem(`story-${storyId}`, JSON.stringify({
          currentChapterId: nextChapterId,
          unlockedChapters: Array.from(newUnlocked),
        }))
        return
      }

      if (deviceId) {
        try {
          const response = await fetch(`/api/bkash/payment?storyId=${storyId}&deviceId=${deviceId}`)
          const data = await response.json()
          if (data.hasPayment) {
            localStorage.setItem(`story-payment-${storyId}`, 'true')
            setHasVerifiedPayment(true)
            const newUnlocked = new Set(unlockedChapters)
            newUnlocked.add(nextChapterId)
            setUnlockedChapters(newUnlocked)
            setCurrentChapterId(nextChapterId)
            localStorage.setItem(`story-${storyId}`, JSON.stringify({
              currentChapterId: nextChapterId,
              unlockedChapters: Array.from(newUnlocked),
            }))
            return
          }
        } catch {
          // Fall through to payment modal
        }
      }

      setPendingChapterId(nextChapterId)
      localStorage.setItem(`story-pending-${storyId}`, nextChapterId)
      setShowPaymentModal(true)
      return
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

  const handlePaymentSuccess = (chapterId?: string) => {
    const targetChapterId = chapterId || pendingChapterId
    if (!targetChapterId) {
      return
    }

    const newUnlocked = new Set(unlockedChapters)
    newUnlocked.add(targetChapterId)
    setUnlockedChapters(newUnlocked)
    setCurrentChapterId(targetChapterId)

    if (story) {
      localStorage.setItem(`story-${storyId}`, JSON.stringify({
        currentChapterId: targetChapterId,
        unlockedChapters: Array.from(newUnlocked),
      }))
    }

    localStorage.removeItem(`story-pending-${storyId}`)
    setShowPaymentModal(false)
    setPendingChapterId(null)
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
        <Link href="/" className="text-purple-300 hover:text-white mb-4 inline-block">
          ← Back to Stories
        </Link>
        
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
                    !unlockedChapters.has(choice.nextChapterId) &&
                    !hasVerifiedPayment
                  
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
                      {choice.text}
                      {isLocked && (
                        <span className="ml-2 text-yellow-400">🔒 (Premium - 10 BDT)</span>
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
          amount={10}
          storyId={storyId}
          chapterTitle={pendingChapterId ? getChapterByStoryAndId(storyId, pendingChapterId)?.title || 'Chapter' : 'Chapter'}
        />
      )}
    </main>
  )
}
