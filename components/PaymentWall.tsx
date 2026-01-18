"use client";

import { PaymentInfo } from "@/types/story";

interface PaymentWallProps {
  paymentInfo: PaymentInfo;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentWall({
  paymentInfo,
  onPaymentSuccess,
  onCancel,
}: PaymentWallProps) {
  const handlePayment = () => {
    // Simulate payment processing
    // In a real app, this would integrate with a payment gateway
    alert(
      `Processing payment of ${paymentInfo.amount} ${paymentInfo.currency}...`
    );

    // Simulate successful payment after a brief delay
    setTimeout(() => {
      alert("Payment successful! Chapter unlocked.");
      onPaymentSuccess();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Premium Content
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This chapter is premium content. Unlock it to continue your
            adventure!
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-400">Price:</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {paymentInfo.amount} {paymentInfo.currency}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            One-time payment for this chapter
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Pay Now
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Go Back
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Secure payment processing
        </p>
      </div>
    </div>
  );
}
