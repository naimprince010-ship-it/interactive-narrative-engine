'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email) {
      setMessage('ইমেইল দিন')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      setMessage('লগইন লিংক আপনার ইমেইলে পাঠানো হয়েছে')
    } catch (error) {
      const text = error instanceof Error ? error.message : 'লগইন ব্যর্থ হয়েছে'
      setMessage(text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-xl">
        <Link href="/" className="text-purple-300 hover:text-white mb-6 inline-block">
          ← Back to Stories
        </Link>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-purple-500/30">
          <h1 className="text-3xl font-bold mb-4">Login</h1>
          <p className="text-purple-200 mb-6">ইমেইল দিয়ে Magic link এর মাধ্যমে লগইন করুন</p>

          <label className="block text-sm text-purple-200 mb-2">Email</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg font-medium"
          >
            {loading ? 'পাঠানো হচ্ছে...' : 'Send Login Link'}
          </button>

          {message && <p className="text-sm text-yellow-200 mt-4">{message}</p>}
        </div>
      </div>
    </main>
  )
}
