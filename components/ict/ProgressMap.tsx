'use client'

type Chapter = { id: string; title: string }

const CHAPTERS: Chapter[] = [
  { id: 'ch1', title: 'তথ্য ও ICT পরিচিতি' },
  { id: 'ch2', title: 'কম্পিউটার' },
  { id: 'ch3', title: 'সংখ্যা পদ্ধতি' },
  { id: 'ch4', title: 'স্প্রেডশিট' },
  { id: 'ch5', title: 'ইন্টারনেট ও ইমেইল' },
  { id: 'ch6', title: 'প্রোগ্রামিং' },
]

type ProgressMapProps = {
  completedChapters: string[]
  currentChapter?: string
  onChapterSelect?: (chapter: { id: string; title: string }) => void
}

export default function ProgressMap({
  completedChapters,
  currentChapter,
  onChapterSelect,
}: ProgressMapProps) {
  const getStatus = (index: number, id: string) => {
    const completed = completedChapters.includes(id)
    const isCurrent = currentChapter === id
    const prevCompleted = index === 0 || completedChapters.includes(CHAPTERS[index - 1]?.id)
    const locked = !completed && !prevCompleted

    return { completed, isCurrent, locked }
  }

  return (
    <div className="bg-slate-800/80 rounded-xl p-4 border border-emerald-500/30">
      <h3 className="text-sm font-semibold text-white mb-3">আপনার শেখার পথ</h3>
      <div className="flex flex-wrap gap-1 sm:gap-2 items-center justify-center">
        {CHAPTERS.map((ch, i) => {
          const { completed, isCurrent, locked } = getStatus(i, ch.id)
          const canSelect = completed || isCurrent || (i > 0 && completedChapters.includes(CHAPTERS[i - 1]?.id)) || i === 0

          return (
            <div key={ch.id} className="flex items-center">
              {i > 0 && (
                <div
                  className={`hidden sm:block w-4 h-0.5 ${
                    completed && completedChapters.includes(CHAPTERS[i - 1]?.id)
                      ? 'bg-emerald-500'
                      : 'bg-slate-600'
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => canSelect && onChapterSelect?.({ id: ch.id, title: ch.title })}
                disabled={!canSelect || locked}
                title={locked ? 'আগের অধ্যায় শেষ করুন' : ch.title}
                className={`
                  relative flex flex-col items-center justify-center min-w-[72px] sm:min-w-[80px] py-2 px-2 rounded-lg
                  transition-all duration-200
                  ${locked ? 'opacity-50 cursor-not-allowed bg-slate-700/50' : 'cursor-pointer'}
                  ${completed ? 'bg-emerald-600/80 text-white hover:bg-emerald-600' : ''}
                  ${isCurrent && !completed ? 'bg-emerald-500/60 text-white ring-2 ring-emerald-400' : ''}
                  ${!completed && !isCurrent && !locked ? 'bg-slate-600 text-slate-200 hover:bg-slate-500' : ''}
                `}
              >
                {completed && (
                  <span className="absolute -top-0.5 -right-0.5 text-emerald-300 text-xs">✓</span>
                )}
                <span className="text-xs font-medium">অধ্যায় {i + 1}</span>
                <span className="text-[10px] sm:text-xs mt-0.5 line-clamp-2 text-center leading-tight">
                  {ch.title}
                </span>
              </button>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-600" /> সম্পূর্ণ
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-500/60 ring-1 ring-emerald-400" /> বর্তমান
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-600 opacity-50" /> লক
        </span>
      </div>
    </div>
  )
}
