import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import {
  getBookStructure,
  getIntroduction,
  getChapterList,
  getTopicList,
  getTopicContent,
  getSimplerExplanation,
  getSimplerExplanationWithAnalogy,
  getQuizForTopic,
  evaluateAnswer,
  getContextForAI,
  getSuggestedWeakTopics,
} from '@/lib/ict/narrativeController'
import type { SessionState, OptionButton } from '@/lib/ict/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

const ICT_TUTOR_SYSTEM = `তুমি একজন অভিজ্ঞ ICT টিউটর। বাংলাদেশের NCTB নবম-দশম শ্রেণির তথ্য ও যোগাযোগ প্রযুক্তি বইয়ের ভিত্তিতে শেখাবে।

**Scope (অবশ্যই মেনে চলো):**
- শুধুমাত্র book_structure.json ও NCTB ICT কারিকুলামের মধ্যে থাকো
- চলচ্চিত্র, গেম, রাজনীতি, ধর্ম, বা বইয়ের বাইরের কোনো বিষয় নিয়ে আলোচনা করো না
- যদি ব্যবহারকারী off-topic জিজ্ঞেস করে, সাদরে বলো: "এটি ICT বইয়ের বাইরের বিষয়। চলে আমরা আবার তথ্য ও যোগাযোগ প্রযুক্তি শিখি — কোন অধ্যায় নিয়ে আলোচনা করবেন?"
- বইয়ে নেই এমন কিছু আবিষ্কার বা অনুমান কোরো না

**NCTB শব্দ ব্যবহার:**
- তথ্য, যোগাযোগ প্রযুক্তি, কম্পিউটার, ইনপুট, প্রক্রিয়াকরণ, আউটপুট, বাইনারি, স্প্রেডশিট, অ্যালগোরিদম, ইমেইল, ওয়ার্ল্ড ওয়াইড ওয়েব — কারিকুলাম অনুযায়ী সঠিক বাংলা ব্যবহার করো

**Tone:**
- সহানুভূতিশীল ও উৎসাহদায়ক; বইয়ের উদাহরণ দিয়ে সরল করো
- বাংলায় উত্তর দাও; সংক্ষিপ্ত ও স্পষ্ট রাখো
- নিশ্চিত না হলে বলো: "আমি এই টপিকটা বইতে আরও দেখে নিচ্ছি।"`

function buildOptions(
  state: SessionState,
  bookContext: string,
  chapters?: Array<{ id: string; title: string }>,
  weakTopicOptions?: Array<{ id: string; title: string; chapterTitle: string }>
): OptionButton[] {
  if (state.phase === 'intro' || state.phase === 'chapter_select') {
    const list =
      chapters ||
      [
        { id: 'ch1', title: 'তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি' },
        { id: 'ch2', title: 'কম্পিউটার ও এর ব্যবহার' },
        { id: 'ch3', title: 'সংখ্যা পদ্ধতি' },
        { id: 'ch4', title: 'স্প্রেডশিট' },
        { id: 'ch5', title: 'ইন্টারনেট ও ইমেইল' },
        { id: 'ch6', title: 'প্রোগ্রামিং পরিচিতি' },
      ]
    const opts = list.map((ch) => ({ label: ch.title, action: `select_chapter:${ch.id}` }))
    if (weakTopicOptions && weakTopicOptions.length > 0) {
      opts.unshift({
        label: '📚 দুর্বল টপিকগুলো রিভাইজ করুন',
        action: 'revise_weak_topics',
      })
    }
    return opts
  }
  if (state.phase === 'topic_learn' && state.topicId) {
    return [
      { label: 'পরবর্তী টপিক', action: 'next_topic' },
      { label: 'আরও সহজে ব্যাখ্যা', action: 'simpler_explanation' },
      { label: 'কুইজ দাও', action: 'start_quiz' },
    ]
  }
  if (state.phase === 'quiz' && state.topicId) {
    return [{ label: 'পরবর্তী টপিক', action: 'next_topic' }]
  }
  return []
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const message = (body.message as string) || ''
    const sessionState = (body.sessionState as Partial<SessionState>) || {}
    const isFirstMessage = !message || message.trim() === ''

    const book = await getBookStructure()

    if (isFirstMessage) {
      const intro = await getIntroduction()
      const chapters = getChapterList(book)
      const weakTopics = (sessionState.weakTopics ?? []) as string[]
      const weakTopicOptions = weakTopics.length > 0 ? getSuggestedWeakTopics(book, weakTopics) : []
      const options = buildOptions({ phase: 'chapter_select' }, '', chapters, weakTopicOptions)
      return NextResponse.json({
        reply: intro,
        options,
        nextState: { phase: 'chapter_select', weakTopics },
      })
    }

    const msg = message.trim().toLowerCase()

    if (msg === 'revise_weak_topics') {
      const weakTopics = (sessionState.weakTopics ?? []) as string[]
      const weakList = getSuggestedWeakTopics(book, weakTopics)
      if (weakList.length === 0) {
        return NextResponse.json({
          reply: 'আপনার এখন পর্যন্ত কোনো দুর্বল টপিক রেকর্ড নেই। অধ্যায় বেছে নিন।',
          options: buildOptions({ phase: 'chapter_select' }, '', getChapterList(book)),
          nextState: { phase: 'chapter_select' },
        })
      }
      const opts = weakList.map((w) => ({
        label: `${w.title} (${w.chapterTitle})`,
        action: `select_weak_topic:${w.id}`,
      }))
      return NextResponse.json({
        reply: `নিচের টপিকগুলো আপনার দুর্বল জায়গা। যে টপিক রিভাইজ করতে চান সেটি বেছে নিন:\n\n${weakList.map((w) => `• ${w.title}`).join('\n')}`,
        options: opts,
        nextState: { phase: 'chapter_select', weakTopics },
      })
    }

    const weakTopicMatch = msg.match(/select_weak_topic:([\w-]+)/)
    if (weakTopicMatch) {
      const topicId = weakTopicMatch[1]
      const content = await getTopicContent(topicId)
      const ch = book.chapters.find((c) => c.topics.some((t) => t.id === topicId))
      return NextResponse.json({
        reply: content.text,
        imageUrl: content.imageUrl,
        options: buildOptions({ phase: 'topic_learn', topicId, chapterId: ch?.id }, ''),
        nextState: { phase: 'topic_learn', topicId, chapterId: ch?.id, weakTopics: sessionState.weakTopics },
      })
    }

    const chapterMatch = msg.match(/select_chapter:(ch\d+)/)
    if (chapterMatch) {
      const chapterId = chapterMatch[1]
      const cid = chapterId || sessionState.chapterId || 'ch1'
      const topics = getTopicList(book, cid)
      const firstTopic = topics[0]
      if (!firstTopic) {
        const weakTopicOptions = getSuggestedWeakTopics(book, sessionState.weakTopics ?? [])
        return NextResponse.json({
          reply: 'এই অধ্যায়ে কোনো টপিক পাওয়া যায়নি।',
          options: buildOptions({ phase: 'chapter_select' }, '', getChapterList(book), weakTopicOptions),
          nextState: { phase: 'chapter_select', weakTopics: sessionState.weakTopics },
        })
      }
      const content = await getTopicContent(firstTopic.id)
      return NextResponse.json({
        reply: content.text,
        imageUrl: content.imageUrl,
        options: buildOptions({ phase: 'topic_learn', chapterId: cid, topicId: firstTopic.id }, ''),
        nextState: { phase: 'topic_learn', chapterId: cid, topicId: firstTopic.id, weakTopics: sessionState.weakTopics },
      })
    }

    if (msg.includes('আরও সহজ') || msg.includes('simpler') || msg === 'simpler_explanation') {
      const topicId = sessionState.topicId || ''
      if (!topicId) {
        const weakTopicOptions = getSuggestedWeakTopics(book, sessionState.weakTopics ?? [])
        return NextResponse.json({
          reply: 'প্রথমে একটি টপিক বেছে নিন।',
          options: buildOptions({ phase: 'chapter_select' }, '', getChapterList(book), weakTopicOptions),
          nextState: { phase: 'chapter_select', weakTopics: sessionState.weakTopics },
        })
      }
      const content = await getSimplerExplanation(topicId)
      return NextResponse.json({
        reply: content,
        options: buildOptions({ phase: 'topic_learn', topicId, chapterId: sessionState.chapterId }, ''),
        nextState: { phase: 'topic_learn', topicId, chapterId: sessionState.chapterId, weakTopics: sessionState.weakTopics },
      })
    }

    if (msg.includes('কুইজ') || msg.includes('quiz') || msg === 'start_quiz') {
      const topicId = sessionState.topicId || ''
      if (!topicId) {
        const weakTopicOptions = getSuggestedWeakTopics(book, sessionState.weakTopics ?? [])
        return NextResponse.json({
          reply: 'প্রথমে একটি টপিক পড়ুন।',
          options: buildOptions({ phase: 'chapter_select' }, '', getChapterList(book), weakTopicOptions),
          nextState: { phase: 'chapter_select', weakTopics: sessionState.weakTopics },
        })
      }
      const quiz = await getQuizForTopic(topicId)
      if (!quiz) {
        return NextResponse.json({
          reply: 'এই টপিকের জন্য কুইজ নেই। পরবর্তী টপিকে যান।',
          options: buildOptions({ phase: 'topic_learn', topicId, chapterId: sessionState.chapterId }, ''),
          nextState: { phase: 'topic_learn', topicId, chapterId: sessionState.chapterId, weakTopics: sessionState.weakTopics },
        })
      }
      const opts = quiz.options.map((o, i) => ({ label: o, action: `answer:${i}` }))
      return NextResponse.json({
        reply: quiz.question,
        options: opts,
        nextState: { phase: 'quiz', topicId, chapterId: sessionState.chapterId, quizQuestionIndex: 0, weakTopics: sessionState.weakTopics },
      })
    }

    if (msg.startsWith('answer:') && sessionState.phase === 'quiz') {
      const idx = parseInt(msg.replace('answer:', ''), 10)
      const topicId = sessionState.topicId || ''
      const { correct, feedback } = await evaluateAnswer(topicId, idx, 0)

      const prevFailCount = sessionState.quizFailCount ?? 0
      const newFailCount = correct ? 0 : prevFailCount + 1
      const weakTopics = [...new Set([...(sessionState.weakTopics ?? []), ...(correct ? [] : [topicId])])]

      // Adaptive Learning: fail twice → auto simpler explanation with analogy
      if (!correct && newFailCount >= 2) {
        const content = await getSimplerExplanationWithAnalogy(topicId)
        return NextResponse.json({
          reply: content,
          options: [
            { label: 'কুইজ আবার দাও', action: 'start_quiz' },
            { label: 'পরবর্তী টপিক', action: 'next_topic' },
          ],
          nextState: {
            phase: 'topic_learn',
            topicId,
            chapterId: sessionState.chapterId,
            lastQuizResult: false,
            quizFailCount: 0,
            weakTopics,
          },
        })
      }

      return NextResponse.json({
        reply: feedback,
        options: buildOptions(
          { phase: 'topic_learn', topicId, chapterId: sessionState.chapterId, lastQuizResult: correct },
          ''
        ),
        nextState: {
          phase: 'topic_learn',
          topicId,
          chapterId: sessionState.chapterId,
          lastQuizResult: correct,
          quizFailCount: newFailCount,
          weakTopics,
        },
      })
    }

    if (msg.includes('পরবর্তী') || msg.includes('next') || msg === 'next_topic') {
      const chapterId = sessionState.chapterId || 'ch1'
      const topicId = sessionState.topicId || ''
      const topics = getTopicList(book, chapterId)
      const currentIdx = topics.findIndex((t) => t.id === topicId)
      const nextTopic = currentIdx >= 0 && currentIdx < topics.length - 1 ? topics[currentIdx + 1] : null
      if (nextTopic) {
        const content = await getTopicContent(nextTopic.id)
        return NextResponse.json({
          reply: content.text,
          imageUrl: content.imageUrl,
          options: buildOptions({ phase: 'topic_learn', chapterId, topicId: nextTopic.id }, ''),
          nextState: { phase: 'topic_learn', chapterId, topicId: nextTopic.id, weakTopics: sessionState.weakTopics },
        })
      }
      const weakTopicOptions = getSuggestedWeakTopics(book, sessionState.weakTopics ?? [])
      return NextResponse.json({
        reply: 'এই অধ্যায়ের সব টপিক শেষ! অন্য অধ্যায় বেছে নিন।',
        options: buildOptions({ phase: 'chapter_select' }, '', getChapterList(book), weakTopicOptions),
        nextState: { phase: 'chapter_select', weakTopics: sessionState.weakTopics },
      })
    }

    const context = getContextForAI(book, {
      phase: sessionState.phase || 'intro',
      chapterId: sessionState.chapterId,
      topicId: sessionState.topicId,
    })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ICT_TUTOR_SYSTEM + '\n\nবর্তমান কনটেক্সট:\n' + context },
        { role: 'user', content: message },
      ],
      max_tokens: 400,
    })
    const reply = completion.choices[0]?.message?.content || 'দুঃখিত, উত্তর দিতে পারিনি। আবার চেষ্টা করুন।'
    const options = buildOptions(
      { phase: sessionState.phase || 'intro', chapterId: sessionState.chapterId, topicId: sessionState.topicId },
      context
    )
    return NextResponse.json({
      reply,
      options,
      nextState: sessionState,
    })
  } catch (error) {
    console.error('[ICT chat]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process' },
      { status: 500 }
    )
  }
}
