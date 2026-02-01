import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Interactive Narrative Engine
          </h1>
          <p className="text-xl text-purple-200 mb-12">
            Embark on epic adventures where your choices shape the story
          </p>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl mb-8">
            <h2 className="text-3xl font-semibold text-white mb-4">🌌 Multiverse Stories</h2>
            <p className="text-purple-200 mb-4">
              বন্ধুদের সঙ্গে বা অন্যদের সঙ্গে একসাথে গল্প বানান — সবার choice মিলে গল্প এগোবে। আপনাকে একটা গোপন চরিত্র দেওয়া হবে; শেষ পর্যন্ত কে কে সেটা রহস্য।
            </p>
            <div className="bg-white/5 rounded-xl p-6 mb-6 text-left border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">স্টোরিতে জয়েন করলে কী কী পাবেন:</h3>
              <ul className="space-y-2 text-purple-200">
                <li>✅ <strong className="text-white">গোপন চরিত্র</strong> — কে কোন চরিত্র খেলছে কেউ জানবে না</li>
                <li>✅ <strong className="text-white">সবার ভোটে গল্প</strong> — সবার choice মিলে পরবর্তী দৃশ্য ঠিক হবে</li>
                <li>✅ <strong className="text-white">ক্যারেক্টার চ্যাট</strong> — চরিত্র হয়ে বাংলা–ইংলিশ মিক্সে চ্যাট</li>
                <li>✅ <strong className="text-white">বট প্লেয়ার</strong> — বন্ধু কম থাকলেও বট দিয়ে গল্প চালু</li>
                <li>✅ <strong className="text-white">নানা জেনার</strong> — মিস্ট্রি, রোমান্স, থ্রিলার ইত্যাদি গল্প</li>
              </ul>
            </div>
            <Link
              href="/multiverse"
              className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl mb-8"
            >
              🎮 Multiverse স্টোরিতে জয়েন করুন
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl mb-8">
            <h2 className="text-3xl font-semibold text-white mb-4">ICT টিউটর</h2>
            <p className="text-purple-200 mb-4">
              নবম-দশম শ্রেণির তথ্য ও যোগাযোগ প্রযুক্তি বই থেকে কথোপকথনের মাধ্যমে শিখুন। অধ্যায় বেছে নিন, কুইজ দিয়ে যাচাই করুন।
            </p>
            <Link
              href="/ict-tutor"
              className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl mb-6"
            >
              ICT টিউটরে যান
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-semibold text-white mb-6">Featured Stories</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/story/1">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer shadow-lg">
                  <h3 className="text-2xl font-bold text-white mb-2">The Enchanted Forest</h3>
                  <p className="text-purple-100">Free chapters available</p>
                </div>
              </Link>
              <Link href="/story/2">
                <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer shadow-lg">
                  <h3 className="text-2xl font-bold text-white mb-2">Space Odyssey</h3>
                  <p className="text-red-100">Free chapters available</p>
                </div>
              </Link>
              <Link href="/story/romantic-01">
                <div className="bg-gradient-to-br from-rose-600 to-fuchsia-600 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer shadow-lg">
                  <h3 className="text-2xl font-bold text-white mb-2">বৃষ্টি ভেজা বিকেল</h3>
                  <p className="text-rose-100">ফ্রি অধ্যায় আছে</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
