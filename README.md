# Interactive Narrative Engine

A choice-based interactive story platform built with Next.js and Tailwind CSS, featuring a micro-payment system (10 BDT) to unlock premium story chapters.

## Features

- 📖 **Interactive Storytelling**: Choice-based narrative with branching paths
- 💰 **Micro-Payment System**: 10 BDT payment wall for premium chapters
- 📱 **Mobile-First Design**: Fully responsive, optimized for mobile devices
- 🌙 **Dark Mode**: Automatic dark mode support
- 💾 **Progress Persistence**: LocalStorage saves unlocked chapters
- 🔄 **Navigation**: Back button and restart functionality
- 🎨 **Modern UI**: Clean design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/naimprince010-ship-it/interactive-narrative-engine.git
cd interactive-narrative-engine
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── StoryPlayer.tsx    # Main story player component
│   └── PaymentWall.tsx    # Payment modal component
├── data/                  # Story data files
│   └── sample-story.json  # Sample interactive story
├── lib/                   # Utility functions
│   └── storyLoader.ts     # Story loading and management
├── types/                 # TypeScript type definitions
│   └── story.ts           # Story data types
└── public/                # Static assets

```

## Story Format

Stories are defined in JSON format with the following structure:

```json
{
  "id": "story-1",
  "title": "Story Title",
  "description": "Story description",
  "author": "Author Name",
  "startChapterId": "chapter-1",
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Chapter Title",
      "content": "Chapter content...",
      "isPremium": false,
      "choices": [
        {
          "id": "choice-1",
          "text": "Choice text",
          "nextChapterId": "chapter-2"
        }
      ]
    }
  ]
}
```

## Adding New Stories

1. Create a new JSON file in the `data/` directory
2. Follow the story format above
3. Update `lib/storyLoader.ts` to load your story

## Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React** - UI library

## License

This project is licensed under the ISC License - see the LICENSE file for details.

