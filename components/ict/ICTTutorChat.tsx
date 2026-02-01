'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type Message = { role: 'user' | 'assistant'; content: string; imageUrl?: string }

type OptionButton = { label: string; action: string }

type SessionState = {
  phase?: string
  chapterId?: string
  topicId?: string
}

type ICTTutorChatProps = {
  onChapterComplete?: (chapterId: string) => void
  onSessionChange?: (state: SessionState) => void
  selectedChapter?: { id: string; label: string } | null
  onSelectedChapterHandled?: () => void
}

export default function ICTTutorChat({
  onChapterComplete,
  onSessionChange,
  selectedChapter,
  onSelectedChapterHandled,
}: ICTTutorChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [options, setOptions] = useState<OptionButton[] | null>(null)
  const [sessionState, setSessionState] = useState<SessionState>({})
  const sessionRef = useRef<SessionState>({})
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  sessionRef.current = sessionState

  const speakText = useCallback((text: string, index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const cleaned = text.replace(/\*\*([^*]+)\*\*/g, '$1').trim()
    if (!cleaned) return
    const utterance = new SpeechSynthesisUtterance(cleaned)
    utterance.lang = 'bn-BD'
    utterance.rate = 0.9
    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)
    window.speechSynthesis.speak(utterance)
    setSpeakingIndex(index)
  }, [])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, options])

  const sendMessage = async (text: string, displayText?: string) => {
    const toSend = text.trim()
    if (!toSend) return
    const toShow = displayText || toSend
    setMessages((m) => [...m, { role: 'user', content: toShow }])
    setOptions(null)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ict/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: toSend,
          sessionState: sessionRef.current,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMessages((m) => [...m, { role: 'assistant', content: data.reply, imageUrl: data.imageUrl }])
      setOptions(data.options?.length ? data.options : null)
      if (data.nextState) {
        setSessionState(data.nextState)
        onSessionChange?.(data.nextState)
        if (data.reply?.includes('সব টপিক শেষ') && sessionRef.current.chapterId) {
          onChapterComplete?.(sessionRef.current.chapterId)
        }
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `ত্রুটি: ${err instanceof Error ? err.message : 'দুঃখিত, আবার চেষ্টা করুন।'}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleOptionClick = (opt: OptionButton) => {
    sendMessage(opt.action, opt.label)
  }

  const loadInitial = async () => {
    if (messages.length > 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/ict/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '', sessionState: {} }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMessages([{ role: 'assistant', content: data.reply, imageUrl: data.imageUrl }])
      setOptions(data.options?.length ? data.options : null)
      if (data.nextState) {
        setSessionState(data.nextState)
        onSessionChange?.(data.nextState)
      }
    } catch (err) {
      setMessages([{ role: 'assistant', content: `ত্রুটি: ${err instanceof Error ? err.message : 'দুঃখিত, আবার চেষ্টা করুন।'}` }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitial()
  }, [])

  useEffect(() => {
    if (selectedChapter && !loading) {
      sendMessage(`select_chapter:${selectedChapter.id}`, selectedChapter.label)
      onSelectedChapterHandled?.()
    }
  }, [selectedChapter?.id])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[600px] bg-slate-900/50 rounded-xl border border-emerald-500/30 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-bangla text-base">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              {msg.role === 'assistant' && msg.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img
                    src={msg.imageUrl}
                    alt="টপিক সংক্রান্ত ছবি"
                    className="max-w-full max-h-48 object-contain bg-slate-800"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap text-left flex-1">{msg.content}</p>
                {msg.role === 'assistant' && msg.content && (
                  <button
                    type="button"
                    onClick={() =>
                      speakingIndex === i ? stopSpeaking() : speakText(msg.content, i)
                    }
                    title={speakingIndex === i ? 'বন্ধ করুন' : 'পড়ে শুনান'}
                    className="shrink-0 p-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-200 transition-colors"
                  >
                    {speakingIndex === i ? (
                      <span className="text-xs">⏹ বন্ধ</span>
                    ) : (
                      <span className="text-xs">🔊 শুনুন</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-lg px-4 py-2 text-slate-300">
              লেখা হচ্ছে...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {options && options.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(opt)}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-600">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="বার্তা লিখুন..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            পাঠান
          </button>
        </div>
      </form>
    </div>
  )
}
