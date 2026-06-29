export type NetworkState = 'online' | 'offline' | 'checking'

type Listener = (state: NetworkState) => void

let state: NetworkState = navigator.onLine ? 'online' : 'offline'
let listeners: Listener[] = []
let offlineSince: number | null = null

export function getNetworkState(): NetworkState {
  return state
}

export function onNetworkChange(cb: Listener) {
  listeners.push(cb)
  return () => { listeners = listeners.filter(l => l !== cb) }
}

function setState(s: NetworkState) {
  if (s === state) return
  state = s
  listeners.forEach(l => l(s))
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineSince = null
    setState('online')
  })
  window.addEventListener('offline', () => {
    offlineSince = Date.now()
    setState('offline')
    const timer = setTimeout(() => {
      if (state === 'offline') setState('checking')
    }, 5000)
    window.addEventListener('online', () => clearTimeout(timer), { once: true })
  })

  setInterval(() => {
    if (state === 'offline' || state === 'checking') {
      fetch('https://clients3.google.com/generate_204', { mode: 'no-cors', cache: 'no-store' })
        .then(() => {
          if (state !== 'online') {
            offlineSince = null
            setState('online')
          }
        })
        .catch(() => {})
    }
  }, 10000)
}

export function offlineDuration(): number | null {
  if (state === 'online') return null
  return offlineSince ? Date.now() - offlineSince : null
}
