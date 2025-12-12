'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonInlineProps {
  text: string;
  copiedText?: string;
  copyText?: string;
}

export function CopyButtonInline({ text, copiedText = 'Tersalin!', copyText = 'Salin' }: CopyButtonInlineProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
      document.body.removeChild(textArea);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 ml-2 p-1 rounded transition-all duration-200 ${
        copied
          ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
          : 'text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title={copied ? copiedText : copyText}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

interface CopyableAddressProps {
  address: string;
  label?: string;
  className?: string;
  copiedText?: string;
  copyText?: string;
}

export function CopyableAddress({ address, label, className = '', copiedText = 'Tersalin!', copyText = 'Salin' }: CopyableAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = address;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
      document.body.removeChild(textArea);
    }
  }, [address]);

  return (
    <div className={`${className}`}>
      {label && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      )}
      <div className="flex items-start gap-2">
        <div className="font-mono text-xs break-all flex-1 text-green-600 dark:text-green-400 select-all">
          {address}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            copied
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              {copiedText}
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              {copyText}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface CopyableEmailProps {
  email: string;
  label?: string;
  className?: string;
  copiedText?: string;
  copyText?: string;
}

export function CopyableEmail({ email, label, className = '', copiedText = 'Tersalin!', copyText = 'Salin' }: CopyableEmailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = email;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Copy failed:', e);
      }
      document.body.removeChild(textArea);
    }
  }, [email]);

  return (
    <div className={`${className}`}>
      {label && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      )}
      <div className="flex items-center gap-2">
        <div className="font-mono text-sm text-blue-600 dark:text-blue-400 select-all">
          {email}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex-shrink-0 inline-flex items-center gap-1 p-1.5 rounded-md transition-all duration-200 ${
            copied
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          title={copied ? copiedText : copyText}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
