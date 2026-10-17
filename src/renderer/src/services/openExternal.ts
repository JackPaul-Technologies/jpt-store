export const openExternal = (value: string): void => {
  const url = new URL(value, window.location.href)

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    console.warn(`Blocked unsupported external URL protocol: ${url.protocol}`)
    return
  }

  if (window.electronAPI) {
    window.electronAPI.openExternal(url.href)
    return
  }

  window.open(url.href, '_blank', 'noopener,noreferrer')
}
