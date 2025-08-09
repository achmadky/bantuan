import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp')
}

export function formatPaymentRange(paymentRange: string): string {
  if (!paymentRange) return ''
  
  // Handle range format like "10000-50000"
  if (paymentRange.includes('-')) {
    const [min, max] = paymentRange.split('-').map(num => parseInt(num.trim()))
    if (!isNaN(min) && !isNaN(max)) {
      return `${formatIDR(min)} - ${formatIDR(max)}`
    }
  }
  
  // Handle single number
  const amount = parseInt(paymentRange)
  if (!isNaN(amount)) {
    return formatIDR(amount)
  }
  
  return paymentRange
}

// Utility to remove sensitive data from offers for public consumption
export function sanitizeOfferForPublic<T extends { id?: string }>(offer: T): Omit<T, 'id'> {
  const { id, ...sanitizedOffer } = offer
  return sanitizedOffer
}

// Utility to sanitize multiple offers
export function sanitizeOffersForPublic<T extends { id?: string }>(offers: T[]): Omit<T, 'id'>[] {
  return offers.map(offer => sanitizeOfferForPublic(offer))
}
