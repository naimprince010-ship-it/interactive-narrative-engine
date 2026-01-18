# Interactive Narrative Engine

A choice-based interactive story platform built with Next.js and Tailwind CSS, featuring a micro-payment system (10 BDT) to unlock premium story chapters.

## Features

- 📚 **Multiple Interactive Stories**: Choose your own adventure stories with branching narratives
- 💳 **Micro-Payment System**: Unlock premium chapters for 10 BDT using mobile payment methods (bKash, Nagad, Rocket)
- 🎯 **Progress Tracking**: Your reading progress is saved locally
- 🎨 **Beautiful UI**: Modern, responsive design with gradient backgrounds and smooth animations
- ⚡ **Fast & Modern**: Built with Next.js 14 (App Router) and TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/naimprince010-ship-it/interactive-narrative-engine.git
cd interactive-narrative-engine
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
interactive-narrative-engine/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── story/             # Story pages
│   │   └── [storyId]/     # Dynamic story routes
│   └── globals.css        # Global styles
├── components/            # React components
│   └── PaymentModal.tsx   # Payment modal component
├── data/                  # Story data
│   └── stories.ts         # Story definitions
├── types/                 # TypeScript types
│   └── story.ts           # Story type definitions
└── public/                # Static assets
```

## How It Works

1. **Browse Stories**: Start from the home page to see available stories
2. **Read Free Chapters**: Begin reading any story - initial chapters are free
3. **Make Choices**: At the end of each chapter, choose your path
4. **Unlock Premium**: Premium chapters require payment (10 BDT)
5. **Payment Flow**: 
   - Select a mobile payment method (bKash/Nagad/Rocket)
   - Enter your phone number and transaction ID
   - Confirm payment to unlock the chapter
6. **Progress Saved**: Your reading progress is automatically saved in localStorage

## Payment Integration

The current implementation includes a demo payment modal. For production use, integrate with actual payment gateways:

- **bKash API**: https://developer.bka.sh/
- **Nagad API**: Contact Nagad for merchant API access
- **Rocket API**: Contact Dutch-Bangla Bank for merchant API access

## Adding New Stories

Edit `data/stories.ts` to add new stories:

```typescript
{
  id: 'story-id',
  title: 'Story Title',
  description: 'Story description',
  startingChapterId: 'chapter-1-id',
  chapters: [
    {
      id: 'chapter-1-id',
      title: 'Chapter Title',
      content: 'Chapter content...',
      isPremium: false,
      storyId: 'story-id',
      choices: [
        {
          id: 'choice-1-id',
          text: 'Choice text',
          nextChapterId: 'chapter-2-id'
        }
      ]
    }
  ]
}
```

## Building for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + localStorage

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
