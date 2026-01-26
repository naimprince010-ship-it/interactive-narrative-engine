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

type Setting = {
  id: string
  key: string
  value: string
  description?: string
}

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [deviceId, setDeviceId] = useState('')
  const [userId, setUserId] = useState('')
  const [tokenDelta, setTokenDelta] = useState('100')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [bkashNumber, setBkashNumber] = useState('01700000000')
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'pending'>('all')
  const [searchTerm, setSearchTerm] = useState('')

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

  const loadSettings = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/admin/settings', {
        headers: { 'x-admin-token': token },
      })
      if (response.ok) {
        const data = await response.json()
        const bkash = data.settings?.find((s: Setting) => s.key === 'bkash_number')
        if (bkash) {
          setBkashNumber(bkash.value)
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }

  const updateBkashNumber = async () => {
    if (!token || !bkashNumber.trim()) {
      setMessage('bKash number দিন')
      return
    }

    setMessage(null)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          key: 'bkash_number',
          value: bkashNumber.trim(),
          description: 'bKash payment number for token purchases',
        }),
      })
      if (!response.ok) {
        throw new Error(await response.text())
      }
      setMessage('bKash number আপডেট হয়েছে')
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Failed to update'
      setMessage(text)
    }
  }

  useEffect(() => {
    if (token) {
      loadSettings()
    }
  }, [token])

  // Calculate stats
  const stats = {
    total: purchases.length,
    verified: purchases.filter((p) => p.verified).length,
    pending: purchases.filter((p) => !p.verified).length,
    totalRevenue: purchases.filter((p) => p.verified).reduce((sum, p) => sum + p.amount_bdt, 0),
    totalTokens: purchases.filter((p) => p.verified).reduce((sum, p) => sum + p.tokens, 0),
  }

  // Filter purchases
  const filteredPurchases = purchases.filter((p) => {
    if (filterVerified === 'verified' && !p.verified) return false
    if (filterVerified === 'pending' && p.verified) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        p.trx_id?.toLowerCase().includes(term) ||
        p.user_id?.toLowerCase().includes(term) ||
        p.device_id?.toLowerCase().includes(term) ||
        p.package_id.toLowerCase().includes(term)
      )
    }
    return true
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-purple-200">Token purchases মনিটরিং এবং সেটিংস</p>
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

          <div className="flex gap-3">
            <button
              onClick={fetchPurchases}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-medium"
            >
              {loading ? 'লোড হচ্ছে...' : 'পেমেন্ট লিস্ট রিফ্রেশ'}
            </button>
            <button
              onClick={loadSettings}
              disabled={loading || !token}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium"
            >
              সেটিংস লোড
            </button>
          </div>
          {message && (
            <p className={`text-sm ${message.includes('আপডেট') || message.includes('যোগ') ? 'text-green-300' : 'text-yellow-200'}`}>
              {message}
            </p>
          )}
        </section>

        {/* Settings Section */}
        <section className="bg-white/10 border border-purple-500/30 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">⚙️ সেটিংস</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-purple-200 mb-2">bKash Number</label>
              <input
                value={bkashNumber}
                onChange={(event) => setBkashNumber(event.target.value)}
                placeholder="01700000000"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={updateBkashNumber}
                disabled={!token}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium"
              >
                bKash Number আপডেট
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">এই নম্বরটি user dashboard-এ দেখাবে</p>
        </section>

        {/* Stats Section */}
        {purchases.length > 0 && (
          <section className="bg-white/10 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📊 পরিসংখ্যান</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-800/60 rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-400">মোট Purchase</div>
              </div>
              <div className="bg-emerald-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-300">{stats.verified}</div>
                <div className="text-sm text-gray-400">Verified</div>
              </div>
              <div className="bg-yellow-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-300">{stats.pending}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div className="bg-blue-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-300">{stats.totalRevenue}৳</div>
                <div className="text-sm text-gray-400">মোট Revenue</div>
              </div>
              <div className="bg-purple-900/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-300">{stats.totalTokens}</div>
                <div className="text-sm text-gray-400">মোট Tokens</div>
              </div>
            </div>
          </section>
        )}

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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">সাম্প্রতিক পেমেন্ট</h2>
            <div className="flex gap-2">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search (Trx ID, User, Device...)"
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-sm text-white"
              />
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value as 'all' | 'verified' | 'pending')}
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-sm text-white"
              >
                <option value="all">সব</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {filteredPurchases.length === 0 ? (
              <p className="text-sm text-purple-200">কোনো পেমেন্ট নেই</p>
            ) : (
              filteredPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{purchase.package_id}</span>
                    <span className="text-xs text-purple-200">{purchase.created_at}</span>
                  </div>
                  <div className="text-sm text-purple-100 space-y-1">
                    <div>User ID: <span className="text-yellow-200">{purchase.user_id || 'N/A'}</span></div>
                    <div>Device ID: <span className="text-yellow-200">{purchase.device_id || 'N/A'}</span></div>
                    <div>Transaction ID: <span className="text-yellow-200">{purchase.trx_id || 'N/A'}</span></div>
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
