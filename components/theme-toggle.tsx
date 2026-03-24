'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle({ compact }: { compact?: boolean } = {}) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored === 'dark' || (!stored && prefersDark)
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label="Toggle dark mode"
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        style={{ color: 'var(--casa-text-dark)' }}
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      style={{ color: 'var(--casa-text-dark)' }}
    >
      {dark ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
      <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  )
}
