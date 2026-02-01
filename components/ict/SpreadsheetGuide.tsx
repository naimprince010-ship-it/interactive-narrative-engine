'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'

type Step = {
  id: string
  title: string
  instruction: string
  task: 'sum' | 'average' | 'select'
  targetCell?: string
  expected?: number
}

const STEPS: Step[] = [
  {
    id: '1',
    title: 'স্প্রেডশিট পরিচিতি',
    instruction: 'নিচের টেবিলে সারি ও কলাম আছে। A1 মানে প্রথম কলামের প্রথম সারি। B2 মানে দ্বিতীয় কলামের দ্বিতীয় সারি। কোনো সেলে ক্লিক করে মান পরিবর্তন করতে পারেন।',
    task: 'select',
    targetCell: 'A1',
  },
  {
    id: '2',
    title: 'SUM ফাংশন',
    instruction: 'B2 থেকে B5 পর্যন্ত সংখ্যাগুলোর যোগফল বের করুন। C6 সেলে ক্লিক করে সূত্র লিখুন: =SUM(B2:B5) — তারপর Enter চাপুন। সঠিক হলে Success দেখা যাবে।',
    task: 'sum',
    targetCell: 'C6',
    expected: 10 + 20 + 30 + 40, // 100
  },
  {
    id: '3',
    title: 'AVERAGE ফাংশন',
    instruction: 'B2 থেকে B5 পর্যন্ত সংখ্যাগুলোর গড় বের করুন। D6 সেলে ক্লিক করে সূত্র লিখুন: =AVERAGE(B2:B5) — তারপর Enter চাপুন। সঠিক হলে Success দেখা যাবে।',
    task: 'average',
    targetCell: 'D6',
    expected: (10 + 20 + 30 + 40) / 4, // 25
  },
]

const COLS = ['A', 'B', 'C', 'D']
const ROWS = [1, 2, 3, 4, 5, 6]

const INITIAL_CELLS: Record<string, string> = {
  B2: '10',
  B3: '20',
  B4: '30',
  B5: '40',
}

function parseRange(range: string): string[] {
  const m = range.match(/^([A-Z])(\d+):([A-Z])(\d+)$/i)
  if (!m) return []
  const [, c1, r1, c2, r2] = m
  const colStart = c1.charCodeAt(0) - 65
  const colEnd = c2.charCodeAt(0) - 65
  const rowStart = parseInt(r1, 10)
  const rowEnd = parseInt(r2, 10)
  const cells: string[] = []
  for (let r = rowStart; r <= rowEnd; r++) {
    for (let c = colStart; c <= colEnd; c++) {
      cells.push(String.fromCharCode(65 + c) + r)
    }
  }
  return cells
}

function evaluateFormula(
  formula: string,
  cells: Record<string, string>
): number | string | null {
  const f = formula.trim().toUpperCase()
  if (!f.startsWith('=')) return null

  const sumMatch = f.match(/^=SUM\(([A-Z]\d+:[A-Z]\d+)\)$/i)
  if (sumMatch) {
    const rangeCells = parseRange(sumMatch[1])
    const vals = rangeCells.map((ref) => parseFloat(cells[ref] || '0'))
    if (vals.some((v) => isNaN(v))) return null
    return vals.reduce((a, b) => a + b, 0)
  }

  const avgMatch = f.match(/^=AVERAGE\(([A-Z]\d+:[A-Z]\d+)\)$/i)
  if (avgMatch) {
    const rangeCells = parseRange(avgMatch[1])
    const vals = rangeCells.map((ref) => parseFloat(cells[ref] || '0'))
    if (vals.some((v) => isNaN(v)) || vals.length === 0) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  return null
}

function getCellRef(col: string, row: number): string {
  return col + row
}

export default function SpreadsheetGuide() {
  const [stepIndex, setStepIndex] = useState(0)
  const [cells, setCells] = useState<Record<string, string>>(() => ({ ...INITIAL_CELLS }))
  const [feedback, setFeedback] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1

  const getCellValue = useCallback(
    (ref: string): string => {
      const raw = cells[ref] ?? ''
      if (raw.startsWith('=')) {
        const result = evaluateFormula(raw, cells)
        if (result !== null && typeof result === 'number') return String(result)
      }
      return raw
    },
    [cells]
  )

  const getCellRaw = useCallback(
    (ref: string): string => {
      return cells[ref] ?? ''
    },
    [cells]
  )

  const updateCell = useCallback((ref: string, value: string) => {
    setCells((prev) => {
      const next = { ...prev }
      if (value === '') delete next[ref]
      else next[ref] = value
      return next
    })
  }, [])

  useEffect(() => {
    setFeedback(null)
    setSuccess(false)
  }, [stepIndex])

  useEffect(() => {
    if (step.task !== 'sum' && step.task !== 'average' || !step.targetCell) return
    const raw = cells[step.targetCell] ?? ''
    if (!raw.startsWith('=')) return

    const result = evaluateFormula(raw, cells)
    if (result === null || typeof result !== 'number') return

    const expected = step.expected ?? 0
    const correct = Math.abs(result - expected) < 0.001

    if (correct) {
      const formula = raw.trim().toUpperCase()
      const isSum = step.task === 'sum' && /^=SUM\(B2:B5\)$/.test(formula)
      const isAvg = step.task === 'average' && /^=AVERAGE\(B2:B5\)$/.test(formula)
      if (isSum || isAvg) {
        setSuccess(true)
        setFeedback('সঠিক! Success — আপনি সূত্রটি সঠিকভাবে ব্যবহার করেছেন।')
      }
    } else {
      setSuccess(false)
      setFeedback(null)
    }
  }, [cells, step.task, step.targetCell, step.expected])

  const handleCellBlur = useCallback(
    (ref: string) => {
      setEditingCell(null)
      updateCell(ref, editValue.trim())
    },
    [editValue, updateCell]
  )

  const handleCellFocus = useCallback((ref: string) => {
    setEditingCell(ref)
    setEditValue(cells[ref] ?? '')
  }, [cells])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">স্প্রেডশিট অনুশীলন</h1>
          <Link
            href="/ict-tutor"
            className="text-emerald-300 hover:text-emerald-200 text-sm underline"
          >
            ICT টিউটরে ফিরে যান
          </Link>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-4 mb-4 border border-emerald-500/30">
          <h2 className="text-lg font-semibold text-white mb-2">{step.title}</h2>
          <p className="text-slate-200 text-sm mb-4">{step.instruction}</p>

          <div className="bg-slate-900 rounded-lg p-2 overflow-x-auto mb-4">
            <table className="border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-slate-600 px-2 py-1 min-w-[32px] bg-slate-700 text-slate-300" />
                  {COLS.map((c) => (
                    <th
                      key={c}
                      className="border border-slate-600 px-2 py-1 min-w-[64px] bg-slate-700 text-slate-300 font-semibold"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row}>
                    <td className="border border-slate-600 px-2 py-1 bg-slate-700 text-slate-300 font-medium">
                      {row}
                    </td>
                    {COLS.map((col) => {
                      const ref = getCellRef(col, row)
                      const isEditing = editingCell === ref
                      const isTarget =
                        (step.task === 'sum' || step.task === 'average') && step.targetCell === ref
                      const isDataCell = ['B2', 'B3', 'B4', 'B5'].includes(ref)

                      return (
                        <td
                          key={ref}
                          className={`border border-slate-600 px-2 py-1 min-w-[64px] ${
                            isTarget ? 'bg-emerald-900/40 ring-1 ring-emerald-400' : 'bg-slate-800'
                          } ${isDataCell ? '' : ''}`}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleCellBlur(ref)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateCell(ref, editValue.trim())
                                  setEditingCell(null)
                                }
                                if (e.key === 'Escape') {
                                  setEditValue(cells[ref] ?? '')
                                  setEditingCell(null)
                                }
                              }}
                              autoFocus
                              className="w-full bg-slate-700 text-white px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCellFocus(ref)}
                              className="w-full text-left px-1 py-0.5 rounded hover:bg-slate-600/50 min-h-[24px] text-slate-200"
                            >
                              {getCellValue(ref) || '\u00A0'}
                            </button>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-slate-400 text-xs mb-2">
            টিপ: সেলে ক্লিক করুন, সূত্র লিখুন (যেমন =SUM(B2:B5)), Enter চাপুন। ফলাফল রিয়েল-টাইমে দেখা যাবে।
          </p>

          {feedback && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                success ? 'bg-emerald-900/50 text-emerald-200' : 'bg-amber-900/50 text-amber-200'
              }`}
            >
              {success && (
                <span className="text-emerald-400 font-bold text-lg">✓ Success</span>
              )}
              {feedback}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => {
              setStepIndex((i) => Math.max(0, i - 1))
              setFeedback(null)
              setSuccess(false)
            }}
            disabled={stepIndex === 0}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
          >
            পূর্ববর্তী
          </button>
          {!isLastStep ? (
            <button
              onClick={() => {
                setStepIndex((i) => i + 1)
                setFeedback(null)
                setSuccess(false)
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              পরবর্তী ধাপ
            </button>
          ) : (
            <Link
              href="/ict-tutor"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg inline-block"
            >
              ICT টিউটরে ফিরে যান
            </Link>
          )}
        </div>

        <div className="mt-4 text-slate-400 text-xs">
          ধাপ {stepIndex + 1} / {STEPS.length}
        </div>
      </div>
    </div>
  )
}
