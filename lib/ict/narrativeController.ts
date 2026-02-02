/**
 * ICT Narrative Controller — State machine and branching logic
 * Loads book_structure.json as source of truth
 * Import directly so it's bundled with serverless (Vercel)
 */

import type { BookStructure, Topic, Chapter, QuizQuestion, SessionState } from './types'
import bookStructureJson from '@/data/ict/book_structure.json'

const bookStructure = bookStructureJson as BookStructure

async function loadBookStructure(): Promise<BookStructure> {
  return bookStructure
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
  const formulaSteps =
    topic.formulaSteps?.length
      ? `\n\nএক্সেলে সূত্র তৈরির ধাপ:\n${topic.formulaSteps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}`
      : ''
  const text = `**${topic.title}**\n\nমূল ধারণা:\n• ${concepts}${examples}${formulaSteps}\n\nবুঝতে পারলেন? "পরবর্তী টপিক" এ যেতে পারেন অথবা "আরও সহজে ব্যাখ্যা" চাইতে পারেন।`
  return { text, imageUrl: topic.imageUrl }
}

/** Real-world analogies per topic (ICT book-inspired) for adaptive learning */
const TOPIC_ANALOGIES: Record<string, string> = {
  'ch1-t1': 'জ্ঞান ভিত্তিক অর্থনীতি যেমন ডিজিটাল ব্যাংক — তথ্য ও দক্ষতাই মূল সম্পদ।',
  'ch1-t2': 'চার্লস ব্যাবেজ যেমন টেলিফোনের গ্রাহাম বেল — কম্পিউটারের জনক।',
  'ch1-t3': 'ই-গভর্ন্যান্স যেমন অনলাইন ব্যাংকিং — ঝামেলাহীন, দ্রুত সেবা।',
  'ch1-t4': 'ই-পূর্জি যেমন এসএমএস ব্যাংকিং — মোবাইল দিয়ে তাৎক্ষণিক সেবা।',
  'ch2-t1': 'কম্পিউটার যেমন রেসিপে — আপনি ইনপুট দেন (উপাদান), প্রক্রিয়া হয় (রান্না), আউটপুট আসে (খাবার)।',
  'ch2-t2': 'এন্টিভাইরাস যেমন ডাক্তার — ভাইরাস শনাক্ত করে কম্পিউটার রক্ষা করে।',
  'ch2-t3': 'মৌলিক পাসওয়ার্ড যেমন তালা — জটিল তালা ভাঙা কঠিন।',
  'ch2-t4': 'বাইনারি যেমন সিঁড়ির আলো — হয় জ্বলে (১) নয় নিভে (০)। শুধু দুটো স্টেট।',
  'ch3-t1': 'ডিজিটাল কনটেন্ট যেমন ডিজিটাল গ্রন্থাগার — লিখিত, ছবি, ভিডিও সব এক জায়গায়।',
  'ch3-t2': 'ই-বুক যেমন পকেটে পুরো লাইব্রেরি — মুদ্রিত বইয়ের ইলেকট্রনিক সংস্করণ।',
  'ch3-t3': 'ইন্টারনেট যেমন বিশ্বের জানালা — যেকোনো তথ্য, যেকোনো সময়, যেকোনো জায়গা থেকে।',
  'ch4-t0': 'ওয়ার্ড প্রসেসর যেমন ডিজিটাল খাতা — লিখুন, সংশোধন করুন, সাজান; সব কিছু সহজে।',
  'ch4-t1': 'স্প্রেডশিট যেমন খাতা — সারি আর কলাম দিয়ে টেবিল; প্রতিটি ঘর একটা নির্দিষ্ট জায়গা।',
  'ch4-t2': 'সূত্র যেমন রেসিপি — ধাপে ধাপে (=, ফাংশন, এন্টার) অনুসরণ করলে ফলাফল মেলে।',
  'ch4-t3': 'SUM যেমন দোকানের বিল — সব জিনিসের দাম যোগ করলে মোট বিল। AVERAGE হলো গড় — মোটকে ভাগ করে নেওয়া।',
  'ch5-t1': 'মাল্টিমিডিয়া যেমন পিজা পার্টি — টেক্সট, ছবি, শব্দ, ভিডিও একসাথে পরিবেশন।',
  'ch5-t2': 'অ্যানিমেশন যেমন ফ্লিপ বুক — ছবি ধাপে ধাপে পালটালে চলমান মনে হয়।',
  'ch5-t3': 'প্রেজেন্টেশন যেমন ক্লাসে বোর্ডে লেকচার — স্লাইড দিয়ে তথ্য সাজিয়ে দেখানো।',
  'ch5-t4': 'ফটোশপ যেমন চিত্রকলার প্যালেট — ডিজিটাল ক্যানভাসে ছবি এডিট করা।',
  'ch6-t1': 'ডেটাবেজ যেমন সুসজ্জিত ফাইলের আলমারি — ফিল্ড, রেকর্ড দিয়ে তথ্য খুঁজে পাওয়া যায়।',
  'ch6-t2': 'MS Access যেমন ডিজিটাল রেজিস্টার — টেবিলে তথ্য সাজিয়ে রাখা ও খোঁজা।',
  'ch6-t3': 'কুয়েরি যেমন গুগল সার্চ — শর্ত দিয়ে ডেটাবেজ থেকে нужিত তথ্য বের করা।',
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

/** Video links per topic/chapter for adaptive learning (3+ consecutive wrong) */
const TOPIC_VIDEO_LINKS: Record<string, string> = {
  'ch1-t1': 'https://www.youtube.com/results?search_query=NCTB+তথ্য+ও+যোগাযোগ+প্রযুক্তি',
  'ch1-t2': 'https://www.youtube.com/results?search_query=চার্লস+ব্যাবেজ+কম্পিউটার+ইতিহাস',
  'ch1-t3': 'https://www.youtube.com/results?search_query=ই-গভর্ন্যান্স+ই-লার্নিং+বাংলা',
  'ch1-t4': 'https://www.youtube.com/results?search_query=ডিজিটাল+বাংলাদেশ+ই-সেবা',
  'ch2-t1': 'https://www.youtube.com/results?search_query=কম্পিউটার+ইনপুট+প্রক্রিয়াকরণ+আউটপুট',
  'ch2-t2': 'https://www.youtube.com/results?search_query=এন্টিভাইরাস+ভাইরাস+কম্পিউটার',
  'ch2-t3': 'https://www.youtube.com/results?search_query=পাসওয়ার্ড+নিরাপত্তা+কম্পিউটার',
  'ch2-t4': 'https://www.youtube.com/results?search_query=বাইনারি+সংখ্যা+পদ্ধতি+NCTB',
  'ch3-t1': 'https://www.youtube.com/results?search_query=ডিজিটাল+কনটেন্ট+NCTB',
  'ch3-t2': 'https://www.youtube.com/results?search_query=ই-বুক+ইলেকট্রনিক+বই+বাংলা',
  'ch3-t3': 'https://www.youtube.com/results?search_query=ইন্টারনেট+শিক্ষায়+ব্যবহার+NCTB',
  'ch4-t0': 'https://www.youtube.com/results?search_query=মাইক্রোসফট+ওয়ার্ড+টিউটোরিয়াল+বাংলা',
  'ch4-t1': 'https://www.youtube.com/results?search_query=স্প্রেডশিট+এক্সেল+টিউটোরিয়াল+বাংলা',
  'ch4-t2': 'https://www.youtube.com/results?search_query=এক্সেলে+সূত্র+তৈরি+ধাপ+বাংলা',
  'ch4-t3': 'https://www.youtube.com/results?search_query=Excel+SUM+AVERAGE+ফাংশন+বাংলা',
  'ch5-t1': 'https://www.youtube.com/results?search_query=মাল্টিমিডিয়া+ও+গ্রাফিক্স+NCTB',
  'ch5-t2': 'https://www.youtube.com/results?search_query=অ্যানিমেশন+ভিডিও+বাংলা',
  'ch5-t3': 'https://www.youtube.com/results?search_query=পাওয়ারপয়েন্ট+প্রেজেন্টেশন+বাংলা',
  'ch5-t4': 'https://www.youtube.com/results?search_query=ফটোশপ+টিউটোরিয়াল+বাংলা',
  'ch6-t1': 'https://www.youtube.com/results?search_query=ডেটাবেজ+MS+Access+বাংলা',
  'ch6-t2': 'https://www.youtube.com/results?search_query=MS+Access+টিউটোরিয়াল+বাংলা',
  'ch6-t3': 'https://www.youtube.com/results?search_query=এক্সেস+কুয়েরি+রিপোর্ট+বাংলা',
}

/**
 * Adaptive: After 3 consecutive wrong in chapter — suggest visual/video instead of continuing quiz
 */
export async function getVisualOrVideoSuggestion(
  topicId: string,
  chapterId: string
): Promise<{ text: string; imageUrl?: string; videoUrl?: string }> {
  const book = await loadBookStructure()
  const topic = getTopic(book, topicId)
  if (!topic) return { text: 'এই টপিকটি খুঁজে পাওয়া যাচ্ছে না।' }

  const ch = book.chapters.find((c) => c.id === chapterId)
  const chapterTitle = ch?.title ?? ''

  const videoUrl = topic.videoUrl ?? TOPIC_VIDEO_LINKS[topicId]
  const hasImage = !!topic.imageUrl

  const parts: string[] = [
    `**দেখে শেখা সহজ!** এই অধ্যায়ে (${chapterTitle}) তিনবার ভুল হওয়ায় আমরা কুইজের বদলে ভিজ্যুয়াল ব্যাখ্যা suggest করছি।`,
  ]

  if (hasImage) {
    parts.push('উপরে দেওয়া ছবিটি মনোযোগ দিয়ে দেখুন — এটি এই টপিক বোঝাতে সাহায্য করবে।')
  }

  if (videoUrl) {
    parts.push(
      `**ভিডিও দেখুন:** নিচের লিঙ্ক থেকে বাংলা ভিডিও টিউটোরিয়াল দেখে আবার চেষ্টা করুন:\n${videoUrl}`
    )
  } else {
    parts.push('ইউটিউবে "' + topic.title + ' NCTB" লিখে সার্চ করে বাংলা ভিডিও দেখতে পারেন।')
  }

  parts.push('\nদেখে বুঝে আবার "কুইজ দাও" চাপতে পারেন, অথবা পরবর্তী টপিকে যান।')

  return {
    text: parts.join('\n\n'),
    imageUrl: topic.imageUrl,
    videoUrl,
  }
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
 * Spreadsheet Chapter 4: check formula syntax errors and return specific feedback
 */
function getSpreadsheetFormulaFeedback(
  wrongAnswer: string,
  correctAnswer: string,
  question: string
): string {
  const w = wrongAnswer.trim()
  const issues: string[] = []

  const looksLikeFormula = /sum|average|total|mean/i.test(w)

  if (looksLikeFormula && !w.startsWith('=')) {
    issues.push('আপনার formula-তে সমান (=) চিহ্ন দেওয়া হয়নি। এক্সেলে সব সূত্র = দিয়ে শুরু করতে হয়।')
  }

  const hasColon = /[A-Z]\d+:[A-Z]\d+/i.test(w)
  const hasCommaRange = /[A-Z]\d+,\s*[A-Z]\d+/i.test(w)
  if (looksLikeFormula && hasCommaRange && !hasColon) {
    issues.push('Range ঠিকমতো দেওয়া হয়নি — কমা (,) নয়, কোলন (:) দিতে হবে। যেমন B2:B5 মানে B2 থেকে B5 পর্যন্ত সব সেল।')
  }

  if (looksLikeFormula && !hasColon && !hasCommaRange && /\([^)]+\)/.test(w)) {
    const inner = w.match(/\(([^)]+)\)/)?.[1] ?? ''
    if (/[A-Z]\d+/i.test(inner) && !inner.includes(':')) {
      issues.push('Range-এর জন্য কোলন (:) দরকার। B2:B5 লিখুন, শুধু B2 বা B2,B5 নয়।')
    }
  }

  if (issues.length > 0) {
    return (
      `**সূত্রের সিনট্যাক্স:**\n${issues.join('\n\n')}\n\n` +
      `বইয়ের page 54–55 (স্প্রেডশিট অধ্যায়) এর নিয়মটি দেখুন। সঠিক উদাহরণ: ${correctAnswer}`
    )
  }

  const isWrongFunction =
    /sum/i.test(w) && /average/i.test(correctAnswer.toLowerCase()) ||
    /average/i.test(w) && /sum/i.test(correctAnswer.toLowerCase())
  if (isWrongFunction) {
    if (/average/i.test(question) || /গড়/i.test(question)) {
      return 'আপনি SUM বেছে নিয়েছেন, কিন্তু প্রশ্নে গড় চাওয়া হয়েছে। গড়ের জন্য AVERAGE ফাংশন ব্যবহার করুন।'
    }
    if (/যোগ|যোগফল|sum/i.test(question)) {
      return 'আপনি AVERAGE বেছে নিয়েছেন, কিন্তু প্রশ্নে যোগফল চাওয়া হয়েছে। যোগের জন্য SUM ফাংশন ব্যবহার করুন।'
    }
  }

  return `আপনার দেওয়া উত্তর "${wrongAnswer}" সঠিক নয়। সঠিক সূত্র: ${correctAnswer} — বইয়ের page 54–55 দেখুন।`
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

  // Chapter 4 (Spreadsheet): formula syntax–specific feedback
  const isSpreadsheetChapter = topicId.startsWith('ch4-')
  const formulaFeedback = isSpreadsheetChapter
    ? getSpreadsheetFormulaFeedback(wrongAnswerText, correctAnswerText, q.question)
    : null

  // Wrong answer: find relevant concept from book and build corrective feedback
  const relevantConcept = topic.concepts[0] ?? `এই টপিকে ${topic.title} সম্পর্কে আলোচনা করা হয়েছে।`
  const example = topic.examples?.[0]

  const correctiveParts: string[] = [
    `**NCTB বই অনুযায়ী:** ${relevantConcept}`,
    `তাই সঠিক উত্তর হলো: **${correctAnswerText}**।`,
  ]

  if (formulaFeedback) {
    correctiveParts.push(formulaFeedback)
  } else {
    correctiveParts.push(`আপনার দেওয়া উত্তর "${wrongAnswerText}" এই ধারণার সাথে মিলে না।`)
  }

  const correctiveFeedback = correctiveParts.join('\n\n')

  let hint: string
  if (formulaFeedback && isSpreadsheetChapter) {
    hint = 'হিন্ট: বইয়ের page 54 (স্প্রেডশিট অধ্যায়) এ সূত্রের সিনট্যাক্স দেখুন — = চিহ্ন ও range-এর জন্য : (কোলন) দরকার।'
  } else if (example) {
    hint = `হিন্ট: ${example}`
  } else {
    hint = `হিন্ট: "${topic.title}" টপিকের সংজ্ঞা বা ধারণা আবার দেখুন।`
  }

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
