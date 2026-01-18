'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getStoryById, getChapterByStoryAndId } from '@/data/stories'
import { Chapter } from '@/types/story'
import PaymentModal from '@/components/PaymentModal'
import Link from 'next/link'

export default function StoryPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null)
  const [unlockedChapters, setUnlockedChapters] = useState<Set<string>>(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)

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
    if (currentChapterId && story) {
      const chapterData = getChapterByStoryAndId(storyId, currentChapterId)
      setChapter(chapterData || null)
    }
  }, [currentChapterId, storyId, story])

  const handleChoiceClick = (nextChapterId: string) => {
    const nextChapter = getChapterByStoryAndId(storyId, nextChapterId)
    
    if (nextChapter?.isPremium && !unlockedChapters.has(nextChapterId)) {
      setPendingChapterId(nextChapterId)
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

  const handlePaymentSuccess = () => {
    if (pendingChapterId) {
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
                  const isLocked = nextChapter?.isPremium && !unlockedChapters.has(choice.nextChapterId)
                  
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
          chapterTitle={pendingChapterId ? getChapterByStoryAndId(storyId, pendingChapterId)?.title || 'Chapter' : 'Chapter'}
        />
      )}
    </main>
  )
}
