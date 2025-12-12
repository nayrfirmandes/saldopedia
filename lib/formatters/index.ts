import { formatDistanceToNow, Locale } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';

export function formatIDR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = Math.round(num).toLocaleString('id-ID');
  return `Rp ${formatted}`;
}

export function formatDateWIB(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta'
  }).format(date) + ' WIB';
}

export function formatDateTimeWIB(dateInput: string | Date): { date: string; time: string; full: string } {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  const dateStr = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(date);
  
  const timeStr = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta'
  }).format(date) + ' WIB';
  
  return {
    date: dateStr,
    time: timeStr,
    full: `${dateStr}, ${timeStr}`
  };
}

export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatCrypto(amount: number, symbol: string): string {
  let decimals = 8;
  
  if (amount >= 1) {
    decimals = 4;
  }
  if (amount >= 10) {
    decimals = 2;
  }
  if (amount >= 1000) {
    decimals = 0;
  }
  
  const formatted = amount.toFixed(decimals).replace(/\.?0+$/, '');
  return `${formatted} ${symbol}`;
}

export function formatTimeAgo(dateString: string | Date, locale: Locale = idLocale): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale });
}

export function getAvatarPlaceholder(name: string): string {
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    { bg: '#3B82F6', text: '#FFFFFF' },
    { bg: '#8B5CF6', text: '#FFFFFF' },
    { bg: '#10B981', text: '#FFFFFF' },
    { bg: '#F59E0B', text: '#FFFFFF' },
    { bg: '#EF4444', text: '#FFFFFF' },
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="${color.bg}"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="PayPal Sans, Arial, sans-serif" font-size="26.4" font-weight="bold" fill="${color.text}">${initial}</text>
  </svg>`;
  
  const base64 = typeof window !== 'undefined' 
    ? btoa(svg)
    : Buffer.from(svg).toString('base64');
  
  return `data:image/svg+xml;base64,${base64}`;
}
