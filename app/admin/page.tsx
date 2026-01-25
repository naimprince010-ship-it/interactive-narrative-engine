'use client'

import { useEffect, useState } from 'react'

type Purchase = {
  id: string
  user_id?: string | null
  device_id: string
  package_id: string
  amount_bdt: number
  tokens: number
  trx_id: string | null
  verified?: boolean
  created_at: string
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [deviceId, setDeviceId] = useState('')
  const [userId, setUserId] = useState('')
  const [tokenDelta, setTokenDelta] = useState('100')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchPurchases = async () => {
    if (!token) {
      setMessage('Admin token দিন')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/purchases', {
        headers: {
          'x-admin-token': token,
        },
      })
      if (!response.ok) {
        throw new Error(await response.text())
      }
      const data = await response.json()
      setPurchases(data.purchases || [])
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Request failed'
      setMessage(text)
    } finally {
      setLoading(false)
    }
  }

  const markVerified = async (purchaseId: string) => {
    if (!token) {
      setMessage('Admin token দিন')
      return
    }

    setMessage(null)
    try {
      const response = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ purchaseId }),
      })
      if (!response.ok) {
        throw new Error(await response.text())
      }

      setPurchases((prev) =>
        prev.map((item) => (item.id === purchaseId ? { ...item, verified: true } : item)),
      )
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Request failed'
      setMessage(text)
    }
  }

  const adjustWallet = async () => {
    if (!token || (!deviceId && !userId)) {
      setMessage('Admin token এবং user ID/device ID দিন')
      return
    }

    const tokens = Number(tokenDelta)
    if (!Number.isFinite(tokens) || tokens === 0) {
      setMessage('টোকেন সংখ্যা সঠিক দিন')
      return
    }

    setMessage(null)
    try {
      const response = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ deviceId: deviceId || null, userId: userId || null, tokens }),
      })
      if (!response.ok) {
        throw new Error(await response.text())
      }
      const data = await response.json()
      setMessage(`আপডেটেড ব্যালেন্স: ${data.balance}`)
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Request failed'
      setMessage(text)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Admin Verification</h1>
          <p className="text-purple-200">Manual token purchases যাচাই করুন</p>
        </header>

        <section className="bg-white/10 border border-purple-500/30 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-purple-200 mb-2">Admin token</label>
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Enter ADMIN_DASH_TOKEN"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white"
            />
          </div>

          <button
            onClick={fetchPurchases}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-medium"
          >
            {loading ? 'লোড হচ্ছে...' : 'পেমেন্ট লিস্ট রিফ্রেশ'}
          </button>
          {message && <p className="text-sm text-yellow-200">{message}</p>}
        </section>

        <section className="bg-white/10 border border-purple-500/30 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">ম্যানুয়াল টোকেন টপ-আপ</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={deviceId}
              onChange={(event) => setDeviceId(event.target.value)}
              placeholder="Device ID"
              className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white"
            />
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="User ID (auth uid)"
              className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white"
            />
            <input
              value={tokenDelta}
              onChange={(event) => setTokenDelta(event.target.value)}
              placeholder="Tokens (e.g. 100)"
              className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white"
            />
          </div>
          <button
            onClick={adjustWallet}
            className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-medium"
          >
            টোকেন যোগ করুন
          </button>
        </section>

        <section className="bg-white/10 border border-purple-500/30 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">সাম্প্রতিক পেমেন্ট</h2>
          <div className="space-y-3">
            {purchases.length === 0 ? (
              <p className="text-sm text-purple-200">কোনো পেমেন্ট নেই</p>
            ) : (
              purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{purchase.package_id}</span>
                    <span className="text-xs text-purple-200">{purchase.created_at}</span>
                  </div>
                  <div className="text-sm text-purple-100">
                    User: {purchase.user_id || 'N/A'} | Device: {purchase.device_id || 'N/A'} | Trx: {purchase.trx_id || 'N/A'}
                  </div>
                  <div className="text-sm text-purple-100">
                    {purchase.amount_bdt} BDT → {purchase.tokens} tokens
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${purchase.verified ? 'text-emerald-300' : 'text-yellow-300'}`}>
                      {purchase.verified ? 'Verified' : 'Pending'}
                    </span>
                    {!purchase.verified && (
                      <button
                        onClick={() => markVerified(purchase.id)}
                        className="bg-yellow-500/20 border border-yellow-500 text-yellow-100 px-3 py-1 rounded-md text-xs"
                      >
                        Mark Verified
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
