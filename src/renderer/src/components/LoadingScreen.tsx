import React, { useEffect, useState } from 'react'
import logo from '../assets/jpt-logo.png'

interface LoadingScreenProps {
  isLoading: boolean
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isLoading) {
      const interval = window.setInterval(() => {
        setProgress((current) => Math.min(current + 1, 92))
      }, 80)

      return () => window.clearInterval(interval)
    }

    const resetTimer = window.setTimeout(() => setProgress(0), 1000)
    return () => window.clearTimeout(resetTimer)
  }, [isLoading])

  return (
    <div
      className={`release-loader${isLoading ? '' : ' release-loader--fadeout'}`}
      role={isLoading ? 'status' : undefined}
      aria-live={isLoading ? 'polite' : undefined}
      aria-hidden={!isLoading}
    >
      <div className="release-loader__content">
        <div className="release-loader__brand">
          <img src={logo} alt="Jack Paul Technologies" />
        </div>
        <p className="release-loader__eyebrow">JACK PAUL TECHNOLOGIES</p>

        <div className="release-loader__pyramid" aria-hidden="true">
          <div className="release-loader__pyramid-spin">
            <span className="release-loader__side release-loader__side--one" />
            <span className="release-loader__side release-loader__side--two" />
            <span className="release-loader__side release-loader__side--three" />
            <span className="release-loader__side release-loader__side--four" />
            <span className="release-loader__shadow" />
          </div>
          <div className="release-loader__glow" />
        </div>

        <div className="release-loader__status">
          <span className="release-loader__shimmer">Connecting to JPT Store...</span>
          <span className="release-loader__percent">{isLoading ? progress : 100}%</span>
          <div className="release-loader__track" aria-hidden="true">
            <span style={{ width: `${isLoading ? progress : 100}%` }} />
          </div>
        </div>

        <div className="release-loader__footer">
          Android <i /> Windows <i /> Web
        </div>
      </div>
    </div>
  )
}
