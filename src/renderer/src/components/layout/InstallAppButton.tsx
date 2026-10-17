import React, { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export const InstallAppButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    if (window.electronAPI) return

    const handleBeforeInstallPrompt = (event: Event): void => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const handleAppInstalled = (): void => setInstallPrompt(null)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = (): void => {
    if (!installPrompt) return

    void installPrompt
      .prompt()
      .then(() => installPrompt.userChoice)
      .then(() => setInstallPrompt(null))
      .catch((error: unknown) => {
        console.error('Failed to start the JPT Store installation prompt:', error)
        setInstallPrompt(null)
      })
  }

  if (!installPrompt) return null

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install app</span>
    </button>
  )
}
