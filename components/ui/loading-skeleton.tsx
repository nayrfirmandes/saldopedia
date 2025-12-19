'use client';

import { useEffect, useState } from 'react';

interface LoadingSkeletonProps {
  variant?: 'default' | 'section' | 'card' | 'spinner' | 'hero';
  className?: string;
  delay?: number;
}

export default function LoadingSkeleton({ 
  variant = 'default', 
  className = '', 
  delay = 20 
}: LoadingSkeletonProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const variants = {
    default: 'h-96 animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800',
    section: 'h-96 animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-lg mx-auto max-w-6xl',
    card: 'h-64 animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800 rounded-lg',
    hero: 'h-screen animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-800',
    spinner: 'flex items-center justify-center py-12',
  };

  if (!show) {
    return null;
  }

  if (variant === 'spinner') {
    return (
      <div className={`${variants.spinner} ${className}`}>
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-[3px] border-blue-600/20 dark:border-blue-400/20 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return <div className={`${variants[variant]} ${className}`} />;
}
