import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { wpApi } from '../services/wpApi'
import { openExternal } from '../services/openExternal'
import { Sun, Moon, Laptop, Trash2, Check, Globe } from 'lucide-react'

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [cacheCleared, setCacheCleared] = useState(false)

  const handleClearCache = (): void => {
    wpApi.clearCache()
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 2500)
  }

  return (
    <div className="p-8 max-w-2xl space-y-8 overflow-y-auto flex-1">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Preferences and application information</p>
      </div>

      {/* Theme Section */}
      <div className="glass-card bg-slate-800/50 border border-slate-700/60 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'system', label: 'System', icon: Laptop }
          ].map((mode) => {
            const Icon = mode.icon
            const isSelected = theme === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => setTheme(mode.id as 'light' | 'dark' | 'system')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900/50 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 mb-2" />
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cache & Data Section */}
      <div className="glass-card bg-slate-800/50 border border-slate-700/60 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Storage & API Cache</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The desktop app locally caches WordPress API responses in memory to ensure fluid
          navigation. Clear the cache if you published updates on WordPress that do not show
          immediately.
        </p>
        <button
          onClick={handleClearCache}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-xs font-semibold transition-colors"
        >
          {cacheCleared ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Cache Cleared!</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 text-slate-300" />
              <span>Clear WordPress API Cache</span>
            </>
          )}
        </button>
      </div>

      <div className="glass-card bg-slate-800/50 border border-slate-700/60 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">About</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Jack Paul Technologies develops applications and publishes technical articles and software
          releases.
        </p>
        <button
          onClick={() => openExternal('https://jackpaultechnologies.wordpress.com')}
          className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>Visit website</span>
        </button>
      </div>
    </div>
  )
}
