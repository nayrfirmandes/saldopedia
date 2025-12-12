"use client";

import React from "react";
import Link from "next/link";
import Accordion from "@/components/accordion";
import { useLanguage } from "@/contexts/language-context";
import PageIllustration from "@/components/page-illustration";

export default function SkrillContent() {
  const { t } = useLanguage();

  const sellRates = [
    { range: t("skrillProductPage.rateTable.sellRates.tier1.range"), rate: t("skrillProductPage.rateTable.sellRates.tier1.rate") },
    { range: t("skrillProductPage.rateTable.sellRates.tier2.range"), rate: t("skrillProductPage.rateTable.sellRates.tier2.rate") },
    { range: t("skrillProductPage.rateTable.sellRates.tier3.range"), rate: t("skrillProductPage.rateTable.sellRates.tier3.rate") },
    { range: t("skrillProductPage.rateTable.sellRates.tier4.range"), rate: t("skrillProductPage.rateTable.sellRates.tier4.rate"), highlight: true },
  ];

  const buyRates = [
    { range: t("skrillProductPage.rateTable.buyRates.tier1.range"), rate: t("skrillProductPage.rateTable.buyRates.tier1.rate"), highlight: true },
    { range: t("skrillProductPage.rateTable.buyRates.tier2.range"), rate: t("skrillProductPage.rateTable.buyRates.tier2.rate") },
    { range: t("skrillProductPage.rateTable.buyRates.tier3.range"), rate: t("skrillProductPage.rateTable.buyRates.tier3.rate") },
    { range: t("skrillProductPage.rateTable.buyRates.tier4.range"), rate: t("skrillProductPage.rateTable.buyRates.tier4.rate") },
  ];

  const faqData = [
    {
      question: t("skrillProductPage.faq.q1.question"),
      answer: t("skrillProductPage.faq.q1.answer"),
    },
    {
      question: t("skrillProductPage.faq.q2.question"),
      answer: t("skrillProductPage.faq.q2.answer"),
    },
    {
      question: t("skrillProductPage.faq.q3.question"),
      answer: t("skrillProductPage.faq.q3.answer"),
    },
    {
      question: t("skrillProductPage.faq.q4.question"),
      answer: t("skrillProductPage.faq.q4.answer"),
    },
    {
      question: t("skrillProductPage.faq.q5.question"),
      answer: t("skrillProductPage.faq.q5.answer"),
    },
  ];

  return (
    <>
      <section className="relative">
        <PageIllustration />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="pb-12 pt-32 md:pb-20 md:pt-40">
            <div className="mx-auto max-w-3xl pb-10 text-center md:pb-12">
              <div className="mb-5 flex justify-center">
                <img 
                  src="/images/skrill-logo.webp" 
                  alt="Skrill Logo" 
                  className="h-14 w-14 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105"
                />
              </div>

              <h1 className="mb-3 py-2 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
                {t("skrillProductPage.hero.title")} <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent dark:from-purple-400 dark:to-fuchsia-500">
                  {t("skrillProductPage.hero.titleHighlight")}
                </span>
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {t("skrillProductPage.hero.subtitle")}
              </p>
            </div>

            <div className="mx-auto mb-8 max-w-4xl">
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 p-8 shadow-xl dark:from-purple-900/20 dark:to-fuchsia-900/20">
                <h2 className="mb-4 text-center text-2xl font-bold dark:text-gray-100">
                  {t("skrillProductPage.rateTable.title")}
                </h2>
                
                <div className="mb-3">
                  <h3 className="mb-2 text-lg font-semibold text-purple-700 dark:text-purple-400">
                    {t("skrillProductPage.rateTable.sellTitle")}
                  </h3>
                  <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-gray-800">
                    <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-700 px-4 py-3 text-center font-semibold text-white">
                        {t("skrillProductPage.rateTable.amountHeader")}
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-purple-700 px-4 py-3 text-center font-semibold text-white">
                        {t("skrillProductPage.rateTable.rateHeader")}
                      </div>
                      {sellRates.map((item, index) => (
                        <React.Fragment key={index}>
                          <div className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-purple-50 dark:bg-gray-800/50'} px-4 py-3 text-center`}>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{item.range}</span>
                          </div>
                          <div className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-purple-50 dark:bg-gray-800/50'} px-4 py-3 text-center`}>
                            <span className={`text-lg font-bold ${item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>
                              {item.rate}
                            </span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold text-purple-700 dark:text-purple-400">
                    {t("skrillProductPage.rateTable.buyTitle")}
                  </h3>
                  <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-gray-800">
                    <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-700 px-4 py-3 text-center font-semibold text-white">
                        {t("skrillProductPage.rateTable.amountHeader")}
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-purple-700 px-4 py-3 text-center font-semibold text-white">
                        {t("skrillProductPage.rateTable.rateHeader")}
                      </div>
                      {buyRates.map((item, index) => (
                        <React.Fragment key={index}>
                          <div className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-purple-50 dark:bg-gray-800/50'} px-4 py-3 text-center`}>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{item.range}</span>
                          </div>
                          <div className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-purple-50 dark:bg-gray-800/50'} px-4 py-3 text-center`}>
                            <span className={`text-lg font-bold ${item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>
                              {item.rate}
                            </span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="inline-flex items-center">
                    <svg className="mr-1 h-4 w-4 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t("skrillProductPage.rateTable.updateNote")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-center text-3xl font-bold dark:text-gray-100">
                {t("skrillProductPage.whyChoose.title")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("skrillProductPage.whyChoose.features.tier.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("skrillProductPage.whyChoose.features.tier.description")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("skrillProductPage.whyChoose.features.fast.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("skrillProductPage.whyChoose.features.fast.description")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("skrillProductPage.whyChoose.features.secure.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("skrillProductPage.whyChoose.features.secure.description")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("skrillProductPage.whyChoose.features.support.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("skrillProductPage.whyChoose.features.support.description")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-center text-3xl font-bold dark:text-gray-100">
                {t("skrillProductPage.services.title")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-500/50">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("skrillProductPage.services.sell.title")}
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    {t("skrillProductPage.services.sell.description")}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("skrillProductPage.services.sell.features.minMax")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("skrillProductPage.services.sell.features.rate")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("skrillProductPage.services.sell.features.payment")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("skrillProductPage.services.sell.features.process")}
                    </div>
                  </div>
                </div>

                <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-500/50">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("skrillProductPage.services.buy.title")}
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    {t("skrillProductPage.services.buy.description")}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("skrillProductPage.services.buy.features.max")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("skrillProductPage.services.buy.features.rate")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("skrillProductPage.services.buy.features.payment")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("skrillProductPage.services.buy.features.process")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-center text-3xl font-bold dark:text-gray-100">
                {t("skrillProductPage.howTo.title")}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 text-xl font-bold text-white">
                    1
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("skrillProductPage.howTo.step1.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("skrillProductPage.howTo.step1.description")}
                  </p>
                </div>
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 text-xl font-bold text-white">
                    2
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("skrillProductPage.howTo.step2.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("skrillProductPage.howTo.step2.description")}
                  </p>
                </div>
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 text-xl font-bold text-white">
                    3
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("skrillProductPage.howTo.step3.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("skrillProductPage.howTo.step3.description")}
                  </p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/order"
                  className="btn group bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%]"
                >
                  <span className="relative inline-flex items-center">
                    {t("skrillProductPage.howTo.ctaButton")}{" "}
                    <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            <div className="mx-auto max-w-3xl">
              <h2 className="mb-4 text-center text-3xl font-bold dark:text-gray-100">
                {t("skrillProductPage.faq.title")}
              </h2>
              <Accordion items={faqData} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
