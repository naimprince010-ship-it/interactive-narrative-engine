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
