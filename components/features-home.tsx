'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { useIsIOS } from "@/lib/use-ios-detection";

interface CommandVariant {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
  line6: string;
}

const COMMAND_VARIANTS: CommandVariant[] = [
  {
    line1: "/beli USDT 50ribu",
    line2: "Proses pesanan...",
    line3: "✓ Dapat 2.94 USDT",
    line4: "Rate: Rp 16.999/USDT",
    line5: "Transfer ke BCA 12345678",
    line6: "✓ USDT dikirim ke wallet!"
  },
  {
    line1: "/jual SOL 1",
    line2: "Proses pesanan...",
    line3: "✓ Dapat Rp 2.850.000",
    line4: "Rate: Rp 2.850.000/SOL",
    line5: "Masukkan nomor rekening",
    line6: "✓ Dana dikirim ke rekening!"
  },
  {
    line1: "/beli BTC 500ribu",
    line2: "Proses pesanan...",
    line3: "✓ Dapat 0.00032 BTC",
    line4: "Rate: Rp 1,57 Milyar/BTC",
    line5: "Transfer ke Mandiri 87654321",
    line6: "✓ BTC dikirim ke wallet!"
  },
  {
    line1: "/jual PayPal $50",
    line2: "Proses pesanan...",
    line3: "✓ Dapat Rp 700.000",
    line4: "Rate: Rp 14.000/USD",
    line5: "Kirim PayPal ke saldopedia@...",
    line6: "✓ Dana dikirim ke rekening!"
  }
];

export default function FeaturesHome() {
  const { t } = useLanguage();
  const isIOS = useIsIOS();
  const [isActive, setIsActive] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVariantIndex((prev) => (prev + 1) % COMMAND_VARIANTS.length);
    }, 15000); // Rotate every 15 seconds

    return () => clearInterval(interval);
  }, []); // Empty dependency array - interval only created once

  const currentVariant = COMMAND_VARIANTS[variantIndex];

  return (
    <section className="relative">
      {!isIOS && (
        <div
          className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <div className="h-80 w-80 rounded-full bg-linear-to-tr from-blue-500 to-gray-900 opacity-40 blur-[160px] will-change-[filter]" />
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-16 text-center md:pb-20">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              {t('featuresHome.title')}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {t('featuresHome.subtitle')}
            </p>
          </div>
          {/* Illustration */}
          <div
            className="group relative mx-auto mb-32 flex w-full max-w-[500px] justify-center md:mb-36"
            
            onClick={() => setIsActive(false)}
          >
            {!isIOS && (
              <div className="absolute bottom-0 -z-10" aria-hidden="true">
                <div className="h-80 w-80 rounded-full bg-blue-500 opacity-70 blur-[160px] will-change-[filter]" />
              </div>
            )}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsActive(!isActive);
              }}
              className={`aspect-video w-full rounded-2xl bg-gray-900 dark:bg-gray-800 px-5 py-3 shadow-xl dark:shadow-gray-800/50 dark:border dark:border-gray-700 transition-all duration-300 cursor-pointer ${isActive ? 'rotate-0' : '-rotate-1 hover:rotate-0'}`}
            >
              <div className="relative mb-8 flex items-center justify-between before:block before:h-[9px] before:w-[41px] before:bg-[length:16px_9px] before:[background-image:radial-gradient(circle_at_4.5px_4.5px,var(--color-gray-600)_4.5px,transparent_0)] after:w-[41px]">
                <span className="text-sm font-medium text-white">
                  Saldopedia.com
                </span>
              </div>
              <div className={`font-mono text-sm text-gray-500 will-change-[filter] transition duration-500 [&_span]:opacity-0 ${isActive ? 'blur-none' : 'blur-xs group-hover:blur-none'}`} key={variantIndex}>
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
                <br />
                <span className="animate-[code-5_10s_infinite] text-gray-200">
                  {currentVariant.line5}
                </span>
                <br />
                <span className="animate-[code-6_10s_infinite]">
                  {currentVariant.line6}
                </span>
              </div>
            </div>
            <div className="pointer-events-none absolute top-16">
              <div className={`pointer-events-none mb-[7%] transition duration-300 ${isActive ? 'translate-y-0 opacity-0' : 'translate-y-2 group-hover:translate-y-0 group-hover:opacity-0'}`}>
                <Image
                  className="-rotate-2"
                  src="/images/features-02-overlay-01.webp"
                  width={500}
                  height={72}
                  alt="Overlay 01"
                />
              </div>
              <div className={`delay-50 pointer-events-none mb-[3.5%] transition duration-300 ${isActive ? 'translate-y-0 opacity-0' : 'translate-y-2 group-hover:translate-y-0 group-hover:opacity-0'}`}>
                <Image src="/images/features-02-overlay-02.webp" width={500} height={72} alt="Overlay 02" />
              </div>
              <div className={`pointer-events-none transition delay-100 duration-300 ${isActive ? 'translate-y-0 opacity-0' : 'translate-y-2 group-hover:translate-y-0 group-hover:opacity-0'}`}>
                <Image
                  className="-rotate-1"
                  src="/images/features-02-overlay-03.png"
                  width={500}
                  height={91}
                  alt="Overlay 03"
                />
              </div>
            </div>
          </div>
          {/* Grid */}
          <div className="grid overflow-hidden border-y [border-image:linear-gradient(to_right,transparent,var(--color-slate-200),transparent)1] lg:grid-cols-3 *:relative *:p-6 *:before:absolute *:before:bg-linear-to-b *:before:from-transparent *:before:via-gray-200 *:before:[block-size:100%] *:before:[inline-size:1px] *:before:[inset-block-start:0] *:before:[inset-inline-start:-1px] md:*:px-10 md:*:py-12">
            <article>
              <h3 className="mb-1.5 flex items-center space-x-2 font-medium">
                <svg
                  className="fill-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                >
                  <path d="m15.447 6.605-.673-.336a6.973 6.973 0 0 0-.761-1.834l.238-.715a.999.999 0 0 0-.242-1.023l-.707-.707a.995.995 0 0 0-1.023-.242l-.715.238a6.96 6.96 0 0 0-1.834-.761L9.394.552A1 1 0 0 0 8.5-.001h-1c-.379 0-.725.214-.895.553l-.336.673a6.973 6.973 0 0 0-1.834.761l-.715-.238a.997.997 0 0 0-1.023.242l-.707.707a1.001 1.001 0 0 0-.242 1.023l.238.715a6.959 6.959 0 0 0-.761 1.834l-.673.336a1 1 0 0 0-.553.895v1c0 .379.214.725.553.895l.673.336c.167.653.425 1.268.761 1.834l-.238.715a.999.999 0 0 0 .242 1.023l.707.707a.997.997 0 0 0 1.023.242l.715-.238a6.959 6.959 0 0 0 1.834.761l.336.673a1 1 0 0 0 .895.553h1c.379 0 .725-.214.895-.553l.336-.673a6.973 6.973 0 0 0 1.834-.761l.715.238a1.001 1.001 0 0 0 1.023-.242l.707-.707c.268-.268.361-.664.242-1.023l-.238-.715a6.959 6.959 0 0 0 .761-1.834l.673-.336A1 1 0 0 0 16 8.5v-1c0-.379-.214-.725-.553-.895ZM8 13a5 5 0 1 1 .001-10.001 5 5 0 0 1 0 10.001Z" />
                </svg>
                <span>{t('featuresHome.feature2.title')}</span>
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {t('featuresHome.feature2.description')}
              </p>
            </article>
            <article>
              <h3 className="mb-1.5 flex items-center space-x-2 font-medium">
                <svg
                  className="fill-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={12}
                >
                  <path d="M2 0a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H2Zm0 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7Zm1-3a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H3Z" />
                </svg>
                <span>{t('featuresHome.feature3.title')}</span>
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {t('featuresHome.feature3.description')}
              </p>
            </article>
            <article>
              <h3 className="mb-1.5 flex items-center space-x-2 font-medium">
                <svg
                  className="fill-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                >
                  <path d="M14.75 2.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm0 13.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM2.5 14.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM1.25 2.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM4 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm4-6a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z" />
                </svg>
                <span>{t('featuresHome.feature4.title')}</span>
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {t('featuresHome.feature4.description')}
              </p>
            </article>
          </div>
        </div>
      </div>
      {/* Gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-b from-transparent to-gray-100 dark:to-gray-800 pointer-events-none -z-10" aria-hidden="true" />
    </section>
  );
}
