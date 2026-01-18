export interface Choice {
  id: string;
  text: string;
  nextChapterId: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  choices: Choice[];
  isPremium: boolean;
  imageUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  author: string;
  startChapterId: string;
  chapters: Chapter[];
}

export interface PaymentInfo {
  amount: number;
  currency: string;
  chapterId: string;
}
