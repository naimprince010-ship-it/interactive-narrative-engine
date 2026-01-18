'use client'

import { useState } from 'react'

interface PaymentModalProps {
  onClose: () => void
  onSuccess: () => void
  amount: number
  chapterTitle: string
}

export default function PaymentModal({ onClose, onSuccess, amount, chapterTitle }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'nagad' | 'rocket' | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    if (!paymentMethod || !phoneNumber || !transactionId) {
      alert('Please fill in all fields')
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      alert(`Payment successful! Transaction ID: ${transactionId}`)
      onSuccess()
    }, 2000)
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

          {paymentMethod && (
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
        </div>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Note: This is a demo. Integrate with actual payment gateway for production.
        </p>
      </div>
    </div>
  )
}
