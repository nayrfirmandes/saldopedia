"use client";

import Image from "next/image";
import { useIsIOS } from "@/lib/use-ios-detection";

export default function PageIllustration() {
  const isIOS = useIsIOS();

  return (
    <>
      {/* Stripes illustration */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform"
        aria-hidden="true"
      >
        <div className="relative">
          <Image
            className="max-w-none dark:opacity-0"
            src="/images/stripes.svg"
            width={768}
            height={432}
            alt="Stripes"
            priority
            style={{ height: 'auto' }}
          />
          <Image
            className="absolute inset-0 max-w-none opacity-0 dark:opacity-100"
            src="/images/stripes-dark.svg"
            width={768}
            height={432}
            alt="Stripes Dark"
            priority
            style={{ height: 'auto' }}
          />
        </div>
      </div>
      {/* Circles - disabled on iOS for performance */}
      {!isIOS && (
        <>
          <div
            className="pointer-events-none absolute -top-32 left-1/2 ml-[580px] -translate-x-1/2"
            aria-hidden="true"
          >
            <div className="h-80 w-80 rounded-full bg-linear-to-tr from-gray-300 dark:from-gray-600 opacity-50 blur-[160px] will-change-[filter]" />
          </div>
          <div
            className="pointer-events-none absolute left-1/2 top-[420px] ml-[380px] -translate-x-1/2"
            aria-hidden="true"
          >
            <div className="h-80 w-80 rounded-full bg-linear-to-tr from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-800 opacity-50 blur-[160px] will-change-[filter]" />
          </div>
          <div
            className="pointer-events-none absolute left-1/2 top-[640px] -ml-[300px] -translate-x-1/2"
            aria-hidden="true"
          >
            <div className="h-80 w-80 rounded-full bg-linear-to-tr from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-800 opacity-50 blur-[160px] will-change-[filter]" />
          </div>
        </>
      )}
    </>
  );
}
