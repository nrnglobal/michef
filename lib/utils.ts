import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1))
}

export function formatInstructions(text: string): string[] {
  return text
    .split(/\.\s+/)
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(s => s.length > 10)
}

function parseDateLocal(date: string | Date): Date {
  if (typeof date !== 'string') return date
  const [y, m, day] = date.split('-').map(Number)
  return new Date(y, m - 1, day)
}

export function formatDate(date: string | Date): string {
  return parseDateLocal(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateEs(date: string | Date): string {
  return parseDateLocal(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
