import { Story, Chapter } from "@/types/story";
import sampleStory from "@/data/sample-story.json";

/**
 * Loads a story from JSON data
 * In a real application, this could fetch from an API or database
 */
export function loadStory(storyId: string): Story {
  // For now, we'll return the sample story
  // In the future, this could be extended to load different stories
  return sampleStory as Story;
}

/**
 * Gets a specific chapter from a story
 */
export function getChapter(story: Story, chapterId: string): Chapter | null {
  const chapter = story.chapters.find((ch) => ch.id === chapterId);
  return chapter || null;
}

/**
 * Checks if a chapter is unlocked (not premium or already paid)
 */
export function isChapterUnlocked(
  chapterId: string,
  unlockedChapters: string[]
): boolean {
  return unlockedChapters.includes(chapterId);
}

/**
 * Gets the list of unlocked chapter IDs from localStorage
 */
export function getUnlockedChapters(): string[] {
  if (typeof window === "undefined") return ["chapter-1"];
  
  const stored = localStorage.getItem("unlockedChapters");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      // If stored data is corrupted, reset to default
      console.error("Failed to parse unlocked chapters:", error);
      return ["chapter-1"];
    }
  }
  // Always start with chapter-1 unlocked
  return ["chapter-1"];
}

/**
 * Saves unlocked chapter IDs to localStorage
 */
export function saveUnlockedChapter(chapterId: string): void {
  if (typeof window === "undefined") return;
  
  const unlocked = getUnlockedChapters();
  if (!unlocked.includes(chapterId)) {
    unlocked.push(chapterId);
    localStorage.setItem("unlockedChapters", JSON.stringify(unlocked));
  }
}
