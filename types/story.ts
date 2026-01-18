export interface Choice {
  id: string
  text: string
  nextChapterId: string
}

export interface Chapter {
  id: string
  title: string
  content: string
  choices: Choice[]
  isPremium: boolean
  storyId: string
}

export interface Story {
  id: string
  title: string
  description: string
  coverImage?: string
  startingChapterId: string
  chapters: Chapter[]
}

export interface UserProgress {
  storyId: string
  unlockedChapters: string[]
  currentChapterId: string
}
