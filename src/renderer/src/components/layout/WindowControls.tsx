import React, { useEffect, useState } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'

export const WindowControls: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const electronAPI = window.electronAPI
    if (!electronAPI) return

    void electronAPI.isMaximized().then(setIsMaximized)
    return electronAPI.onMaximizedChange(setIsMaximized)
  }, [])

  if (!window.electronAPI) return null

  return (
    <div className="flex items-center h-full titlebar-no-drag">
      <button
        onClick={() => window.electronAPI?.minimize()}
        className="w-11 h-8 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
        title="Minimize"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => window.electronAPI?.toggleMaximize()}
        className="w-11 h-8 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
        title={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? (
          <Copy className="w-3 h-3 rotate-180" />
        ) : (
          <Square className="w-3 h-3" />
        )}
      </button>
      <button
        onClick={() => window.electronAPI?.close()}
        className="w-11 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 transition-colors"
        title="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
