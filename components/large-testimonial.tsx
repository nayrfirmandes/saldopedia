'use client';

import { memo, useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";

function LargeTestimonial() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section>
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="py-12 md:py-20">
            <div className="space-y-3 text-center">
              <div className="relative inline-flex">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
              <div className="h-8 w-3/4 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-1/2 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="space-y-3 text-center">
            <div className="relative inline-flex">
              <svg
                className="absolute -left-6 -top-2 -z-10"
                width={40}
                height={49}
                viewBox="0 0 40 49"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.7976 -0.000136375L39.9352 23.4746L33.4178 31.7234L13.7686 11.4275L22.7976 -0.000136375ZM9.34947 17.0206L26.4871 40.4953L19.9697 48.7441L0.320491 28.4482L9.34947 17.0206Z"
                  fill="#D1D5DB"
                />
              </svg>
              <Image
                className="rounded-full"
                src="/images/large-testimonial.jpg"
                width={48}
                height={48}
                alt="Large testimonial"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              "{t('largeTestimonial.quote')}{" "}
              <em className="italic text-gray-500">{t('largeTestimonial.quoteHighlight')}</em>
              {t('largeTestimonial.quoteEnd')}"
            </p>
            <div className="text-sm font-medium text-gray-500">
              <span className="text-gray-700 dark:text-gray-300">{t('largeTestimonial.author')}</span>{" "}
              <span className="text-gray-400">/</span>{" "}
              <span className="text-blue-500">
                {t('largeTestimonial.role')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


export default memo(LargeTestimonial);
