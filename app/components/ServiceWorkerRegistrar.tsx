'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Block window.open calls from iframes / injected scripts
    const originalOpen = window.open
    window.open = function (...args) {
      const url = String(args[0] || '').toLowerCase()
      // Only allow opens triggered by user interaction on our own domain
      if (url.startsWith(window.location.origin)) {
        return originalOpen.apply(window, args)
      }
      // Block all third-party window.open calls
      return null
    }

    // Prevent beforeunload hijacking by third-party scripts
    const blockUnload = (e: BeforeUnloadEvent) => {
      // Only allow if user actually navigated
      if (!document.hasFocus()) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }
    window.addEventListener('beforeunload', blockUnload, true)

    return () => {
      window.open = originalOpen
      window.removeEventListener('beforeunload', blockUnload, true)
    }
  }, [])

  return null
}
