const CACHE_NAME = 'jpt-store-web-v1'
const APP_SHELL = ['./', './manifest.webmanifest']

const cacheResponse = (event, request, response) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.put(request, response))
      .catch((error) => console.error('Failed to cache a JPT Store resource:', error))
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('jpt-store-web-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            cacheResponse(event, './', response.clone())
          }
          return response
        })
        .catch(async () => (await caches.match('./')) || Response.error())
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          cacheResponse(event, request, response.clone())
        }
        return response
      })
    })
  )
})
