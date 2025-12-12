'use client';

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/language-context";

interface StatsCounterClientProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  tKey: string;
  color: string;
}

export function StatsCounterClient({ 
  value, 
  suffix = "", 
  prefix = "", 
  decimals = 0, 
  tKey, 
  color 
}: StatsCounterClientProps) {
  const { t, language } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const duration = 2000;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentCount = easeOutQuad(progress) * value;
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  const formatNumber = (num: number) => {
    return num.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <>
      <div className={`mb-1 text-3xl font-bold ${color}`}>
        <span>
          {prefix}
          {formatNumber(count)}
          {suffix}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {t(tKey)}
      </p>
    </>
  );
}
