/**
 * ICT Narrative Controller — State machine and branching logic
 * Loads book_structure.json as source of truth
 */

import type { BookStructure, Topic, Chapter, QuizQuestion, SessionState } from './types'

let cachedStructure: BookStructure | null = null

async function loadBookStructure(): Promise<BookStructure> {
  if (cachedStructure) return cachedStructure
  const path = await import('path')
  const fs = await import('fs')
  const p = path.join(process.cwd(), 'data', 'ict', 'book_structure.json')
  const raw = fs.readFileSync(p, 'utf-8')
  cachedStructure = JSON.parse(raw) as BookStructure
  return cachedStructure
}

export async function getBookStructure(): Promise<BookStructure> {
  return loadBookStructure()
}

export async function getIntroduction(): Promise<string> {
  const book = await loadBookStructure()
  return `আসসালামু আলাইকুম! আমি আপনার ICT টিউটর। আজ আমরা ${book.title} বইয়ের বিভিন্ন অধ্যায় নিয়ে আলোচনা করব। আপনি কোন অধ্যায় দিয়ে শুরু করতে চান?`
}

export function getChapterList(book: BookStructure): Array<{ id: string; title: string }> {
  return book.chapters.map((ch) => ({ id: ch.id, title: ch.title }))
}

export function getTopicList(book: BookStructure, chapterId: string): Array<{ id: string; title: string }> {
  const ch = book.chapters.find((c) => c.id === chapterId)
  if (!ch) return []
  return ch.topics.map((t) => ({ id: t.id, title: t.title }))
}

export function getTopic(book: BookStructure, topicId: string): Topic | null {
  for (const ch of book.chapters) {
    const t = ch.topics.find((t) => t.id === topicId)
    if (t) return t
  }
  return null
}

export type TopicContentResult = {
  text: string
  imageUrl?: string
}

export async function getTopicContent(topicId: string): Promise<TopicContentResult> {
  const book = await loadBookStructure()
  const topic = getTopic(book, topicId)
  if (!topic) return { text: 'এই টপিকটি খুঁজে পাওয়া যাচ্ছে না।' }
  const concepts = topic.concepts.join('\n• ')
  const examples = topic.examples?.length
    ? `\n\nউদাহরণ:\n${topic.examples.map((e) => `• ${e}`).join('\n')}`
    : ''
  const text = `**${topic.title}**\n\nমূল ধারণা:\n• ${concepts}${examples}\n\nবুঝতে পারলেন? "পরবর্তী টপিক" এ যেতে পারেন অথবা "আরও সহজে ব্যাখ্যা" চাইতে পারেন।`
  return { text, imageUrl: topic.imageUrl }
}

/** Real-world analogies per topic (ICT book-inspired) for adaptive learning */
const TOPIC_ANALOGIES: Record<string, string> = {
  'ch1-t1': 'তথ্য যেমন রেসিপি — কাঁচা উপাদান (ডেটা) দিয়ে রান্না করলে একটা পূর্ণাঙ্গ খাবার (তথ্য) হয়।',
  'ch1-t2': 'ICT যেমন পোস্ট অফিস — তথ্য এক জায়গা থেকে অন্য জায়গায় পৌঁছে দেয়, ঠিক চিঠির মতো।',
  'ch2-t1': 'কম্পিউটার যেমন রেসিপে — আপনি ইনপুট দেন (উপাদান), প্রক্রিয়া হয় (রান্না), আউটপুট আসে (খাবার)।',
  'ch3-t1': 'বাইনারি যেমন সিঁড়ির আলো — হয় জ্বলে (১) নয় নিভে (০)। শুধু দুটো স্টেট।',
  'ch4-t1': 'স্প্রেডশিট যেমন খাতা — সারি আর কলাম দিয়ে টেবিল; প্রতিটি ঘর একটা নির্দিষ্ট জায়গা।',
  'ch4-t2': 'SUM যেমন দোকানের বিল — সব জিনিসের দাম যোগ করলে মোট বিল। AVERAGE হলো গড় — মোটকে ভাগ করে নেওয়া।',
  'ch5-t1': 'ইন্টারনেট যেমন বিশ্বের সড়ক — যেকোনো জায়গায় তথ্য যাতায়াত করতে পারে।',
  'ch6-t1': 'অ্যালগোরিদম যেমন রান্নার রেসিপি — ধাপে ধাপে নির্দেশ, যা অনুসরণ করলে ফলাফল মেলে।',
}

export async function getSimplerExplanation(topicId: string): Promise<string> {
  const book = await loadBookStructure()
  const topic = getTopic(book, topicId)
  if (!topic) return 'এই টপিকটি খুঁজে পাওয়া যাচ্ছে না।'
  const ex = topic.examples?.[0] ?? topic.concepts[0]
  return `আরও সহজভাবে বলি:\n\n${ex}\n\nএটি দৈনন্দিন জীবনের উদাহরণের মতো। আবার চেষ্টা করুন—বুঝতে পারলেন কিনা জানান।`
}

/**
 * Adaptive Learning: When user fails quiz twice, return simpler explanation with real-world analogy
 */
export async function getSimplerExplanationWithAnalogy(topicId: string): Promise<string> {
  const book = await loadBookStructure()
  const topic = getTopic(book, topicId)
  if (!topic) return 'এই টপিকটি খুঁজে পাওয়া যাচ্ছে না।'
  const analogy = TOPIC_ANALOGIES[topicId] ?? topic.examples?.[0] ?? topic.concepts[0]
  const concepts = topic.concepts.join(', ')
  return `দুইবার ভুল হওয়ায় আমি আরও সহজভাবে ব্যাখ্যা করছি:\n\n**বাস্তব উদাহরণ:**\n${analogy}\n\n**মূল ধারণা:** ${concepts}\n\nএখন আবার কুইজ দিতে চান? না হলে পরবর্তী টপিকে যান।`
}

/**
 * Suggest topics to revise based on weak points (topics user struggled with)
 */
export function getSuggestedWeakTopics(
  book: BookStructure,
  weakTopicIds: string[]
): Array<{ id: string; title: string; chapterTitle: string }> {
  const result: Array<{ id: string; title: string; chapterTitle: string }> = []
  for (const ch of book.chapters) {
    for (const t of ch.topics) {
      if (weakTopicIds.includes(t.id)) {
        result.push({ id: t.id, title: t.title, chapterTitle: ch.title })
      }
    }
  }
  return result
}

export async function getQuizForTopic(topicId: string): Promise<{
  question: string
  options: string[]
  questionIndex: number
} | null> {
  const book = await loadBookStructure()
  const topic = getTopic(book, topicId)
  if (!topic?.quizQuestions?.length) return null
  const q = topic.quizQuestions[0]
  return {
    question: q.question,
    options: q.options,
    questionIndex: 0,
  }
}

export type EvaluateAnswerResult = {
  correct: boolean
  feedback: string
  correctiveFeedback?: string
  hint?: string
}

/**
 * Evaluate quiz answer. On wrong answer: find concept from book, return corrective feedback + hint.
 */
export async function evaluateAnswer(
  topicId: string,
  answerIndex: number,
  questionIndex = 0
): Promise<EvaluateAnswerResult> {
  const book = await loadBookStructure()
  const topic = getTopic(book, topicId)
  if (!topic?.quizQuestions?.length) return { correct: false, feedback: 'কোয়িজ খুঁজে পাওয়া যাচ্ছে না।' }
  const q = topic.quizQuestions[questionIndex]
  if (!q) return { correct: false, feedback: 'প্রশ্ন খুঁজে পাওয়া যাচ্ছে না।' }

  const correct = answerIndex === q.correct
  const correctAnswerText = q.options[q.correct]
  const wrongAnswerText = q.options[answerIndex]

  if (correct) {
    return {
      correct: true,
      feedback: 'সঠিক! চমৎকার। পরবর্তী টপিকে যেতে পারেন।',
    }
  }

  // Wrong answer: find relevant concept from book and build corrective feedback
  const relevantConcept = topic.concepts[0] ?? `এই টপিকে ${topic.title} সম্পর্কে আলোচনা করা হয়েছে।`
  const example = topic.examples?.[0]

  const correctiveFeedback = [
    `**NCTB বই অনুযায়ী:** ${relevantConcept}`,
    `তাই সঠিক উত্তর হলো: **${correctAnswerText}**।`,
    `আপনার দেওয়া উত্তর "${wrongAnswerText}" এই ধারণার সাথে মিলে না।`,
  ].join('\n\n')

  const hint = example
    ? `হিন্ট: ${example}`
    : `হিন্ট: "${topic.title}" টপিকের সংজ্ঞা বা ধারণা আবার দেখুন।`

  const feedback = [
    'ভুল।',
    correctiveFeedback,
    hint,
  ].join('\n\n')

  return {
    correct: false,
    feedback,
    correctiveFeedback,
    hint,
  }
}

export function getContextForAI(book: BookStructure, state: SessionState): string {
  const parts: string[] = [`বই: ${book.title}`]
  if (state.chapterId) {
    const ch = book.chapters.find((c) => c.id === state.chapterId)
    if (ch) parts.push(`অধ্যায়: ${ch.title}`)
  }
  if (state.topicId) {
    const topic = getTopic(book, state.topicId)
    if (topic) {
      parts.push(`টপিক: ${topic.title}`)
      parts.push(`ধারণা: ${topic.concepts.join('; ')}`)
    }
  }
  parts.push(`পর্যায়: ${state.phase}`)
  return parts.join('\n')
}
