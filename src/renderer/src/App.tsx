import React, { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { wpApi } from './services/wpApi'
import { ThemeProvider } from './context/ThemeContext'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { LoadingScreen } from './components/LoadingScreen'
import { Home } from './views/Home'
import { CategoryView } from './views/CategoryView'
import { Settings } from './views/Settings'

type StartupStage = 'loading' | 'welcome' | 'home'
const MINIMUM_LOADING_DURATION_MS = 8000

let startupDataRequest: Promise<void> | undefined

const preloadHomeData = (): Promise<void> => {
  startupDataRequest ??= Promise.allSettled([
    wpApi.getPosts({ perPage: 24 }),
    wpApi.getCategories()
  ]).then(() => undefined)

  return startupDataRequest
}

export const App: React.FC = () => {
  const [startupStage, setStartupStage] = useState<StartupStage>('loading')

  useEffect(() => {
    let isMounted = true
    let minimumLoadingTimer: number | undefined
    const minimumLoadingDuration = window.electronAPI ? MINIMUM_LOADING_DURATION_MS : 0
    const minimumLoadingTime = new Promise<void>((resolve) => {
      minimumLoadingTimer = window.setTimeout(resolve, minimumLoadingDuration)
    })

    void Promise.all([preloadHomeData(), minimumLoadingTime]).then(() => {
      if (isMounted) setStartupStage('welcome')
    })

    return () => {
      isMounted = false
      if (minimumLoadingTimer !== undefined) window.clearTimeout(minimumLoadingTimer)
    }
  }, [])

  useEffect(() => {
    if (startupStage !== 'welcome') return

    const timer = window.setTimeout(() => {
      window.location.hash = '/'
      setStartupStage('home')
    }, 2400)
    return () => window.clearTimeout(timer)
  }, [startupStage])

  return (
    <ThemeProvider>
      <HashRouter>
        <div className="app-shell relative h-screen w-screen flex flex-col text-slate-100 overflow-hidden select-none">
          {startupStage !== 'home' && <LoadingScreen isLoading={startupStage === 'loading'} />}

          {startupStage === 'welcome' && (
            <section className="startup-welcome" aria-labelledby="startup-welcome-title">
              <div className="startup-welcome__content">
                <h1 id="startup-welcome-title">Welcome to JPT Store</h1>
              </div>
            </section>
          )}

          {startupStage === 'home' && (
            <>
              <Header />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex overflow-hidden bg-transparent">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/category/:categorySlug" element={<CategoryView />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </>
          )}
        </div>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
