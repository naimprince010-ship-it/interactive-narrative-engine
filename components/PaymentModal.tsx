'use client'

import { useState } from 'react'

interface PaymentModalProps {
  onClose: () => void
  onSuccess: () => void
  amount: number
  chapterTitle: string
  storyId: string
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
  amount,
  chapterTitle,
  storyId,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'nagad' | 'rocket' | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert('Please fill in all fields')
      return
    }

    if (paymentMethod !== 'bKash') {
      alert('Only bKash automation is available right now.')
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const deviceId = getDeviceId()
      const response = await fetch('/api/bkash/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          storyId,
          amount,
          returnUrl: `${window.location.origin}/story/${storyId}`,
          deviceId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to create payment.')
      }

      const data = await response.json()
      if (!data.bkashURL) {
        throw new Error('bKash URL missing from response.')
      }

      window.location.href = data.bkashURL
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
          <p className="text-3xl font-bold text-white mb-4">Amount: {amount} BDT</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['bKash', 'nagad', 'rocket'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    paymentMethod === method
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod && paymentMethod !== 'bKash' && (
            <>
              <div>
                <label className="block text-white font-medium mb-2">
                  {paymentMethod} Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-4">
                <p className="text-blue-200 text-sm">
                  <strong>Instructions:</strong> Send {amount} BDT to {paymentMethod} number: 
                  <span className="font-mono font-bold"> 01XXXXXXXXX</span> (Use your merchant number in production)
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </>
          )}

          {paymentMethod === 'bKash' && (
            <>
              <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 mb-4">
                <p className="text-blue-200 text-sm">
                  <strong>Auto-pay:</strong> You will be redirected to bKash to complete the payment.
                </p>
              </div>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Pay with bKash'}
              </button>
            </>
          )}

          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-200 text-sm">{errorMessage}</p>
            </div>
          )}
        </div>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Note: This flow uses bKash tokenized checkout for automated verification.
        </p>
      </div>
    </div>
  )
}
