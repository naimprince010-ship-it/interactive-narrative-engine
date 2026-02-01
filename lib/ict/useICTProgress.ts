'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ict-tutor-progress'

export type ICTProgress = {
  completedChapters: string[]
  currentChapter?: string
}

function loadProgress(): ICTProgress {
  if (typeof window === 'undefined') return { completedChapters: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as ICTProgress
      return {
        completedChapters: Array.isArray(data.completedChapters) ? data.completedChapters : [],
        currentChapter: data.currentChapter,
      }
    }
  } catch {
    // ignore
  }
  return { completedChapters: [] }
}

function saveProgress(progress: ICTProgress) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // ignore
  }
}

export function useICTProgress() {
  const [progress, setProgress] = useState<ICTProgress>({ completedChapters: [] })

  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  const addCompletedChapter = useCallback((chapterId: string) => {
    setProgress((prev) => {
      if (prev.completedChapters.includes(chapterId)) return prev
      const next = {
        ...prev,
        completedChapters: [...prev.completedChapters, chapterId].sort(),
      }
      saveProgress(next)
      return next
    })
  }, [])

  const setCurrentChapter = useCallback((chapterId?: string) => {
    setProgress((prev) => {
      const next = { ...prev, currentChapter: chapterId }
      saveProgress(next)
      return next
    })
  }, [])

  return {
    completedChapters: progress.completedChapters,
    currentChapter: progress.currentChapter,
    addCompletedChapter,
    setCurrentChapter,
  }
}
