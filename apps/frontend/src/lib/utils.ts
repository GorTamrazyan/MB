import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'AMD') {
  return new Intl.NumberFormat('hy-AM', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('hy-AM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
