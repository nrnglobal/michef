import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
