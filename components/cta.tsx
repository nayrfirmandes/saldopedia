'use client';

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { useIsIOS } from "@/lib/use-ios-detection";

export default function Cta() {
  const { t } = useLanguage();
  const isIOS = useIsIOS();
  
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl text-center shadow-xl before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-900 dark:before:bg-linear-to-br dark:before:from-gray-800 dark:before:via-gray-900 dark:before:to-black"
          
        >
          {/* Glow - disabled on iOS for performance */}
          {!isIOS && (
            <div
              className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2 translate-y-1/2"
              aria-hidden="true"
            >
              <div className="h-56 w-[480px] rounded-full border-[20px] border-blue-500 blur-3xl will-change-[filter]" />
            </div>
          )}
          {/* Stripes illustration */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform"
            aria-hidden="true"
          >
            <Image className="max-w-none" src="/images/stripes-dark.svg" width={768} height={432} alt="Stripes" />
          </div>
          <div className="px-4 py-12 md:px-12 md:py-20">
            <h2 className="mb-6 border-y text-3xl font-bold text-white dark:text-gray-100 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-700/.7),transparent)1] md:mb-8 md:text-4xl">
              {t('cta.title')}
            </h2>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <Link
                className="btn group mb-4 w-full bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto"
                href="/order"
              >
                <span className="relative inline-flex items-center">
                  {t('nav.formOrder')}{" "}
                  <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                    -&gt;
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
