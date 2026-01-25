'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabaseClient'

type Purchase = {
  id: string
  package_id: string
  amount_bdt: number
  tokens: number
  trx_id: string | null
  verified?: boolean
  created_at: string
}

const packages = [
  {
    id: 'trial' as const,
    title: 'ট্রায়াল প্যাক',
    amount: 10,
    tokens: 100,
    benefit: 'মাইক্রো-ট্রানজিশন শুরু করার জন্য পারফেক্ট',
  },
  {
    id: 'bonus' as const,
    title: 'বোনাস প্যাক',
    amount: 50,
    tokens: 550,
    benefit: '১০% বোনাস টোকেন',
  },
  {
    id: 'best' as const,
    title: 'সেরা অফার',
    amount: 100,
    tokens: 1200,
    benefit: '২০% বোনাস টোকেন',
  },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<'trial' | 'bonus' | 'best' | null>(null)
  const [trxId, setTrxId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [bkashNumber, setBkashNumber] = useState('01700000000')

  const loadSession = async () => {
    const supabase = getSupabaseClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token || null
    setAccessToken(token)
    setUserEmail(data.session?.user?.email || null)
    return token
  }

  const loadBalance = async (token: string | null) => {
    if (!token) {
      return
    }

    const response = await fetch('/api/tokens', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    if (response.ok) {
      const data = await response.json()
      if (typeof data.balance === 'number') {
        setBalance(data.balance)
      }
    }
  }

  const loadPurchases = async (token: string | null) => {
    if (!token) {
      return
    }

    const response = await fetch('/api/tokens/purchases', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      setPurchases(data.purchases || [])
    }
  }

  const loadBkashNumber = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.bkash_number) {
          setBkashNumber(data.bkash_number)
        }
      }
    } catch (error) {
      // Use default if API fails
    }
  }

  useEffect(() => {
    const init = async () => {
      const token = await loadSession()
      await loadBalance(token)
      await loadBkashNumber()
      setLoading(false)
    }
    init()
  }, [])

  const handlePurchase = async () => {
    if (!selectedPackage || !trxId || !accessToken) {
      setMessage('প্যাকেজ এবং ট্রানজেকশন আইডি দিন')
      return
    }

    setMessage(null)
    const response = await fetch('/api/tokens/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        packageId: selectedPackage,
        trxId,
      }),
    })

    if (!response.ok) {
      setMessage(await response.text())
      return
    }

    const data = await response.json()
    if (typeof data.balance === 'number') {
      setBalance(data.balance)
      setMessage('টোকেন যোগ হয়েছে')
    }
  }

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    setUserEmail(null)
    setAccessToken(null)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        Loading...
      </main>
    )
  }

  if (!userEmail) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-16 max-w-xl">
          <Link href="/" className="text-purple-300 hover:text-white mb-6 inline-block">
            ← Back to Stories
          </Link>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-purple-500/30">
            <h1 className="text-3xl font-bold mb-4">Login required</h1>
            <p className="text-purple-200 mb-6">টোকেন কিনতে এবং ব্যালেন্স দেখতে লগইন করুন</p>
            <Link href="/login" className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-medium inline-block">
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Dashboard</h1>
            <p className="text-purple-200">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </header>

        <section className="bg-white/10 border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Token Balance</h2>
          <div className="text-3xl font-bold">🪙 {balance ?? 0}</div>
        </section>

        <section className="bg-white/10 border border-purple-500/30 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Token Pack Purchase</h2>
          
          {!selectedPackage ? (
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-200">📦 একটি প্যাকেজ সিলেক্ট করুন</p>
            </div>
          ) : (
            <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 mb-4 space-y-3">
              <p className="text-sm font-semibold text-purple-200">✅ প্যাকেজ সিলেক্ট করা হয়েছে</p>
              <div className="text-sm text-purple-100">
                <p>📦 {packages.find(p => p.id === selectedPackage)?.title}</p>
                <p>💰 {packages.find(p => p.id === selectedPackage)?.amount} টাকা</p>
                <p>🪙 {packages.find(p => p.id === selectedPackage)?.tokens} টোকেন</p>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {packages.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setSelectedPackage(pack.id)}
                className={`text-left p-4 rounded-lg border transition-all ${
                  selectedPackage === pack.id
                    ? 'bg-purple-700/60 border-purple-400 text-white'
                    : 'bg-gray-800/60 border-gray-600 text-gray-200 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{pack.title}</span>
                  <span className="text-sm text-purple-200">{pack.amount} টাকা</span>
                </div>
                <div className="text-sm text-purple-100 mt-1">🪙 {pack.tokens} টোকেন</div>
                <div className="text-xs text-gray-300 mt-1">{pack.benefit}</div>
              </button>
            ))}
          </div>

          {selectedPackage && (
            <>
              <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-yellow-200">💳 পেমেন্ট করার ধাপ:</p>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>bKash/Nagad/Rocket এ <span className="text-yellow-300 font-semibold">{bkashNumber}</span> নম্বরে <span className="text-yellow-300 font-semibold">{packages.find(p => p.id === selectedPackage)?.amount} টাকা</span> পাঠান</li>
                  <li>পেমেন্ট করার পর <span className="text-yellow-300 font-semibold">Transaction ID</span> পাবেন</li>
                  <li>নিচে Transaction ID দিন এবং <span className="text-yellow-300 font-semibold">Confirm Purchase</span> ক্লিক করুন</li>
                  <li>Admin verify করার পর টোকেন আপনার account এ যোগ হবে</li>
                </ol>
              </div>

              <input
                value={trxId}
                onChange={(event) => setTrxId(event.target.value)}
                placeholder="Transaction ID (bKash/Nagad/Rocket থেকে পাওয়া)"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white"
              />
              <button
                onClick={handlePurchase}
                disabled={!trxId.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium"
              >
                Confirm Purchase
              </button>
              {message && (
                <p className={`text-sm ${message.includes('যোগ') ? 'text-green-300' : 'text-yellow-200'}`}>
                  {message}
                </p>
              )}
            </>
          )}
        </section>

        <section className="bg-white/10 border border-purple-500/30 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Recent Purchases</h2>
          <button
            onClick={() => loadPurchases(accessToken)}
            className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
          <div className="space-y-3">
            {purchases.length === 0 ? (
              <p className="text-sm text-purple-200">কোনো পেমেন্ট নেই</p>
            ) : (
              purchases.map((purchase) => (
                <div key={purchase.id} className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{purchase.package_id}</span>
                    <span className="text-xs text-purple-200">{purchase.created_at}</span>
                  </div>
                  <div className="text-sm text-purple-100">
                    {purchase.amount_bdt} BDT → {purchase.tokens} tokens
                  </div>
                  <div className="text-sm text-purple-100">Trx: {purchase.trx_id || 'N/A'}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
