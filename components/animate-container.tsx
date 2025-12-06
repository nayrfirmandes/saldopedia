'use client';

import { AnimateOnScroll } from '@/lib/use-animate-on-scroll';

interface AnimateContainerProps {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out' | 'zoom-y-out' | 'fade-in';
  delay?: number;
  duration?: number;
  className?: string;
}

export default function AnimateContainer({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  className = '',
}: AnimateContainerProps) {
  return (
    <AnimateOnScroll 
      animation={animation} 
      delay={delay} 
      duration={duration}
      className={className}
    >
      {children}
    </AnimateOnScroll>
  );
}
