/**
 * ICT Narrative Engine — Types for book structure and narrative state
 */

export type QuizQuestion = {
  question: string
  options: string[]
  correct: number
}

export type Topic = {
  id: string
  title: string
  concepts: string[]
  examples?: string[]
  quizQuestions?: QuizQuestion[]
  /** Image URL for multi-modal learning (e.g. Network Topology, Charles Babbage) */
  imageUrl?: string
}

export type Chapter = {
  id: string
  title: string
  topics: Topic[]
}

export type BookStructure = {
  title: string
  chapters: Chapter[]
}

export type SessionState = {
  phase: 'intro' | 'chapter_select' | 'topic_learn' | 'quiz' | 'next_topic' | 'retry'
  chapterId?: string
  topicId?: string
  lastQuizResult?: boolean
  completedTopics?: string[]
  /** Quiz fail count for current topic — triggers adaptive path after 2 fails */
  quizFailCount?: number
  /** Topic IDs user struggled with — used for weak-point suggestions */
  weakTopics?: string[]
}

export type OptionButton = {
  label: string
  action: string
}
