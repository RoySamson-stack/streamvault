// Service Worker — blocks known ad/redirect/popup domains
const BLOCKED_PATTERNS = [
  'doubleclick.net',
  'popads.net',
  'popcash.net',
  'propellerads.com',
  'adserve.',
  'adserver.',
  'adskeeper.com',
  'adsterra.com',
  'juicyads.com',
  'exoclick.com',
  'trafficjunky.com',
  'clickadu.com',
  'hilltopads.net',
  'pushnotifications.',
  'push-notifications.',
  'notifpush.',
  'syndication.realsrv.com',
  'tsyndicate.com',
  'a-ads.com',
  'ad.atdmt.com',
  'tracking.',
  'tracker.',
  'redirect.',
  'popunder.',
  'popup.',
  'clicktrack.',
  'go.strp.us',
  'adf.ly',
  'bc.vc',
  'shorte.st',
  'linkbucks.com',
  'ouo.io',
  'shrink.',
  'clksite.com',
  'pushshare.com',
  'richpush.co',
  'megapush.io',
  'pushground.com',
  'outbrain.com',
  'taboola.com',
  'mgid.com',
  'revcontent.com',
  'content.ad',
  'nativo.com',
]

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const url = event.request.url.toLowerCase()

  // Block navigation requests to ad/redirect domains (prevents new tab opens)
  if (BLOCKED_PATTERNS.some(pattern => url.includes(pattern))) {
    event.respondWith(new Response('', { status: 204 }))
    return
  }

  // Block requests that look like popup/redirect scripts
  if (
    event.request.destination === 'script' &&
    (url.includes('pop') || url.includes('redirect') || url.includes('clickunder'))
  ) {
    event.respondWith(new Response('', { status: 204 }))
    return
  }
})
