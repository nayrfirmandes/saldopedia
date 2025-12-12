"use client";

import { useRef, useState, Fragment, useEffect, memo } from "react";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Transition } from "@headlessui/react";
import { useLanguage } from "@/contexts/language-context";
import { LayoutGrid, Bitcoin, CreditCard, Wallet } from "lucide-react";

function BusinessCategories() {
  const { t } = useLanguage();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div suppressHydrationWarning>
          <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
            {/* Buttons */}
            <div className="flex justify-center">
              <TabList className="relative mb-8 inline-flex flex-wrap justify-center rounded-xl bg-white dark:bg-gray-800 p-2 shadow-lg shadow-black/[0.03] dark:shadow-gray-900/20 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] dark:before:[background:linear-gradient(var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] max-[480px]:max-w-[180px]">
                <Tab as={Fragment}>
                  <button
                    className={`ui-focus-visible:outline-none ui-focus-visible:ring ui-focus-visible:ring-blue-300 flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-base font-semibold transition-colors focus-visible:outline-hidden ${selectedTab === 0 ? "bg-gray-800 text-gray-200 dark:bg-blue-500 dark:text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`}
                  >
                    <LayoutGrid
                      className={`${selectedTab === 0 ? "text-gray-400" : "text-gray-500"}`}
                      size={16}
                      strokeWidth={2}
                    />
                    <span>{t('business.all')}</span>
                  </button>
                </Tab>
                <Tab as={Fragment}>
                  <button
                    className={`ui-focus-visible:outline-none ui-focus-visible:ring ui-focus-visible:ring-blue-300 flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-base font-semibold transition-colors focus-visible:outline-hidden ${selectedTab === 1 ? "bg-gray-800 text-gray-200 dark:bg-blue-500 dark:text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`}
                  >
                    <Bitcoin
                      className={`${selectedTab === 1 ? "text-gray-400" : "text-gray-500"}`}
                      size={16}
                      strokeWidth={2}
                    />
                    <span>{t('business.crypto.title')}</span>
                  </button>
                </Tab>
                <Tab as={Fragment}>
                  <button
                    className={`ui-focus-visible:outline-none ui-focus-visible:ring ui-focus-visible:ring-blue-300 flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-base font-semibold transition-colors focus-visible:outline-hidden ${selectedTab === 2 ? "bg-gray-800 text-gray-200 dark:bg-blue-500 dark:text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`}
                  >
                    <CreditCard
                      className={`${selectedTab === 2 ? "text-gray-400" : "text-gray-500"}`}
                      size={16}
                      strokeWidth={2}
                    />
                    <span>{t('business.paypal.title')}</span>
                  </button>
                </Tab>
                <Tab as={Fragment}>
                  <button
                    className={`ui-focus-visible:outline-none ui-focus-visible:ring ui-focus-visible:ring-blue-300 flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-base font-semibold transition-colors focus-visible:outline-hidden ${selectedTab === 3 ? "bg-gray-800 text-gray-200 dark:bg-blue-500 dark:text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"}`}
                  >
                    <Wallet
                      className={`${selectedTab === 3 ? "text-gray-400" : "text-gray-500"}`}
                      size={16}
                      strokeWidth={2}
                    />
                    <span>{t('business.skrill.title')}</span>
                  </button>
                </Tab>
              </TabList>
            </div>

            {/* Tab panels */}
            <TabPanels className="relative flex h-[324px] items-center justify-center">
              {/* Small blue dots */}
              <div className="absolute -z-10">
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
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 164 7)"
                    fillOpacity="0.24"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 164 0)"
                    fillOpacity="0.16"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 164 14)"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 164 25)"
                    fillOpacity="0.64"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 164 32)"
                    fillOpacity="0.24"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 157 7)"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 157 14)"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 157 25)"
                    fillOpacity="0.24"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 150 14)"
                    fillOpacity="0.64"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 150 25)"
                    fillOpacity="0.16"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 157 32)"
                  />
                  <circle
                    cx={1}
                    cy={1}
                    r={1}
                    transform="matrix(-1 0 0 1 164 39)"
                  />
                </svg>
              </div>
              {/* Blue glow */}
              <div className="absolute -z-10">
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
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feGaussianBlur
                        stdDeviation={32}
                        result="effect1_foregroundBlur_2044_9"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>
              {/* Horizontal lines */}
              <div className="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply"></div>
              <div className="absolute inset-x-0 bottom-0 -z-10 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply"></div>
              <div className="absolute inset-x-[200px] top-1/2 -z-10 h-px bg-linear-to-r from-transparent via-blue-500/60 to-transparent mix-blend-multiply"></div>
              <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-[82px] bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply before:absolute before:inset-y-0 before:w-24 before:animate-[line_10s_ease-in-out_infinite_both] before:bg-linear-to-r before:via-blue-500"></div>
              <div className="absolute inset-x-0 top-1/2 -z-10 h-px translate-y-[82px] bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply before:absolute before:inset-y-0 before:w-24 before:animate-[line_10s_ease-in-out_infinite_5s_both] before:bg-linear-to-r before:via-blue-500"></div>
              {/* Diagonal lines */}
              <div className="absolute inset-x-[300px] top-1/2 -z-10 h-px rotate-[20deg] bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply"></div>
              <div className="absolute inset-x-[300px] top-1/2 -z-10 h-px -rotate-[20deg] bg-linear-to-r from-transparent via-gray-200 to-transparent mix-blend-multiply"></div>
              {/* Vertical lines */}
              <div className="absolute inset-y-0 left-1/2 -z-10 w-px -translate-x-[216px] bg-linear-to-b from-gray-200 to-transparent mix-blend-multiply"></div>
              <div className="absolute inset-y-0 left-1/2 -z-10 w-px translate-x-[216px] bg-linear-to-t from-gray-200 to-transparent mix-blend-multiply"></div>
              {/* Logos */}
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

              <div className="relative flex flex-col" ref={tabsRef}>
                <TabPanel as={Fragment} static={true}>
                  <Transition
                    as="div"
                    show={selectedTab === 1}
                    className={`w-full h-full flex items-center justify-center transform transition ease-[cubic-bezier(0.38,0,0.32,1)] data-closed:absolute data-enter:data-closed:scale-90 data-leave:data-closed:scale-125 data-closed:opacity-0 data-enter:duration-700 data-leave:duration-300`}
                    unmount={false}
                    appear={true}
                  >
                    <>
                      <div className="absolute -translate-x-[136px]">
                        <div className="animate-[breath_7s_ease-in-out_3s_infinite_both]">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-02.webp"
                              width={26}
                              height={26}
                              alt="Ethereum"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[136px]">
                        <div className="animate-[breath_7s_ease-in-out_3.5s_infinite_both]">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-03.png"
                              width={26}
                              height={26}
                              alt="Binance"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[216px] -translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_3.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-04.png"
                              width={28}
                              height={28}
                              alt="USDT"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-y-[82px] translate-x-[216px]">
                        <div className="animate-[breath_6s_ease-in-out_1.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-05.png"
                              width={28}
                              height={28}
                              alt="USDC"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[216px] translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_2s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-06.webp"
                              width={28}
                              height={28}
                              alt="PayPal"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[216px] translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_2.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-07.png"
                              width={28}
                              height={28}
                              alt="Skrill"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[292px] opacity-40">
                        <div className="animate-[breath_6s_ease-in-out_2s_infinite_both]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200/60 dark:border-gray-600/40 bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 p-1.5">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-08.webp"
                              width={22}
                              height={22}
                              alt="TON"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[292px] opacity-40">
                        <div className="animate-[breath_6s_ease-in-out_4s_infinite_both]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200/60 dark:border-gray-600/40 bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 p-1.5">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-09.png"
                              width={22}
                              height={22}
                              alt="Cardano"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  </Transition>
                </TabPanel>

                <TabPanel as={Fragment} static={true}>
                  <Transition
                    as="div"
                    show={selectedTab === 2}
                    className={`w-full h-full flex items-center justify-center transform transition ease-[cubic-bezier(0.38,0,0.32,1)] data-closed:absolute data-enter:data-closed:scale-90 data-leave:data-closed:scale-125 data-closed:opacity-0 data-enter:duration-700 data-leave:duration-300`}
                    unmount={false}
                    appear={true}
                  >
                    <>
                      <div className="absolute -translate-x-[136px]">
                        <div className="animate-[breath_7s_ease-in-out_3s_infinite_both]">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-03.png"
                              width={26}
                              height={26}
                              alt="Binance"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[136px]">
                        <div className="animate-[breath_7s_ease-in-out_3.5s_infinite_both]">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-04.png"
                              width={28}
                              height={28}
                              alt="USDT"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[216px] -translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_3.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-05.png"
                              width={28}
                              height={28}
                              alt="USDC"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-y-[82px] translate-x-[216px]">
                        <div className="animate-[breath_6s_ease-in-out_1.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-02.webp"
                              width={26}
                              height={26}
                              alt="Ethereum"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[216px] translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_2s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-07.png"
                              width={28}
                              height={28}
                              alt="Skrill"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[216px] translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_2.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-06.webp"
                              width={28}
                              height={28}
                              alt="PayPal"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[292px] opacity-40">
                        <div className="animate-[breath_6s_ease-in-out_2s_infinite_both]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200/60 dark:border-gray-600/40 bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 p-1.5">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-09.png"
                              width={22}
                              height={22}
                              alt="Cardano"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[292px] opacity-40">
                        <div className="animate-[breath_6s_ease-in-out_4s_infinite_both]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200/60 dark:border-gray-600/40 bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 p-1.5">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-08.webp"
                              width={22}
                              height={22}
                              alt="TON"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  </Transition>
                </TabPanel>
                <TabPanel as={Fragment} static={true}>

                  <Transition
                    as="div"
                    show={selectedTab === 3}
                    className={`w-full h-full flex items-center justify-center transform transition ease-[cubic-bezier(0.38,0,0.32,1)] data-closed:absolute data-enter:data-closed:scale-90 data-leave:data-closed:scale-125 data-closed:opacity-0 data-enter:duration-700 data-leave:duration-300`}
                    unmount={false}
                    appear={true}
                  >
                    <>
                      <div className="absolute -translate-x-[136px]">
                        <div className="animate-[breath_7s_ease-in-out_3s_infinite_both]">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-02.webp"
                              width={26}
                              height={26}
                              alt="Ethereum"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[136px]">
                        <div className="animate-[breath_7s_ease-in-out_3.5s_infinite_both]">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-03.png"
                              width={26}
                              height={26}
                              alt="Binance"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[216px] -translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_3.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-04.png"
                              width={28}
                              height={28}
                              alt="USDT"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-y-[82px] translate-x-[216px]">
                        <div className="animate-[breath_6s_ease-in-out_1.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-05.png"
                              width={28}
                              height={28}
                              alt="USDC"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[216px] translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_2s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-06.webp"
                              width={28}
                              height={28}
                              alt="PayPal"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[216px] translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_2.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-07.png"
                              width={28}
                              height={28}
                              alt="Skrill"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[292px] opacity-40">
                        <div className="animate-[breath_6s_ease-in-out_2s_infinite_both]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200/60 dark:border-gray-600/40 bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 p-1.5">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-08.webp"
                              width={22}
                              height={22}
                              alt="TON"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[292px] opacity-40">
                        <div className="animate-[breath_6s_ease-in-out_4s_infinite_both]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200/60 dark:border-gray-600/40 bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 p-1.5">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-09.png"
                              width={22}
                              height={22}
                              alt="Cardano"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  </Transition>
                </TabPanel>

                <TabPanel as={Fragment} static={true}>
                  <Transition
                    as="div"
                    show={selectedTab === 0}
                    className={`w-full h-full flex items-center justify-center transform transition ease-[cubic-bezier(0.38,0,0.32,1)] data-closed:absolute data-enter:data-closed:scale-90 data-leave:data-closed:scale-125 data-closed:opacity-0 data-enter:duration-700 data-leave:duration-300`}
                    unmount={false}
                    appear={true}
                  >
                    <>
                      <div className="absolute -translate-x-[136px]">
                        <div className="animate-[breath_7s_ease-in-out_3s_infinite_both]">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-03.png"
                              width={26}
                              height={26}
                              alt="Binance"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[136px]">
                        <div className="animate-[breath_7s_ease-in-out_3.5s_infinite_both]">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-04.png"
                              width={28}
                              height={28}
                              alt="USDT"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[216px] -translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_3.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-05.png"
                              width={28}
                              height={28}
                              alt="USDC"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-y-[82px] translate-x-[216px]">
                        <div className="animate-[breath_6s_ease-in-out_1.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-02.webp"
                              width={26}
                              height={26}
                              alt="Ethereum"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[216px] translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_2s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-07.png"
                              width={28}
                              height={28}
                              alt="Skrill"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[216px] translate-y-[82px]">
                        <div className="animate-[breath_6s_ease-in-out_2.5s_infinite_both]">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg shadow-black/[0.03] dark:shadow-black/40 before:absolute before:inset-0 before:m-[8.334%] before:rounded-[inherit] before:border before:border-gray-700/5 dark:before:border-gray-600/20 before:bg-gray-200/60 dark:before:bg-gray-700/40 before:[mask-image:linear-gradient(to_bottom,black,transparent)] p-2">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-06.webp"
                              width={28}
                              height={28}
                              alt="PayPal"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -translate-x-[292px] opacity-40">
                        <div className="animate-[breath_6s_ease-in-out_2s_infinite_both]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200/60 dark:border-gray-600/40 bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 p-1.5">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-09.png"
                              width={22}
                              height={22}
                              alt="Cardano"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute translate-x-[292px] opacity-40">
                        <div className="animate-[breath_6s_ease-in-out_4s_infinite_both]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200/60 dark:border-gray-600/40 bg-white dark:bg-gray-800 shadow-lg dark:shadow-black/40 p-1.5">
                            <Image
                              className="relative rounded-full"
                              src="/images/logo-08.webp"
                              width={22}
                              height={22}
                              alt="TON"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  </Transition>
                </TabPanel>
              </div>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </section>
  );
}


export default memo(BusinessCategories);
