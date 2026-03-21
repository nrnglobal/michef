'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import en from './en.json'
import es from './es.json'

type Language = 'en' | 'es'
type Translations = typeof en

const translations: Record<Language, Translations> = { en, es }

interface I18nContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[part]
  }
  if (typeof current === 'string') return current
  return path
}

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
  }, str)
}

export function I18nProvider({
  children,
  initialLanguage = 'en',
}: {
  children: React.ReactNode
  initialLanguage?: Language
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('casa-cook-lang', lang)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('casa-cook-lang') as Language | null
    if (stored && (stored === 'en' || stored === 'es')) {
      setLanguageState(stored)
    }
  }, [])

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[language] as unknown as Record<string, unknown>
    const raw = getNestedValue(dict, key)
    return interpolate(raw, params)
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
