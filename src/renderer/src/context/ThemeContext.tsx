import React, { createContext, useContext, useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('app-theme') as ThemeMode) || 'dark'
  })

  const [isDark, setIsDark] = useState<boolean>(true)

  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const activeDark = theme === 'dark' || (theme === 'system' && prefersDark)

    setIsDark(activeDark)

    if (activeDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    root.classList.toggle('light', !activeDark)

    localStorage.setItem('app-theme', theme)
    window.electronAPI?.setNativeTheme(theme)
  }, [theme])

  const setTheme = (mode: ThemeMode): void => {
    setThemeState(mode)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
