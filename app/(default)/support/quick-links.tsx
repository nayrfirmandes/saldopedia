"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export default function QuickLinks() {
  const { t } = useLanguage();
  const quickstartIcon = (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  );

  const telegramIcon = (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
    </svg>
  );

  const calculatorIcon = (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
    </svg>
  );

  const cryptoIcon = (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  );

  const pricingIcon = (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
    </svg>
  );

  const quickLinks = [
    {
      title: t("supportPage.quickLinks.links.gettingStarted.title"),
      description: t("supportPage.quickLinks.links.gettingStarted.description"),
      icon: quickstartIcon,
      link: "/documentation/memulai",
    },
    {
      title: t("supportPage.quickLinks.links.calculator.title"),
      description: t("supportPage.quickLinks.links.calculator.description"),
      icon: calculatorIcon,
      link: "/calculator",
    },
    {
      title: t("supportPage.quickLinks.links.cryptoList.title"),
      description: t("supportPage.quickLinks.links.cryptoList.description"),
      icon: cryptoIcon,
      link: "/cryptocurrencies",
    },
    {
      title: t("supportPage.quickLinks.links.pricing.title"),
      description: t("supportPage.quickLinks.links.pricing.description"),
      icon: pricingIcon,
      link: "/pricing",
    },
  ];

  return (
    <section className="relative bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="mx-auto max-w-3xl pb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold dark:text-gray-100">
              {t("supportPage.quickLinks.title")}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t("supportPage.quickLinks.subtitle")}
            </p>
          </div>

          <div className="mx-auto grid max-w-sm gap-4 sm:max-w-none sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="group relative rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500/20">
                  {item.icon}
                </div>
                <h3 className="mb-1.5 text-base font-bold text-gray-900 dark:text-gray-100">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                <div className="mt-3 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  {t("supportPage.quickLinks.viewGuide")}
                  <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
