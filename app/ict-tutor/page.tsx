'use client'

import { useState } from 'react'
import Link from 'next/link'
import ICTTutorChat from '@/components/ict/ICTTutorChat'
import ProgressMap from '@/components/ict/ProgressMap'
import { useICTProgress } from '@/lib/ict/useICTProgress'

export default function ICTTutorPage() {
  const { completedChapters, currentChapter, addCompletedChapter, setCurrentChapter } =
    useICTProgress()
  const [selectedChapter, setSelectedChapter] = useState<{
    id: string
    label: string
  } | null>(null)

  const handleChapterSelect = (chapter: { id: string; title: string }) => {
    setSelectedChapter({ id: chapter.id, label: chapter.title })
  }

  const handleSessionChange = (state: { chapterId?: string }) => {
    setCurrentChapter(state.chapterId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">ICT টিউটর</h1>
          <Link
            href="/dashboard"
            className="text-emerald-300 hover:text-emerald-200 text-sm underline"
          >
            ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>
        <p className="text-slate-300 text-sm mb-4">
          নবম-দশম শ্রেণির তথ্য ও যোগাযোগ প্রযুক্তি বই থেকে শিখুন। বাটন চাপে অধ্যায় ও টপিক বেছে নিন।
        </p>

        <div className="mb-4">
          <ProgressMap
            completedChapters={completedChapters}
            currentChapter={currentChapter}
            onChapterSelect={handleChapterSelect}
          />
        </div>

        <ICTTutorChat
          onChapterComplete={addCompletedChapter}
          onSessionChange={handleSessionChange}
          selectedChapter={selectedChapter}
          onSelectedChapterHandled={() => setSelectedChapter(null)}
        />

        <div className="mt-4 flex gap-2">
          <Link
            href="/ict-tutor/spreadsheet"
            className="text-emerald-300 hover:text-emerald-200 text-sm underline"
          >
            স্প্রেডশিট অনুশীলন →
          </Link>
        </div>
      </div>
    </div>
  )
}
