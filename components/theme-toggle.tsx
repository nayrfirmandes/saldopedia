'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/theme-context'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLight = theme === 'light'
  const isDark = theme === 'dark'

  const sunRays = [
    { cx: 12, cy: 3 },
    { cx: 18.36, cy: 5.64 },
    { cx: 21, cy: 12 },
    { cx: 18.36, cy: 18.36 },
    { cx: 12, cy: 21 },
    { cx: 5.64, cy: 18.36 },
    { cx: 3, cy: 12 },
    { cx: 5.64, cy: 5.64 },
  ]

  const handleToggle = () => {
    setIsAnimating(true)
    setTheme(isLight ? 'dark' : 'light')
    setTimeout(() => setIsAnimating(false), 600)
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className="group relative h-9 w-9 p-1.5"
        aria-label="Toggle theme"
      >
        <div className="relative h-6 w-6">
          <div className="absolute inset-0 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      </button>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes shimmer {
          0% { opacity: 0.3; }
          25% { opacity: 1; }
          50% { opacity: 0.5; }
          75% { opacity: 1; }
          100% { opacity: 1; }
        }
        .ray-shimmer {
          animation: shimmer 0.5s ease-out forwards;
        }
      `}</style>
      <button
        type="button"
        onClick={handleToggle}
        className="group relative h-9 w-9 p-1.5 hover:scale-110 active:scale-95"
        style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        aria-label="Toggle theme"
      >
        <div className="relative h-6 w-6">
          <svg
            className="absolute inset-0 h-6 w-6 text-yellow-500 group-hover:text-yellow-600"
            style={{
              opacity: isLight ? 1 : 0,
              transition: 'opacity 0.3s ease-out',
              pointerEvents: isLight ? 'auto' : 'none'
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <defs>
              <mask id="moonMask">
                <rect x="0" y="0" width="24" height="24" fill="white" />
                <circle 
                  cx="17"
                  cy="7"
                  r={isLight ? 5 : 0}
                  fill="black"
                  style={{
                    transition: 'r 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
                  }}
                />
              </mask>
            </defs>
            <circle 
              cx="12" 
              cy="12" 
              r={isLight ? 9 : 0}
              mask="url(#moonMask)"
              style={{
                transition: 'r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transformOrigin: 'center'
              }}
            />
          </svg>
          
          <svg
            className="absolute inset-0 h-6 w-6 text-yellow-400 group-hover:text-yellow-300"
            style={{
              opacity: isDark ? 1 : 0,
              transition: 'opacity 0.3s ease-out',
              pointerEvents: isDark ? 'auto' : 'none'
            }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle 
              cx="12" 
              cy="12" 
              r={isDark ? 5 : 0}
              style={{
                transition: 'r 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transformOrigin: 'center'
              }}
            />
            {sunRays.map((ray, index) => (
              <circle
                key={index}
                cx={isDark ? ray.cx : 12}
                cy={isDark ? ray.cy : 12}
                r={isDark ? 1.5 : 0}
                className={isAnimating && isDark ? 'ray-shimmer' : ''}
                style={{
                  transition: 'cx 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), cy 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), r 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transformOrigin: 'center'
                }}
              />
            ))}
          </svg>
        </div>
      </button>
    </>
  )
}
