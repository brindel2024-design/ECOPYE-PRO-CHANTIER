'use client'

import { useToast } from '@/hooks/use-toast'
import { X } from 'lucide-react'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg bg-white animate-fade-in ${
            toast.variant === 'destructive'
              ? 'border-red-200 bg-red-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className={`text-sm font-medium ${toast.variant === 'destructive' ? 'text-red-800' : 'text-gray-900'}`}>
                {toast.title}
              </p>
            )}
            {toast.description && (
              <p className={`text-sm mt-0.5 ${toast.variant === 'destructive' ? 'text-red-600' : 'text-gray-500'}`}>
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
