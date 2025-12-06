'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
  iconSize?: number;
  showText?: boolean;
  successDuration?: number;
}

export default function CopyButton({
  text,
  className = '',
  iconSize = 14,
  showText = false,
  successDuration = 2000,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), successDuration);
    } catch (err) {
      console.error('Failed to copy:', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), successDuration);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  }, [text, successDuration]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 p-1.5 rounded-md transition-all duration-200 ${
        copied
          ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
          : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${className}`}
      title={copied ? 'Tersalin!' : 'Salin'}
      aria-label={copied ? 'Tersalin' : 'Salin ke clipboard'}
    >
      {copied ? (
        <Check className="flex-shrink-0" style={{ width: iconSize, height: iconSize }} />
      ) : (
        <Copy className="flex-shrink-0" style={{ width: iconSize, height: iconSize }} />
      )}
      {showText && (
        <span className="text-xs font-medium">
          {copied ? 'Tersalin!' : 'Salin'}
        </span>
      )}
    </button>
  );
}

interface CopyableTextProps {
  text: string;
  className?: string;
  textClassName?: string;
  truncate?: boolean;
  maxLength?: number;
}

export function CopyableText({
  text,
  className = '',
  textClassName = '',
  truncate = false,
  maxLength = 20,
}: CopyableTextProps) {
  const displayText = truncate && text.length > maxLength
    ? `${text.slice(0, maxLength / 2)}...${text.slice(-maxLength / 2)}`
    : text;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span className={textClassName} title={text}>
        {displayText}
      </span>
      <CopyButton text={text} iconSize={12} />
    </div>
  );
}
