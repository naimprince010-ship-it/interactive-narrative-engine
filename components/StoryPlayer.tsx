"use client";

import { useState, useEffect } from "react";
import { Story, Chapter } from "@/types/story";
import {
  loadStory,
  getChapter,
  getUnlockedChapters,
  saveUnlockedChapter,
  isChapterUnlocked,
} from "@/lib/storyLoader";
import PaymentWall from "./PaymentWall";

export default function StoryPlayer() {
  const [story, setStory] = useState<Story | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [unlockedChapters, setUnlockedChapters] = useState<string[]>([]);
  const [showPaymentWall, setShowPaymentWall] = useState(false);
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load the story on component mount
    const loadedStory = loadStory("story-1");
    setStory(loadedStory);

    // Load unlocked chapters from localStorage
    const unlocked = getUnlockedChapters();
    setUnlockedChapters(unlocked);

    // Start from the beginning
    const startChapter = getChapter(loadedStory, loadedStory.startChapterId);
    setCurrentChapter(startChapter);
    setHistory([loadedStory.startChapterId]);
  }, []);

  const handleChoiceClick = (nextChapterId: string) => {
    if (!story) return;

    const nextChapter = getChapter(story, nextChapterId);
    if (!nextChapter) return;

    // Check if chapter is premium and not unlocked
    if (
      nextChapter.isPremium &&
      !isChapterUnlocked(nextChapterId, unlockedChapters)
    ) {
      setPendingChapterId(nextChapterId);
      setShowPaymentWall(true);
      return;
    }

    // Navigate to the chapter
    navigateToChapter(nextChapterId);
  };

  const navigateToChapter = (chapterId: string) => {
    if (!story) return;

    const chapter = getChapter(story, chapterId);
    if (chapter) {
      setCurrentChapter(chapter);
      setHistory([...history, chapterId]);
      window.scrollTo(0, 0);
    }
  };

  const handlePaymentSuccess = () => {
    if (pendingChapterId) {
      saveUnlockedChapter(pendingChapterId);
      setUnlockedChapters([...unlockedChapters, pendingChapterId]);
      setShowPaymentWall(false);
      navigateToChapter(pendingChapterId);
      setPendingChapterId(null);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentWall(false);
    setPendingChapterId(null);
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current
      const previousChapterId = newHistory[newHistory.length - 1];
      setHistory(newHistory);

      if (story) {
        const chapter = getChapter(story, previousChapterId);
        setCurrentChapter(chapter);
        window.scrollTo(0, 0);
      }
    }
  };

  const handleRestart = () => {
    if (story) {
      const startChapter = getChapter(story, story.startChapterId);
      setCurrentChapter(startChapter);
      setHistory([story.startChapterId]);
      window.scrollTo(0, 0);
    }
  };

  if (!story || !currentChapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading story...</div>
      </div>
    );
  }

  const isEndChapter = currentChapter.choices.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {story.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {story.description}
          </p>
        </div>
      </header>

      {/* Story Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Chapter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentChapter.title}
            </h2>
            {currentChapter.isPremium && (
              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold px-2 py-1 rounded">
                PREMIUM
              </span>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {currentChapter.content}
            </p>
          </div>
        </div>

        {/* Choices */}
        {!isEndChapter && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              What do you do?
            </h3>
            {currentChapter.choices.map((choice) => {
              const nextChapter = getChapter(story, choice.nextChapterId);
              const isLocked =
                nextChapter?.isPremium &&
                !isChapterUnlocked(choice.nextChapterId, unlockedChapters);

              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceClick(choice.nextChapterId)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition duration-200 ${
                    isLocked
                      ? "border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                      : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {choice.text}
                    </span>
                    {isLocked && (
                      <svg
                        className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* End Chapter Actions */}
        {isEndChapter && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-6 text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              The End
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Thank you for playing! Would you like to start over and explore a
              different path?
            </p>
            <button
              onClick={handleRestart}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              Start New Adventure
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {history.length > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              ← Go Back
            </button>
          )}
          <button
            onClick={handleRestart}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            ↺ Restart
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Interactive Narrative Engine • {story.author}</p>
      </footer>

      {/* Payment Wall Modal */}
      {showPaymentWall && pendingChapterId && (
        <PaymentWall
          paymentInfo={{
            amount: 10,
            currency: "BDT",
            chapterId: pendingChapterId,
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
}
