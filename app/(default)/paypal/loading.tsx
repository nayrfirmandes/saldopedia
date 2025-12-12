'use client';

import { useEffect, useState } from 'react';

export default function PaypalLoading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!show) {
    return null;
  }

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          <div className="mx-auto max-w-3xl text-center mb-12 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 mx-auto mb-4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
          </div>
          
          <div className="max-w-2xl mx-auto animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-40"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
              
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
