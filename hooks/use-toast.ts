'use client'

import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

let listeners: Array<(toasts: Toast[]) => void> = []
let toastState: Toast[] = []

function emitChange() {
  listeners.forEach((listener) => listener([...toastState]))
}

export function toast({
  title,
  description,
  variant = 'default',
}: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toastState = [...toastState, { id, title, description, variant }]
  emitChange()
  setTimeout(() => {
    toastState = toastState.filter((t) => t.id !== id)
    emitChange()
  }, 4000)
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const subscribe = useCallback(() => {
    const listener = (newToasts: Toast[]) => setToasts(newToasts)
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  useState(() => {
    return subscribe()
  })

  const dismiss = useCallback((id: string) => {
    toastState = toastState.filter((t) => t.id !== id)
    emitChange()
  }, [])

  return { toasts, toast, dismiss }
}
