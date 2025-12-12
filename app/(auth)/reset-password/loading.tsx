'use client';

import { useEffect, useState } from 'react';

export default function ResetPasswordLoading() {
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
          <div className="mx-auto max-w-sm animate-pulse">
            <div className="mb-8 text-center space-y-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56 mx-auto"></div>
            </div>

            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                  <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
              <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
