'use client';

import { useEffect, useState } from 'react';

export default function WithdrawalCompleteSuccessLoading() {
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
          <div className="mx-auto max-w-md text-center animate-pulse">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-56 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72 mx-auto mb-8"></div>
            <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
