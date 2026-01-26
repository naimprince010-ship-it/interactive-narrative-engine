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
  {
    id: 'romantic-01',
    title: 'বৃষ্টি ভেজা বিকেল',
    description: 'একটি পুরনো ডায়েরি এবং কিছু হারিয়ে যাওয়া স্মৃতির গল্প।',
    startingChapterId: 'romantic-01-1',
    chapters: [
      {
        id: 'romantic-01-1',
        title: 'শুকনো গোলাপ',
        content:
          'আবির আলমারি গোছাতে গিয়ে হঠাৎ একটা নীল ডায়েরি খুঁজে পেল। ডায়েরির ভেতর থেকে একটা শুকনো গোলাপ ঝরে পড়ল মেঝেতে। এটা কি সেই গোলাপ যা নীলা তাকে ভার্সিটির শেষ দিনে দিয়েছিল?',
        isPremium: false,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-1-1',
            text: 'নীলাকে ফোন করা',
            nextChapterId: 'romantic-01-2',
          },
          {
            id: 'romantic-01-1-2',
            text: 'ডায়েরিটা পড়া শুরু করা',
            nextChapterId: 'romantic-01-3',
          },
        ],
      },
      {
        id: 'romantic-01-2',
        title: 'ফোনের নীরবতা',
        content:
          'আবির অনেকক্ষণ ফোনটা হাতে নিয়ে বসে থাকল। নাম্বারটা কি এখনো আগের মতোই আছে? সে কি ফোন করবে?',
        isPremium: false,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-2-1',
            text: 'হ্যাঁ, কল দাও',
            nextChapterId: 'premium_lock',
          },
          {
            id: 'romantic-01-2-2',
            text: 'না, থাক',
            nextChapterId: 'romantic-01-3',
          },
        ],
      },
      {
        id: 'romantic-01-3',
        title: 'ডায়েরির প্রথম পাতা',
        content:
          'ডায়েরির প্রথম পাতায় লেখা ছিল— "আবির, বৃষ্টি হলে কি এখনো তোমার আমার কথা মনে পড়ে?" ডায়েরি পড়তে পড়তে আবির অতীতে ফিরে গেল...',
        isPremium: false,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-3-1',
            text: 'পরের পাতা উল্টানো',
            nextChapterId: 'premium_lock',
          },
        ],
      },
      {
        id: 'premium_lock',
        title: 'প্রিমিয়াম অধ্যায়',
        content:
          '🎯 PREMIUM CHAPTER 🎯\n\nএখান থেকে গল্পের আবেগময় মোড় শুরু হবে। পরের অধ্যায়গুলো আনলক করতে পেমেন্ট প্রয়োজন।',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'premium-lock-1',
            text: 'প্রিমিয়াম অধ্যায় আনলক করা',
            nextChapterId: 'romantic-01-4',
          },
        ],
      },
      {
        id: 'romantic-01-4',
        title: 'বৃষ্টির দিনে প্রথম দেখা',
        content:
          'ডায়েরির পাতায় আবিরের চোখ আটকে গেল এক বিকেলের তারিখে। বৃষ্টি থামেনি, তবু নীলা ছাতা ছাড়া এসে দাঁড়িয়েছিল লাইব্রেরির বারান্দায়। সে বলেছিল, "বৃষ্টি হলে শহরটা নরম হয়ে যায়, মানুষও কি নরম হয়?" আবিরের উত্তর আজও তার বুকের ভেতর গুঞ্জন তোলে।',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-4-1',
            text: 'সেই দিনের কথা আরও পড়া',
            nextChapterId: 'romantic-01-5',
          },
          {
            id: 'romantic-01-4-2',
            text: 'ডায়েরি বন্ধ করে জানালার দিকে তাকানো',
            nextChapterId: 'romantic-01-6',
          },
        ],
      },
      {
        id: 'romantic-01-5',
        title: 'নীলার চিঠি',
        content:
          'ডায়েরির মাঝখানে নীলার ছোট্ট একটা চিঠি গুঁজে রাখা ছিল। "যদি আমি না থাকি, তুমি কি আমার মতো বৃষ্টি ভালোবাসবে?" প্রশ্নটা আবিরকে কাঁপিয়ে দেয়। সে তখনও জানত না, এই চিঠিই তাকে একদিন সিদ্ধান্তের মুখোমুখি দাঁড় করাবে।',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-5-1',
            text: 'চিঠির শেষে লেখা নাম্বারটা দেখা',
            nextChapterId: 'romantic-01-7',
          },
          {
            id: 'romantic-01-5-2',
            text: 'চিঠিটা বুকের কাছে চেপে ধরা',
            nextChapterId: 'romantic-01-8',
          },
        ],
      },
      {
        id: 'romantic-01-6',
        title: 'জানালার ধারে',
        content:
          'জানালার কাঁচে বৃষ্টির ফোঁটা গড়িয়ে পড়ছে। আবিরের মনে হয়, নীলার চোখের জল যেন ঠিক এমনই ছিল—নীরব, কিন্তু তীব্র। সে মনে করতে থাকে শেষ দিনটির কথা, যখন প্ল্যাটফর্মে দাঁড়িয়ে নীলা হেসে বলেছিল, "এই বৃষ্টি কি আমাদের শেষ কথা হবে?"',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-6-1',
            text: 'শেষ দিনের স্মৃতি খুলে দেখা',
            nextChapterId: 'romantic-01-8',
          },
          {
            id: 'romantic-01-6-2',
            text: 'ফোনটা হাতে নেওয়া',
            nextChapterId: 'romantic-01-7',
          },
        ],
      },
      {
        id: 'romantic-01-7',
        title: 'কলের আগে',
        content:
          'আবির নাম্বার ডায়াল করেও কল দেয় না। মনে হয়, একটুখানি সাহসই তাকে অতীতের দরজায় পৌঁছে দিতে পারে। নীলা কি এখনো অপেক্ষায় আছে? নাকি সব কিছুই বদলে গেছে?',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-7-1',
            text: 'কল দেওয়া',
            nextChapterId: 'romantic-01-9',
          },
          {
            id: 'romantic-01-7-2',
            text: 'কল না দিয়ে ডায়েরি পড়া',
            nextChapterId: 'romantic-01-10',
          },
        ],
      },
      {
        id: 'romantic-01-8',
        title: 'শেষ ট্রেনের স্টেশন',
        content:
          'ডায়েরির পাতায় লেখা, শেষ ট্রেন চলে গেলে নীলা আর ফিরবে না। আবির সেই দিন ঠিক সময়েই স্টেশনে পৌঁছেছিল, কিন্তু ভয় পেয়েছিল। ভয় যে নীলা তাকে ভুলে গেছে। সেই ভয়ই কি আজকের একাকীত্ব?',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-8-1',
            text: 'ভুল স্বীকার করে এগোনো',
            nextChapterId: 'romantic-01-9',
          },
          {
            id: 'romantic-01-8-2',
            text: 'নিজেকে দোষ দিয়ে থেমে থাকা',
            nextChapterId: 'romantic-01-11',
          },
        ],
      },
      {
        id: 'romantic-01-9',
        title: 'অন্য প্রান্তের নীরবতা',
        content:
          'কল চলে গেল। দু’বার রিং হওয়ার পর ওপাশে একটা নীরব শ্বাস শোনা গেল। তারপর নীলা বলল, "আবির?" এক শব্দে কত বছর জমে থাকা কষ্ট গলে গেল। আবিরের কণ্ঠ কেঁপে উঠল—"আমি ফিরে এসেছি।"',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-9-1',
            text: 'নীলাকে দেখা করতে বলা',
            nextChapterId: 'romantic-01-12',
          },
          {
            id: 'romantic-01-9-2',
            text: 'শুধু ক্ষমা চাওয়া',
            nextChapterId: 'romantic-01-13',
          },
        ],
      },
      {
        id: 'romantic-01-10',
        title: 'ফাঁকা পাতার রহস্য',
        content:
          'কিছু পাতার পর ডায়েরি হঠাৎ ফাঁকা। শেষ পাতায় একটুকু লেখা—"যদি তুমি না আসো, আমি নিজেকেই হারিয়ে ফেলব।" আবির বুঝতে পারে, নীলার জীবনে বড় কিছু ঘটেছিল। সে কি ভুল করে খুব দেরি করে ফেলল?',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-10-1',
            text: 'খোঁজ নেওয়া শুরু করা',
            nextChapterId: 'romantic-01-14',
          },
          {
            id: 'romantic-01-10-2',
            text: 'নিজেকে গুটিয়ে ফেলা',
            nextChapterId: 'romantic-01-11',
          },
        ],
      },
      {
        id: 'romantic-01-11',
        title: 'একলা বারান্দা',
        content:
          'আবির বারান্দায় বসে বৃষ্টি দেখে। নীলার স্মৃতি যেন বৃষ্টির মতোই—ধীরে, কিন্তু সারাক্ষণ। সে বুঝতে পারে, দুঃখকে আঁকড়ে ধরে থাকলে কোনোদিন ফিরতে পারবে না। এই পথটা তাকে একাকীত্বের দিকে ঠেলে দেয়।',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-11-1',
            text: 'গল্প এখানেই থামানো (ট্রাজিক শেষ)',
            nextChapterId: 'romantic-01-15',
          },
        ],
      },
      {
        id: 'romantic-01-12',
        title: 'ক্যাফের টেবিল',
        content:
          'ক্যাফেতে নীলার সামনে বসে আবিরের হাত কেঁপে ওঠে। নীলা বলে, "আমি ভেবেছিলাম তুমি আর আসবে না।" আবির চুপ করে শুধু বলে, "এবার আর যাব না।" বৃষ্টির বাইরে, ভেতরে নতুন আলো।',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-12-1',
            text: 'নীলাকে আবার শুরু করার প্রস্তাব',
            nextChapterId: 'romantic-01-16',
          },
          {
            id: 'romantic-01-12-2',
            text: 'শুধু বন্ধুত্বের কথা বলা',
            nextChapterId: 'romantic-01-13',
          },
        ],
      },
      {
        id: 'romantic-01-13',
        title: 'অপূর্ণ কথোপকথন',
        content:
          'নীলা কাঁদতে কাঁদতে বলে, "ভালোবাসা কি শুধু অপেক্ষা?" আবির বুঝতে পারে, শুধু ক্ষমা চাইলে সব ঠিক হয় না। তবু কথাগুলো অসম্পূর্ণ থেকে যায়, ঠিক যেমন বৃষ্টির পরে কাদামাটি শুকায় না।',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-13-1',
            text: 'শেষবার দেখা করার অনুরোধ',
            nextChapterId: 'romantic-01-14',
          },
          {
            id: 'romantic-01-13-2',
            text: 'চুপ করে ফিরে আসা',
            nextChapterId: 'romantic-01-15',
          },
        ],
      },
      {
        id: 'romantic-01-14',
        title: 'হারিয়ে যাওয়া ঠিকানা',
        content:
          'আবির নীলার পুরনো ঠিকানায় যায়। বাসাটা বন্ধ, দরজায় নতুন নাম। পাশের বাসার কেউ বলে, নীলা শহর ছেড়ে গেছে অনেক আগে। আবিরের মনে হয়, কিছু গল্প সত্যিই সময়ের কাছে হেরে যায়।',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [
          {
            id: 'romantic-01-14-1',
            text: 'গল্প শেষ করা (ট্রাজিক শেষ)',
            nextChapterId: 'romantic-01-15',
          },
          {
            id: 'romantic-01-14-2',
            text: 'শেষ আশায় আবার ফোন করা',
            nextChapterId: 'romantic-01-9',
          },
        ],
      },
      {
        id: 'romantic-01-15',
        title: 'বৃষ্টির পরে',
        content:
          'বৃষ্টি থেমে যায়, কিন্তু আবিরের ভেতরের শূন্যতা থামে না। নীলার স্মৃতি তাকে তাড়া করে, তবে সে জানে—কিছু মানুষ শুধু স্মৃতিতেই থেকে যায়। এইখানেই গল্প শেষ, এক বিষণ্ণ সত্য নিয়ে।',
        isPremium: true,
        storyId: 'romantic-01',
        choices: [],
      },
      {
        id: 'romantic-01-16',
        title: 'নতুন বিকেল',
        content:
          'নীলা ধীরে মাথা নেড়ে বলে, "চলো, আবার শুরু করি।" আবির বুঝতে পারে, দ্বিতীয় সুযোগের সৌন্দর্যই আলাদা। বৃষ্টির গন্ধের মাঝে তারা দুজন পাশাপাশি হাঁটে—স্মৃতি নয়, এবার ভবিষ্যৎ হাতে হাতে।',
        isPremium: true,
        storyId: 'romantic-01',
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
