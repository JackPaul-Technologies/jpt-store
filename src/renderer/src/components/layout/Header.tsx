import React from 'react'
import { WindowControls } from './WindowControls'
import { Layers } from 'lucide-react'
import { InstallAppButton } from './InstallAppButton'

export const Header: React.FC = () => {
  return (
    <header className="glass-panel h-9 w-full border-b flex items-center justify-between px-3 titlebar-drag-region select-none z-50">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
        <Layers className="w-4 h-4 text-indigo-400" />
        <span>JPT Store</span>
        <span className="px-3 py-2 text-xs text-slate-500">v1.0.0</span>
      </div>
      <div className="flex items-center gap-2">
        <InstallAppButton />
        <WindowControls />
      </div>
    </header>
  )
}
