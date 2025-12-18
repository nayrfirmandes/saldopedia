'use client';

import { useEffect, useState } from 'react';

interface LoadingSkeletonProps {
  variant?: 'default' | 'section' | 'card' | 'spinner' | 'hero';
  className?: string;
  delay?: number;
}

function TelegramSpinnerSmall() {
  return (
    <div className="relative w-7 h-7">
      <svg
        className="w-full h-full"
        viewBox="0 0 28 28"
        style={{
          animation: 'skeleton-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
        }}
      >
        <circle
          cx="14"
          cy="14"
          r="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="14"
          cy="14"
          r="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="50 20"
          className="text-blue-600 dark:text-blue-400"
        />
      </svg>
      <style jsx>{`
        @keyframes skeleton-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function LoadingSkeleton({ 
  variant = 'default', 
  className = '', 
  delay = 20 
}: LoadingSkeletonProps) {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
      requestAnimationFrame(() => setVisible(true));
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const variants = {
    default: 'h-96 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800',
    section: 'h-96 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-lg mx-auto max-w-6xl',
    card: 'h-64 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-lg',
    hero: 'h-screen bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800',
    spinner: 'flex items-center justify-center py-12',
  };

  if (!show) {
    return null;
  }

  if (variant === 'spinner') {
    return (
      <div 
        className={`${variants.spinner} ${className}`}
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.15s ease-out'
        }}
      >
        <TelegramSpinnerSmall />
      </div>
    );
  }

  return (
    <div 
      className={`${variants[variant]} ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s ease-out',
        animation: visible ? 'skeleton-shimmer 1.8s ease-in-out infinite' : 'none'
      }}
    >
      <style jsx>{`
        @keyframes skeleton-shimmer {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
