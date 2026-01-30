'use client'

import { useEffect, useMemo, useState } from 'react'

export type MoodScore = {
  tension?: number
  romance?: number
  mystery?: number
  hope?: number
}

type Atmosphere = {
  /** Tailwind background gradient classes (e.g. for main container) */
  gradientClass: string
  /** Inline style for gradient (fallback if Tailwind doesn't cover) */
  gradientStyle: React.CSSProperties
  /** Suggested ambient sound: use with public/sounds/{sound}.mp3 if available */
  sound: 'tension' | 'mystery' | 'rain' | 'hope' | 'default'
  /** Dominant mood label for accessibility */
  label: string
}

const ATMOSPHERES: Record<string, Atmosphere> = {
  tension: {
    gradientClass: 'bg-gradient-to-br from-red-950 via-purple-950 to-black',
    gradientStyle: { background: 'linear-gradient(to bottom right, #450a0a, #3b0764, #0a0a0a)' },
    sound: 'tension',
    label: 'Tense',
  },
  mystery: {
    gradientClass: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950',
    gradientStyle: { background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #020617)' },
    sound: 'mystery',
    label: 'Mysterious',
  },
  rain: {
    gradientClass: 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900',
    gradientStyle: { background: 'linear-gradient(to bottom right, #1e293b, #1e3a5f, #0f172a)' },
    sound: 'rain',
    label: 'Atmospheric',
  },
  hope: {
    gradientClass: 'bg-gradient-to-br from-amber-950/80 via-purple-900 to-indigo-950',
    gradientStyle: { background: 'linear-gradient(to bottom right, rgba(69,26,3,0.8), #581c87, #1e1b4b)' },
    sound: 'hope',
    label: 'Hopeful',
  },
  default: {
    gradientClass: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
    gradientStyle: { background: 'linear-gradient(to bottom right, #581c87, #1e3a8a, #312e81)' },
    sound: 'default',
    label: 'Default',
  },
}

function getDominantMood(mood: MoodScore | null | undefined): keyof typeof ATMOSPHERES {
  if (!mood || typeof mood !== 'object') return 'default'
  const t = Math.max(0, Number(mood.tension) ?? 0)
  const r = Math.max(0, Number(mood.romance) ?? 0)
  const m = Math.max(0, Number(mood.mystery) ?? 0)
  const h = Math.max(0, Number(mood.hope) ?? 0)
  if (t >= 0.6 && t >= r && t >= m && t >= h) return 'tension'
  if (m >= 0.5 && m >= r && m >= h) return 'mystery'
  if (h >= 0.5 && h >= r) return 'hope'
  if (r >= 0.5) return 'rain' // soft, atmospheric
  return 'default'
}

/**
 * React hook: use mood_score from API to change Tailwind background gradient
 * and suggest ambient sound (rain, mystery, tension). Use gradientClass on
 * the main story container; optionally play sound from public/sounds/{sound}.mp3.
 */
export function useStoryAtmosphere(moodScore: MoodScore | null | undefined): Atmosphere {
  const atmosphere = useMemo(() => {
    const key = getDominantMood(moodScore)
    return ATMOSPHERES[key] ?? ATMOSPHERES.default
  }, [
    moodScore?.tension,
    moodScore?.romance,
    moodScore?.mystery,
    moodScore?.hope,
  ])

  return atmosphere
}

/**
 * Optional: play ambient sound when atmosphere changes.
 * Add MP3s to public/sounds: tension.mp3, mystery.mp3, rain.mp3, hope.mp3.
 */
export function useStoryAtmosphereWithSound(
  moodScore: MoodScore | null | undefined,
  options?: { enabled?: boolean; volume?: number }
) {
  const atmosphere = useStoryAtmosphere(moodScore)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const enabled = options?.enabled ?? true
  const volume = Math.max(0, Math.min(1, options?.volume ?? 0.2))

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    const src = `/sounds/${atmosphere.sound}.mp3`
    const a = new Audio(src)
    a.volume = volume
    a.loop = true
    setAudio(a)
    a.play().catch(() => {}) // autoplay may be blocked
    return () => {
      a.pause()
      a.src = ''
    }
  }, [atmosphere.sound, enabled, volume])

  return atmosphere
}
