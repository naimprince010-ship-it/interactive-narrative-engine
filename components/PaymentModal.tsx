'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'

interface PaymentModalProps {
  onClose: () => void
  onSuccess: (balance: number) => void
  chapterTitle: string
}

function getDeviceId() {
  if (typeof window === 'undefined') {
    return 'server'
  }

  const stored = localStorage.getItem('device-id')
  if (stored) {
    return stored
  }

  const generated = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`

  localStorage.setItem('device-id', generated)
  return generated
}

export default function PaymentModal({
  onClose,
  onSuccess,
  chapterTitle,
}: PaymentModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<'trial' | 'bonus' | 'best' | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  const handlePurchase = async () => {
    if (!selectedPackage || !transactionId) {
      alert('প্যাকেজ এবং ট্রানজেকশন আইডি দিন')
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const deviceId = getDeviceId()
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      const response = await fetch('/api/tokens/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          deviceId,
          packageId: selectedPackage,
          trxId: transactionId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Purchase failed.')
      }

      const data = await response.json()
      if (typeof data.balance !== 'number') {
        throw new Error('Balance missing from response.')
      }

      onSuccess(data.balance)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed.'
      setErrorMessage(message)
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-purple-500/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Unlock Premium Chapter</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-purple-300 mb-2">Chapter: <span className="text-white font-semibold">{chapterTitle}</span></p>
          <p className="text-lg text-purple-200">প্রিমিয়াম পাতা খুলতে ১০ টোকেন লাগবে</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">টোকেন প্যাকেজ বাছাই করুন</label>
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
          </div>

          <div>
            <label className="block text-white font-medium mb-2">আপনার নাম্বার (ঐচ্ছিক)</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-2">
            <p className="text-blue-200 text-sm">
              <strong>ম্যানুয়াল পেমেন্ট:</strong> আপনার পছন্দের মাধ্যমে টাকা পাঠিয়ে এখানে ট্রানজেকশন আইডি দিন।
            </p>
          </div>

          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'টোকেন কিনুন'}
          </button>

          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-200 text-sm">{errorMessage}</p>
            </div>
          )}
        </div>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Note: এটি ম্যানুয়াল যাচাই ফ্লো। পরে অটোমেশন যোগ করা যাবে।
        </p>
      </div>
    </div>
  )
}
