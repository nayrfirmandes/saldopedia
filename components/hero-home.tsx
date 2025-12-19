'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import PageIllustration from "@/components/page-illustration";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";

interface HeroCommandVariant {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
  line6: string;
}

const HERO_COMMAND_VARIANTS: HeroCommandVariant[] = [
  {
    line1: "/beli USDT 100ribu",
    line2: "Proses pesanan...",
    line3: "✓ Dapat 5.88 USDT",
    line4: "Rate: Rp 16.999/USDT",
    line5: "Transfer ke BCA 123-456-789",
    line6: "✓ USDT terkirim ke wallet!"
  },
  {
    line1: "/jual SOL 0.5",
    line2: "Proses pesanan...",
    line3: "✓ Dapat Rp 1.425.000",
    line4: "Rate: Rp 2.850.000/SOL",
    line5: "Masukkan rekening tujuan",
    line6: "✓ Dana terkirim!"
  },
  {
    line1: "/beli PayPal $100",
    line2: "Proses pesanan...",
    line3: "✓ Total: Rp 1.729.900",
    line4: "Rate: Rp 17.299/USD",
    line5: "Transfer ke Mandiri 987-654",
    line6: "✓ PayPal terisi!"
  },
  {
    line1: "/jual Skrill $200",
    line2: "Proses pesanan...",
    line3: "✓ Dapat Rp 2.800.000",
    line4: "Rate: Rp 14.000/USD",
    line5: "Kirim Skrill ke saldopedia@...",
    line6: "✓ Dana dikirim ke rekening!"
  }
];

export default function HeroHome() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [variantIndex, setVariantIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVariantIndex((prev) => (prev + 1) % HERO_COMMAND_VARIANTS.length);
    }, 15000); // Rotate every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const currentVariant = HERO_COMMAND_VARIANTS[variantIndex];
  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-16">
            <div
              className="mb-6 border-y [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1]"
            >
              <div className="-mx-0.5 flex justify-center -space-x-3">
                <Image
                  className="box-content rounded-full border border-gray-100 dark:border-gray-700"
                  src="/images/avatar-01.jpg"
                  width={32}
                  height={32}
                  alt="Avatar 01"
                />
                <Image
                  className="box-content rounded-full border border-gray-100 dark:border-gray-700"
                  src="/images/avatar-02.jpg"
                  width={32}
                  height={32}
                  alt="Avatar 02"
                />
                <Image
                  className="box-content rounded-full border border-gray-100 dark:border-gray-700"
                  src="/images/avatar-03.jpg"
                  width={32}
                  height={32}
                  alt="Avatar 03"
                />
                <Image
                  className="box-content rounded-full border border-gray-100 dark:border-gray-700"
                  src="/images/avatar-04.jpg"
                  width={32}
                  height={32}
                  alt="Avatar 04"
                />
                <Image
                  className="box-content rounded-full border border-gray-100 dark:border-gray-700"
                  src="/images/avatar-05.jpg"
                  width={32}
                  height={32}
                  alt="Avatar 05"
                />
                <Image
                  className="box-content rounded-full border border-gray-100 dark:border-gray-700"
                  src="/images/avatar-06.jpg"
                  width={32}
                  height={32}
                  alt="Avatar 06"
                />
              </div>
            </div>
            <h1 className="mb-4 py-2 border-y text-5xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-6xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
              {t('hero.title')}
            </h1>
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-6 text-lg text-gray-700 dark:text-gray-300"
                
                
              >
                {t('hero.subtitle')}
              </p>
              <div className="relative before:absolute before:inset-0 before:border-y before:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1]">
                <div className="relative mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                  <Link
                    className="btn group w-full bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] sm:w-auto"
                    href={user ? "/order" : "/register"}
                  >
                    <span className="relative inline-flex items-center">
                      {user ? t('nav.formOrder') : t('hero.ctaRegister')}{" "}
                      <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* Hero image */}
          <div
            className="mx-auto max-w-3xl md:max-w-2xl"
            
            
          >
            <div className="relative aspect-video md:aspect-auto rounded-2xl bg-gray-900 px-5 py-3 md:px-6 md:py-5 shadow-xl before:pointer-events-none before:absolute before:-inset-5 before:border-y before:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] after:absolute after:-inset-5 after:-z-10 after:border-x after:[border-image:linear-gradient(to_bottom,transparent,--theme(--color-slate-300/.8),transparent)1] dark:bg-gray-800 dark:shadow-gray-800/50 dark:before:border-0 dark:after:border-0 dark:border dark:border-gray-700">
              <div className="relative mb-8 md:mb-5 flex items-center justify-between before:block before:h-[9px] before:w-[41px] before:bg-[length:16px_9px] before:[background-image:radial-gradient(circle_at_4.5px_4.5px,var(--color-gray-600)_4.5px,transparent_0)] after:w-[41px]">
                <span className="text-sm font-medium text-white">
                  Saldopedia.com
                </span>
              </div>
              <div className="font-mono text-sm md:text-base text-gray-500 md:leading-relaxed [&_span]:opacity-0" key={variantIndex}>
                <span className="animate-[code-1_10s_infinite] text-gray-200">
                  {currentVariant.line1}
                </span>{" "}
                <span className="animate-[code-2_10s_infinite]">
                  {currentVariant.line2}
                </span>
                <br />
                <span className="animate-[code-3_10s_infinite]">
                  {currentVariant.line3}
                </span>{" "}
                <span className="animate-[code-4_10s_infinite]">
                  {currentVariant.line4}
                </span>
                <br />
                <br className="md:hidden" />
                <span className="animate-[code-5_10s_infinite] text-gray-200">
                  {currentVariant.line5}
                </span>
                <br />
                <span className="animate-[code-6_10s_infinite]">
                  {currentVariant.line6}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
