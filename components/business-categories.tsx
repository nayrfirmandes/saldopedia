"use client";

import { useRef, useState, useEffect, Fragment } from "react";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useLanguage } from "@/contexts/language-context";
import { LayoutGrid, Bitcoin, CreditCard, Wallet, LucideIcon } from "lucide-react";

interface LogoConfig {
  src: string;
  alt: string;
  delay: number;
}

interface TabConfig {
  icon: LucideIcon;
  labelKey: string;
}

const TABS: TabConfig[] = [
  { icon: LayoutGrid, labelKey: "business.all" },
  { icon: Bitcoin, labelKey: "business.crypto.title" },
  { icon: CreditCard, labelKey: "business.paypal.title" },
  { icon: Wallet, labelKey: "business.skrill.title" },
];

const LOGOS_ALL: LogoConfig[] = [
  { src: "/images/logo-02.webp", alt: "Ethereum", delay: 0 },
  { src: "/images/logo-03.png", alt: "Binance", delay: 50 },
  { src: "/images/logo-04.png", alt: "USDT", delay: 100 },
  { src: "/images/logo-05.png", alt: "USDC", delay: 150 },
  { src: "/images/logo-06.webp", alt: "PayPal", delay: 200 },
  { src: "/images/logo-07.png", alt: "Skrill", delay: 250 },
];

const LOGOS_CRYPTO: LogoConfig[] = [
  { src: "/images/logo-02.webp", alt: "Ethereum", delay: 0 },
  { src: "/images/logo-03.png", alt: "Binance", delay: 50 },
  { src: "/images/logo-04.png", alt: "USDT", delay: 100 },
  { src: "/images/logo-05.png", alt: "USDC", delay: 150 },
  { src: "/images/logo-08.webp", alt: "TON", delay: 200 },
  { src: "/images/logo-09.png", alt: "Cardano", delay: 250 },
];

const LOGOS_PAYPAL: LogoConfig[] = [
  { src: "/images/logo-06.webp", alt: "PayPal", delay: 0 },
  { src: "/images/logo-02.webp", alt: "Ethereum", delay: 50 },
  { src: "/images/logo-03.png", alt: "Binance", delay: 100 },
  { src: "/images/logo-04.png", alt: "USDT", delay: 150 },
  { src: "/images/logo-05.png", alt: "USDC", delay: 200 },
  { src: "/images/logo-07.png", alt: "Skrill", delay: 250 },
];

const LOGOS_SKRILL: LogoConfig[] = [
  { src: "/images/logo-07.png", alt: "Skrill", delay: 0 },
  { src: "/images/logo-02.webp", alt: "Ethereum", delay: 50 },
  { src: "/images/logo-03.png", alt: "Binance", delay: 100 },
  { src: "/images/logo-04.png", alt: "USDT", delay: 150 },
  { src: "/images/logo-05.png", alt: "USDC", delay: 200 },
  { src: "/images/logo-06.webp", alt: "PayPal", delay: 250 },
];

const TAB_LOGOS: LogoConfig[][] = [LOGOS_ALL, LOGOS_CRYPTO, LOGOS_PAYPAL, LOGOS_SKRILL];

function LogoItem({ src, alt, delay, isVisible, index }: LogoConfig & { isVisible: boolean; index: number }) {
  const angles = [0, 60, 120, 180, 240, 300];
  const angle = angles[index] || 0;
  const angleRad = (angle * Math.PI) / 180;

  return (
    <div
      className="absolute transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? `translate(calc(${Math.cos(angleRad)} * var(--orbit-radius)), calc(${Math.sin(angleRad)} * var(--orbit-radius)))` 
          : "scale(0.8)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-white dark:bg-gray-800/90 backdrop-blur-sm shadow-lg shadow-black/[0.08] dark:shadow-black/30 ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl">
        <Image
          className="relative rounded-full"
          src={src}
          width={24}
          height={24}
          alt={alt}
        />
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, isActive }: { icon: LucideIcon; label: string; isActive: boolean }) {
  return (
    <Tab as={Fragment}>
      <button
        className={`flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg px-2.5 sm:px-3.5 text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isActive
            ? "bg-gray-900 text-white dark:bg-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700/50"
        }`}
      >
        <Icon size={14} strokeWidth={2} className={isActive ? "text-gray-400" : ""} />
        <span className="hidden xs:inline">{label}</span>
      </button>
    </Tab>
  );
}

function CenterLogo({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className="absolute z-10 transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.9)",
      }}
    >
      <div className="relative">
        <div className="absolute -inset-2 sm:-inset-3 rounded-full border border-blue-500/20 animate-pulse" />
        <div className="absolute -inset-4 sm:-inset-6 rounded-full border border-blue-500/10" />
        <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-xl shadow-blue-500/10 ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05]">
          <Image
            className="relative rounded-full"
            src="/images/logo-01.webp"
            width={28}
            height={28}
            alt="Bitcoin"
            priority
          />
        </div>
      </div>
    </div>
  );
}

function OrbitRing({ isVisible, size, delayMs }: { isVisible: boolean; size: string; delayMs: number }) {
  return (
    <div
      className={`absolute ${size} rounded-full border border-gray-200/50 dark:border-gray-700/30 transition-all duration-1000 ease-out`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.8)",
        transitionDelay: `${delayMs}ms`,
      }}
    />
  );
}

function BusinessCategories() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tabAnimating, setTabAnimating] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleTabChange = (index: number) => {
    setTabAnimating(true);
    setTimeout(() => {
      setSelectedTab(index);
      setTimeout(() => setTabAnimating(false), 50);
    }, 150);
  };

  return (
    <section ref={containerRef} className="relative overflow-hidden py-4 sm:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div suppressHydrationWarning>
          <TabGroup selectedIndex={selectedTab} onChange={handleTabChange}>
            <div className="flex justify-center">
              <TabList
                className="relative mb-6 sm:mb-8 inline-flex flex-wrap justify-center gap-0.5 sm:gap-1 rounded-xl bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 sm:p-1.5 ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] transition-all duration-500"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(-10px)",
                }}
              >
                {TABS.map((tab, index) => (
                  <TabButton
                    key={tab.labelKey}
                    icon={tab.icon}
                    label={t(tab.labelKey)}
                    isActive={selectedTab === index}
                  />
                ))}
              </TabList>
            </div>

            <TabPanels 
              className="relative flex items-center justify-center"
              style={{ 
                height: "clamp(220px, 40vw, 320px)",
                ["--orbit-radius" as string]: "clamp(70px, 18vw, 130px)" 
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <OrbitRing isVisible={isVisible} size="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48" delayMs={100} />
                <OrbitRing isVisible={isVisible} size="w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80" delayMs={200} />
                <OrbitRing isVisible={isVisible} size="w-72 h-72 sm:w-80 sm:h-80 md:w-[26rem] md:h-[26rem]" delayMs={300} />
              </div>

              <div 
                className="absolute w-full h-px bg-gradient-to-r from-transparent via-gray-300/40 dark:via-gray-600/25 to-transparent transition-opacity duration-700"
                style={{ opacity: isVisible ? 1 : 0, transitionDelay: "400ms" }}
              />
              <div 
                className="absolute w-px h-24 sm:h-32 bg-gradient-to-b from-transparent via-gray-300/40 dark:via-gray-600/25 to-transparent transition-opacity duration-700"
                style={{ opacity: isVisible ? 1 : 0, transitionDelay: "450ms" }}
              />

              <CenterLogo isVisible={isVisible} />

              <div className="relative flex items-center justify-center">
                {TAB_LOGOS.map((logos, tabIndex) => (
                  <TabPanel key={tabIndex} as={Fragment} static>
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                        selectedTab === tabIndex && !tabAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                    >
                      {logos.map((logo, logoIndex) => (
                        <LogoItem
                          key={`${tabIndex}-${logoIndex}`}
                          {...logo}
                          index={logoIndex}
                          isVisible={isVisible && selectedTab === tabIndex && !tabAnimating}
                        />
                      ))}
                    </div>
                  </TabPanel>
                ))}
              </div>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </section>
  );
}

export default BusinessCategories;
