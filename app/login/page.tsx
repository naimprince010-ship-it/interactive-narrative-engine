'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabaseClient'
import Link from 'next/link'

type AuthMode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) {
      setMessage('ইমেইল এবং পাসওয়ার্ড দিন')
      return
    }

    if (password.length < 6) {
      setMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
      return
    }

    if (password !== confirmPassword) {
      setMessage('পাসওয়ার্ড মিলছে না')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.user && !data.session) {
        setMessage('আপনার ইমেইলে verification লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে account verify করুন।')
      } else if (data.session) {
        router.push('/dashboard')
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : 'সাইনআপ ব্যর্থ হয়েছে'
      setMessage(text)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('ইমেইল এবং পাসওয়ার্ড দিন')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      router.push('/dashboard')
    } catch (error) {
      const text = error instanceof Error ? error.message : 'লগইন ব্যর্থ হয়েছে'
      setMessage(text)
    } finally {
      setLoading(false)
    }
  }

  const handleGmailLogin = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Gmail লগইন ব্যর্থ হয়েছে'
      setMessage(text)
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
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setMode('login')
                setMessage(null)
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                mode === 'login'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMode('signup')
                setMessage(null)
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-4">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </h1>
          <p className="text-purple-200 mb-6">
            {mode === 'login'
              ? 'আপনার account দিয়ে লগইন করুন'
              : 'নতুন account তৈরি করুন'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-purple-200 mb-2">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-purple-200 mb-2">Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-purple-200 mb-2">Confirm Password</label>
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white"
                />
              </div>
            )}

            <button
              onClick={mode === 'login' ? handleLogin : handleSignUp}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : mode === 'login'
                  ? 'Login'
                  : 'Create Account'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-purple-200">OR</span>
              </div>
            </div>

            <button
              onClick={handleGmailLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Gmail
            </button>

            {message && (
              <p className={`text-sm mt-4 ${message.includes('ব্যর্থ') ? 'text-red-300' : 'text-yellow-200'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
