"use client";

import { useRef, useState, Fragment } from "react";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Transition } from "@headlessui/react";
import { useLanguage } from "@/contexts/language-context";
import { LayoutGrid, Bitcoin, CreditCard, Wallet, LucideIcon } from "lucide-react";

type LogoSize = "sm" | "md" | "lg";

interface LogoItemProps {
  src: string;
  alt: string;
  size: LogoSize;
  position: string;
  animationDelay: string;
  variant?: "default" | "faded";
}

interface TabConfig {
  icon: LucideIcon;
  labelKey: string;
}

interface LogoConfig {
  src: string;
  alt: string;
  size: LogoSize;
  position: string;
  animationDelay: string;
  variant?: "default" | "faded";
}

const SIZE_CONFIG: Record<LogoSize, { container: string; image: number }> = {
  sm: { container: "h-12 w-12", image: 22 },
  md: { container: "h-16 w-16", image: 26 },
  lg: { container: "h-20 w-20", image: 28 },
};

const LOGO_CONTAINER_BASE = "flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg";
const LOGO_CONTAINER_DEFAULT = `${LOGO_CONTAINER_BASE} shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2`;
const LOGO_CONTAINER_FADED = `${LOGO_CONTAINER_BASE} border border-gray-200/60 dark:border-gray-600/40 dark:shadow-black/40 p-1.5`;

const TAB_BUTTON_BASE = "ui-focus-visible:outline-none ui-focus-visible:ring ui-focus-visible:ring-blue-300 flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-base font-semibold transition-colors focus-visible:outline-hidden";
const TAB_BUTTON_ACTIVE = "bg-gray-800 text-gray-200 dark:bg-blue-500 dark:text-white";
const TAB_BUTTON_INACTIVE = "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50";

const TABS: TabConfig[] = [
  { icon: LayoutGrid, labelKey: "business.all" },
  { icon: Bitcoin, labelKey: "business.crypto.title" },
  { icon: CreditCard, labelKey: "business.paypal.title" },
  { icon: Wallet, labelKey: "business.skrill.title" },
];

const LOGOS_CRYPTO: LogoConfig[] = [
  { src: "/images/logo-02.webp", alt: "Ethereum", size: "md", position: "-translate-x-[136px]", animationDelay: "3s" },
  { src: "/images/logo-03.png", alt: "Binance", size: "md", position: "translate-x-[136px]", animationDelay: "3.5s" },
  { src: "/images/logo-04.png", alt: "USDT", size: "lg", position: "-translate-x-[216px] -translate-y-[82px]", animationDelay: "3.5s" },
  { src: "/images/logo-05.png", alt: "USDC", size: "lg", position: "-translate-y-[82px] translate-x-[216px]", animationDelay: "1.5s" },
  { src: "/images/logo-06.webp", alt: "PayPal", size: "lg", position: "translate-x-[216px] translate-y-[82px]", animationDelay: "2s" },
  { src: "/images/logo-07.png", alt: "Skrill", size: "lg", position: "-translate-x-[216px] translate-y-[82px]", animationDelay: "2.5s" },
  { src: "/images/logo-08.webp", alt: "TON", size: "sm", position: "-translate-x-[292px]", animationDelay: "2s", variant: "faded" },
  { src: "/images/logo-09.png", alt: "Cardano", size: "sm", position: "translate-x-[292px]", animationDelay: "4s", variant: "faded" },
];

const LOGOS_PAYPAL: LogoConfig[] = [
  { src: "/images/logo-03.png", alt: "Binance", size: "md", position: "-translate-x-[136px]", animationDelay: "3s" },
  { src: "/images/logo-04.png", alt: "USDT", size: "md", position: "translate-x-[136px]", animationDelay: "3.5s" },
  { src: "/images/logo-05.png", alt: "USDC", size: "lg", position: "-translate-x-[216px] -translate-y-[82px]", animationDelay: "3.5s" },
  { src: "/images/logo-02.webp", alt: "Ethereum", size: "lg", position: "-translate-y-[82px] translate-x-[216px]", animationDelay: "1.5s" },
  { src: "/images/logo-07.png", alt: "Skrill", size: "lg", position: "translate-x-[216px] translate-y-[82px]", animationDelay: "2s" },
  { src: "/images/logo-06.webp", alt: "PayPal", size: "lg", position: "-translate-x-[216px] translate-y-[82px]", animationDelay: "2.5s" },
  { src: "/images/logo-09.png", alt: "Cardano", size: "sm", position: "-translate-x-[292px]", animationDelay: "2s", variant: "faded" },
  { src: "/images/logo-08.webp", alt: "TON", size: "sm", position: "translate-x-[292px]", animationDelay: "4s", variant: "faded" },
];

const LOGOS_SKRILL: LogoConfig[] = [
  { src: "/images/logo-02.webp", alt: "Ethereum", size: "md", position: "-translate-x-[136px]", animationDelay: "3s" },
  { src: "/images/logo-03.png", alt: "Binance", size: "md", position: "translate-x-[136px]", animationDelay: "3.5s" },
  { src: "/images/logo-04.png", alt: "USDT", size: "lg", position: "-translate-x-[216px] -translate-y-[82px]", animationDelay: "3.5s" },
  { src: "/images/logo-05.png", alt: "USDC", size: "lg", position: "-translate-y-[82px] translate-x-[216px]", animationDelay: "1.5s" },
  { src: "/images/logo-06.webp", alt: "PayPal", size: "lg", position: "translate-x-[216px] translate-y-[82px]", animationDelay: "2s" },
  { src: "/images/logo-07.png", alt: "Skrill", size: "lg", position: "-translate-x-[216px] translate-y-[82px]", animationDelay: "2.5s" },
  { src: "/images/logo-08.webp", alt: "TON", size: "sm", position: "-translate-x-[292px]", animationDelay: "2s", variant: "faded" },
  { src: "/images/logo-09.png", alt: "Cardano", size: "sm", position: "translate-x-[292px]", animationDelay: "4s", variant: "faded" },
];

const LOGOS_ALL: LogoConfig[] = [
  { src: "/images/logo-03.png", alt: "Binance", size: "md", position: "-translate-x-[136px]", animationDelay: "3s" },
  { src: "/images/logo-04.png", alt: "USDT", size: "md", position: "translate-x-[136px]", animationDelay: "3.5s" },
  { src: "/images/logo-05.png", alt: "USDC", size: "lg", position: "-translate-x-[216px] -translate-y-[82px]", animationDelay: "3.5s" },
  { src: "/images/logo-02.webp", alt: "Ethereum", size: "lg", position: "-translate-y-[82px] translate-x-[216px]", animationDelay: "1.5s" },
  { src: "/images/logo-07.png", alt: "Skrill", size: "lg", position: "translate-x-[216px] translate-y-[82px]", animationDelay: "2s" },
  { src: "/images/logo-06.webp", alt: "PayPal", size: "lg", position: "-translate-x-[216px] translate-y-[82px]", animationDelay: "2.5s" },
  { src: "/images/logo-09.png", alt: "Cardano", size: "sm", position: "-translate-x-[292px]", animationDelay: "2s", variant: "faded" },
  { src: "/images/logo-08.webp", alt: "TON", size: "sm", position: "translate-x-[292px]", animationDelay: "4s", variant: "faded" },
];

const TAB_LOGOS: LogoConfig[][] = [LOGOS_ALL, LOGOS_CRYPTO, LOGOS_PAYPAL, LOGOS_SKRILL];

function LogoItem({ src, alt, size, position, animationDelay, variant = "default" }: LogoItemProps) {
  const { container, image } = SIZE_CONFIG[size];
  const containerClass = variant === "faded" ? LOGO_CONTAINER_FADED : LOGO_CONTAINER_DEFAULT;
  const duration = size === "md" ? "7s" : "6s";

  return (
    <div className={`absolute ${position} ${variant === "faded" ? "opacity-40" : ""}`}>
      <div className={`animate-[breath_${duration}_ease-in-out_${animationDelay}_infinite_both]`}>
        <div className={`${container} ${containerClass}`}>
          <Image
            className="relative rounded-full"
            src={src}
            width={image}
            height={image}
            alt={alt}
          />
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, isActive }: { icon: LucideIcon; label: string; isActive: boolean }) {
  return (
    <Tab as={Fragment}>
      <button className={`${TAB_BUTTON_BASE} ${isActive ? TAB_BUTTON_ACTIVE : TAB_BUTTON_INACTIVE}`}>
        <Icon
          className={isActive ? "text-gray-400" : "text-gray-500"}
          size={16}
          strokeWidth={2}
        />
        <span>{label}</span>
      </button>
    </Tab>
  );
}

function DecorativeDots() {
  return (
    <svg
      className="fill-blue-500"
      xmlns="http://www.w3.org/2000/svg"
      width={164}
      height={41}
      viewBox="0 0 164 41"
      fill="none"
    >
      <circle cx={1} cy={8} r={1} fillOpacity="0.24" />
      <circle cx={1} cy={1} r={1} fillOpacity="0.16" />
      <circle cx={1} cy={15} r={1} />
      <circle cx={1} cy={26} r={1} fillOpacity="0.64" />
      <circle cx={1} cy={33} r={1} fillOpacity="0.24" />
      <circle cx={8} cy={8} r={1} />
      <circle cx={8} cy={15} r={1} />
      <circle cx={8} cy={26} r={1} fillOpacity="0.24" />
      <circle cx={15} cy={15} r={1} fillOpacity="0.64" />
      <circle cx={15} cy={26} r={1} fillOpacity="0.16" />
      <circle cx={8} cy={33} r={1} />
      <circle cx={1} cy={40} r={1} />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 164 7)" fillOpacity="0.24" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 164 0)" fillOpacity="0.16" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 164 14)" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 164 25)" fillOpacity="0.64" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 164 32)" fillOpacity="0.24" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 157 7)" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 157 14)" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 157 25)" fillOpacity="0.24" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 150 14)" fillOpacity="0.64" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 150 25)" fillOpacity="0.16" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 157 32)" />
      <circle cx={1} cy={1} r={1} transform="matrix(-1 0 0 1 164 39)" />
    </svg>
  );
}

function DecorativeGlow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={432}
      height={160}
      viewBox="0 0 432 160"
      fill="none"
    >
      <g opacity="0.6" filter="url(#filter0_f_2044_9)">
        <path
          className="fill-blue-500"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M80 112C62.3269 112 48 97.6731 48 80C48 62.3269 62.3269 48 80 48C97.6731 48 171 62.3269 171 80C171 97.6731 97.6731 112 80 112ZM352 112C369.673 112 384 97.6731 384 80C384 62.3269 369.673 48 352 48C334.327 48 261 62.3269 261 80C261 97.6731 334.327 112 352 112Z"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_2044_9"
          x={0}
          y={0}
          width={432}
          height={160}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation={32} result="effect1_foregroundBlur_2044_9" />
        </filter>
      </defs>
    </svg>
  );
}

function CenterLogo() {
  return (
    <div className="absolute before:absolute before:-inset-3 before:animate-[spin_3s_linear_infinite] before:rounded-full before:border before:border-transparent before:[background:conic-gradient(from_180deg,transparent,var(--color-blue-500))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
      <div className="animate-[breath_8s_ease-in-out_infinite_both]">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
          <Image
            className="relative rounded-full"
            src="/images/logo-01.webp"
            width={36}
            height={36}
            alt="Bitcoin"
          />
        </div>
      </div>
    </div>
  );
}

function DecorativeLines() {
  return (
    <>
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply" />
      <div className="absolute inset-x-[200px] top-1/2 -z-10 h-px bg-linear-to-r from-transparent via-blue-500/60 to-transparent mix-blend-multiply" />
      <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-[82px] bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply before:absolute before:inset-y-0 before:w-24 before:animate-[line_10s_ease-in-out_infinite_both] before:bg-linear-to-r before:via-blue-500" />
      <div className="absolute inset-x-0 top-1/2 -z-10 h-px translate-y-[82px] bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply before:absolute before:inset-y-0 before:w-24 before:animate-[line_10s_ease-in-out_infinite_5s_both] before:bg-linear-to-r before:via-blue-500" />
      <div className="absolute inset-x-[300px] top-1/2 -z-10 h-px rotate-[20deg] bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply" />
      <div className="absolute inset-x-[300px] top-1/2 -z-10 h-px -rotate-[20deg] bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply" />
      <div className="absolute inset-y-0 left-1/2 -z-10 w-px -translate-x-[216px] bg-linear-to-b from-gray-200 to-transparent mix-blend-multiply" />
      <div className="absolute inset-y-0 left-1/2 -z-10 w-px translate-x-[216px] bg-linear-to-t from-gray-200 to-transparent mix-blend-multiply" />
    </>
  );
}

const TRANSITION_CLASS = "w-full h-full flex items-center justify-center transform transition ease-[cubic-bezier(0.38,0,0.32,1)] data-closed:absolute data-enter:data-closed:scale-90 data-leave:data-closed:scale-125 data-closed:opacity-0 data-enter:duration-700 data-leave:duration-300";

function BusinessCategories() {
  const { t } = useLanguage();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div suppressHydrationWarning>
          <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
            <div className="flex justify-center">
              <TabList className="relative mb-8 inline-flex flex-wrap justify-center rounded-xl bg-white dark:bg-gray-800 p-2 shadow-lg shadow-black/[0.03] dark:shadow-gray-900/20 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] dark:before:[background:linear-gradient(var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] max-[480px]:max-w-[180px]">
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

            <TabPanels className="relative flex h-[324px] items-center justify-center">
              <div className="absolute -z-10">
                <DecorativeDots />
              </div>
              <div className="absolute -z-10">
                <DecorativeGlow />
              </div>
              <DecorativeLines />
              <CenterLogo />

              <div className="relative flex flex-col" ref={tabsRef}>
                {TAB_LOGOS.map((logos, tabIndex) => (
                  <TabPanel key={tabIndex} as={Fragment} static={true}>
                    <Transition
                      as="div"
                      show={selectedTab === tabIndex}
                      className={TRANSITION_CLASS}
                      unmount={false}
                      appear={true}
                    >
                      <>
                        {logos.map((logo, logoIndex) => (
                          <LogoItem key={`${tabIndex}-${logoIndex}`} {...logo} />
                        ))}
                      </>
                    </Transition>
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
