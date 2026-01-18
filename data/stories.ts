import { Story } from '@/types/story'

export const stories: Story[] = [
  {
    id: '1',
    title: 'The Enchanted Forest',
    description: 'A magical journey through an ancient forest where every choice matters.',
    startingChapterId: '1-1',
    chapters: [
      {
        id: '1-1',
        title: 'The Beginning',
        content: 'You stand at the edge of an ancient forest. The trees tower high above, their leaves shimmering with an otherworldly glow. A narrow path winds into the darkness ahead. You feel a strange pull, as if the forest itself is calling you forward.',
        isPremium: false,
        storyId: '1',
        choices: [
          {
            id: '1-1-1',
            text: 'Follow the path into the forest',
            nextChapterId: '1-2',
          },
          {
            id: '1-1-2',
            text: 'Turn back and walk away',
            nextChapterId: '1-end-early',
          },
        ],
      },
      {
        id: '1-2',
        title: 'Into the Woods',
        content: 'As you venture deeper, the forest seems to come alive around you. Soft whispers float through the air, and the path ahead splits into three directions. To the left, you see a golden light. To the right, shadows dance mysteriously. Straight ahead, the path looks most traveled.',
        isPremium: false,
        storyId: '1',
        choices: [
          {
            id: '1-2-1',
            text: 'Go left toward the golden light',
            nextChapterId: '1-3',
          },
          {
            id: '1-2-2',
            text: 'Go right into the shadows',
            nextChapterId: '1-4',
          },
          {
            id: '1-2-3',
            text: 'Continue straight ahead',
            nextChapterId: '1-5',
          },
        ],
      },
      {
        id: '1-3',
        title: 'The Golden Glade',
        content: 'You emerge into a breathtaking glade filled with golden flowers that sway without wind. In the center stands an ancient tree with silver bark. Its branches reach toward the sky, and you sense great power here. A small creature with glowing eyes watches you from the base of the tree.',
        isPremium: false,
        storyId: '1',
        choices: [
          {
            id: '1-3-1',
            text: 'Approach the tree',
            nextChapterId: '1-premium-1',
          },
          {
            id: '1-3-2',
            text: 'Talk to the creature',
            nextChapterId: '1-premium-1',
          },
        ],
      },
      {
        id: '1-4',
        title: 'Shadows and Secrets',
        content: 'The shadows deepen as you walk. Strange shapes move at the edge of your vision. You hear a soft voice calling your name. Do you answer?',
        isPremium: false,
        storyId: '1',
        choices: [
          {
            id: '1-4-1',
            text: 'Answer the voice',
            nextChapterId: '1-premium-2',
          },
          {
            id: '1-4-2',
            text: 'Keep walking silently',
            nextChapterId: '1-premium-2',
          },
        ],
      },
      {
        id: '1-5',
        title: 'The Main Path',
        content: 'You continue along the well-worn path. The forest opens up, revealing a small village in the distance. Smoke rises from chimneys, and you can hear laughter. This seems safe, but you wonder what adventures you might be missing elsewhere.',
        isPremium: false,
        storyId: '1',
        choices: [
          {
            id: '1-5-1',
            text: 'Go to the village',
            nextChapterId: '1-premium-3',
          },
          {
            id: '1-5-2',
            text: 'Explore the forest more',
            nextChapterId: '1-premium-1',
          },
        ],
      },
      {
        id: '1-premium-1',
        title: 'The Guardian\'s Trial',
        content: '🎯 PREMIUM CHAPTER 🎯\n\nThe creature reveals itself as a forest guardian. "You seek the Heart of the Forest," it says in a voice like rustling leaves. "But first, you must prove your worth." Three trials await you, each more challenging than the last. Your choices here will determine your fate and the fate of the forest itself...',
        isPremium: true,
        storyId: '1',
        choices: [
          {
            id: '1-premium-1-1',
            text: 'Accept the first trial',
            nextChapterId: '1-premium-4',
          },
        ],
      },
      {
        id: '1-premium-2',
        title: 'The Shadow Realm',
        content: '🎯 PREMIUM CHAPTER 🎯\n\nThe voice belongs to a being of pure shadow. It offers you knowledge beyond mortal comprehension, but at a price. Do you trust this entity? The path you choose will lead you to secrets that could change everything...',
        isPremium: true,
        storyId: '1',
        choices: [
          {
            id: '1-premium-2-1',
            text: 'Accept the shadow\'s offer',
            nextChapterId: '1-premium-5',
          },
        ],
      },
      {
        id: '1-premium-3',
        title: 'The Hidden Village',
        content: '🎯 PREMIUM CHAPTER 🎯\n\nThe village welcomes you warmly, but something feels off. The villagers smile too widely, and their laughter has a hollow ring. You discover that this village exists between worlds, and your arrival has been foretold. A great choice awaits...',
        isPremium: true,
        storyId: '1',
        choices: [
          {
            id: '1-premium-3-1',
            text: 'Investigate the mystery',
            nextChapterId: '1-premium-6',
          },
        ],
      },
      {
        id: '1-end-early',
        title: 'The End',
        content: 'You turn away from the forest, choosing the safety of the known world. The forest whispers your name one last time, but you continue walking. Some adventures are not meant to be...',
        isPremium: false,
        storyId: '1',
        choices: [],
      },
      {
        id: '1-premium-4',
        title: 'Trial of Courage',
        content: '🎯 PREMIUM CHAPTER 🎯\n\nThe first trial tests your courage. You must face your deepest fear. What appears before you? How will you overcome it?',
        isPremium: true,
        storyId: '1',
        choices: [],
      },
      {
        id: '1-premium-5',
        title: 'Shadow Knowledge',
        content: '🎯 PREMIUM CHAPTER 🎯\n\nYou accept the shadow\'s knowledge, feeling ancient secrets flood your mind. The price becomes clear - you can never leave this realm the same...',
        isPremium: true,
        storyId: '1',
        choices: [],
      },
      {
        id: '1-premium-6',
        title: 'Between Worlds',
        content: '🎯 PREMIUM CHAPTER 🎯\n\nYour investigation reveals the truth: this village exists in a pocket dimension, and you are the key to either saving it or destroying it...',
        isPremium: true,
        storyId: '1',
        choices: [],
      },
    ],
  },
  {
    id: '2',
    title: 'Space Odyssey',
    description: 'Navigate the cosmos in this epic space adventure where your decisions determine humanity\'s future.',
    startingChapterId: '2-1',
    chapters: [
      {
        id: '2-1',
        title: 'Launch Sequence',
        content: 'You sit in the cockpit of the starship Aurora, hands hovering over the controls. The mission: explore an uncharted sector of the galaxy. Below, Earth shrinks in the viewport. This is it - humanity\'s greatest adventure begins now.',
        isPremium: false,
        storyId: '2',
        choices: [
          {
            id: '2-1-1',
            text: 'Activate warp drive',
            nextChapterId: '2-2',
          },
          {
            id: '2-1-2',
            text: 'Run final system checks',
            nextChapterId: '2-2',
          },
        ],
      },
      {
        id: '2-2',
        title: 'First Contact',
        content: 'An anomaly appears on your scanners - something massive, moving fast. Your AI companion, ALEX, calculates it\'s an alien vessel. It\'s not responding to hails. What do you do?',
        isPremium: false,
        storyId: '2',
        choices: [
          {
            id: '2-2-1',
            text: 'Attempt peaceful communication',
            nextChapterId: '2-premium-1',
          },
          {
            id: '2-2-2',
            text: 'Prepare defensive systems',
            nextChapterId: '2-premium-2',
          },
        ],
      },
      {
        id: '2-premium-1',
        title: 'The Message',
        content: '🎯 PREMIUM CHAPTER 🎯\n\nYour communication efforts succeed. The alien vessel reveals a message that changes everything humanity thought it knew about the universe. A choice looms that will affect all of space...',
        isPremium: true,
        storyId: '2',
        choices: [],
      },
      {
        id: '2-premium-2',
        title: 'Battle Stations',
        content: '🎯 PREMIUM CHAPTER 🎯\n\nYour defensive stance triggers something unexpected. The aliens weren\'t hostile - they were protecting something. Now, your actions have consequences across the galaxy...',
        isPremium: true,
        storyId: '2',
        choices: [],
      },
    ],
  },
]

export function getStoryById(id: string): Story | undefined {
  return stories.find(story => story.id === id)
}

export function getChapterByStoryAndId(storyId: string, chapterId: string) {
  const story = getStoryById(storyId)
  return story?.chapters.find(ch => ch.id === chapterId)
}
