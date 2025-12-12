'use client';

type FormatSaldoProps = {
  amount: string | number;
  className?: string;
  showSign?: 'positive' | 'negative' | 'none';
};

export function FormatSaldo({ amount, className = '', showSign = 'none' }: FormatSaldoProps) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  // Split into whole and decimal parts
  const parts = formatted.split(',');
  const wholePart = parts[0];
  const decimalPart = parts[1] || '00';
  
  const sign = showSign === 'positive' ? '+' : showSign === 'negative' ? '-' : '';
  
  return (
    <span className={className}>
      {sign}Rp {wholePart}<span className="text-[0.7em]">,{decimalPart}</span>
    </span>
  );
}

// Helper function for simple formatting (returns string, not component)
export function formatIDRWithSmallDecimals(amount: string | number): { whole: string; decimal: string } {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const parts = formatted.split(',');
  return {
    whole: parts[0],
    decimal: parts[1] || '00'
  };
}
