"use client";

import Link from "next/link";
import Accordion from "@/components/accordion";
import { useLanguage } from "@/contexts/language-context";
import PageIllustration from "@/components/page-illustration";

export default function CryptoContent() {
  const { t } = useLanguage();

  const faqData = [
    {
      question: t("cryptoProductPage.faq.q1.question"),
      answer: t("cryptoProductPage.faq.q1.answer"),
    },
    {
      question: t("cryptoProductPage.faq.q2.question"),
      answer: t("cryptoProductPage.faq.q2.answer"),
    },
    {
      question: t("cryptoProductPage.faq.q3.question"),
      answer: t("cryptoProductPage.faq.q3.answer"),
    },
    {
      question: t("cryptoProductPage.faq.q4.question"),
      answer: t("cryptoProductPage.faq.q4.answer"),
    },
  ];

  return (
    <>
      <section className="relative">
        <PageIllustration />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="pb-12 pt-32 md:pb-20 md:pt-40">
            <div className="mx-auto max-w-3xl pb-10 text-center md:pb-12">
              <div className="mb-5 flex justify-center gap-2.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-md transition-transform duration-200 hover:scale-105">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"/>
                  </svg>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md transition-transform duration-200 hover:scale-105">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M15.927 23.959l-9.823-5.797 9.817 13.839 9.828-13.839-9.828 5.797zM16.073 0l-9.819 16.297 9.819 5.807 9.823-5.801z"/>
                  </svg>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-md transition-transform duration-200 hover:scale-105">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm1.922-18.207v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117z"/>
                  </svg>
                </div>
              </div>

              <h1 className="mb-4 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
                {t("cryptoProductPage.hero.title")} <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent dark:from-orange-400 dark:to-yellow-400">
                  {t("cryptoProductPage.hero.titleHighlight")}
                </span>
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {t("cryptoProductPage.hero.subtitle")}
              </p>
            </div>

            <div className="mx-auto mb-12 max-w-3xl">
              <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-lg dark:from-orange-900/20 dark:to-yellow-900/20">
                <h2 className="mb-4 text-center text-2xl font-bold dark:text-gray-100">
                  {t("cryptoProductPage.rateTable.title")}
                </h2>
                <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-gray-800">
                  <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-3 text-center font-semibold text-white dark:from-orange-600 dark:to-yellow-600">
                      {t("cryptoProductPage.rateTable.buyHeader")}
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-3 text-center font-semibold text-white dark:from-orange-600 dark:to-yellow-600">
                      {t("cryptoProductPage.rateTable.sellHeader")}
                    </div>
                    <div className="bg-white px-4 py-4 text-center dark:bg-gray-800">
                      <div className="mb-1 text-lg font-bold text-orange-600 dark:text-orange-400">
                        {t("cryptoProductPage.rateTable.buyRate")}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("cryptoProductPage.rateTable.buyDesc")}
                      </div>
                    </div>
                    <div className="bg-white px-4 py-4 text-center dark:bg-gray-800">
                      <div className="mb-1 text-lg font-bold text-orange-600 dark:text-orange-400">
                        {t("cryptoProductPage.rateTable.sellRate")}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t("cryptoProductPage.rateTable.sellDesc")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="inline-flex items-center">
                    <svg className="mr-1 h-4 w-4 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t("cryptoProductPage.rateTable.updateNote")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="mb-6 text-center text-3xl font-bold dark:text-gray-100">
                {t("cryptoProductPage.supported.title")}
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-orange-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-500/50">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"/>
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("cryptoProductPage.supported.bitcoin.name")}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {t("cryptoProductPage.supported.bitcoin.description")}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-orange-500 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("cryptoProductPage.supported.bitcoin.minAmount")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-orange-500 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("cryptoProductPage.supported.bitcoin.processTime")}
                    </div>
                  </div>
                </div>

                <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500/50">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M15.927 23.959l-9.823-5.797 9.817 13.839 9.828-13.839-9.828 5.797zM16.073 0l-9.819 16.297 9.819 5.807 9.823-5.801z"/>
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("cryptoProductPage.supported.ethereum.name")}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {t("cryptoProductPage.supported.ethereum.description")}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("cryptoProductPage.supported.ethereum.minAmount")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("cryptoProductPage.supported.ethereum.processTime")}
                    </div>
                  </div>
                </div>

                <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-500/50">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 32 32" fill="currentColor">
                      <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm1.922-18.207v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117z"/>
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("cryptoProductPage.supported.usdt.name")}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {t("cryptoProductPage.supported.usdt.description")}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("cryptoProductPage.supported.usdt.minAmount")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("cryptoProductPage.supported.usdt.processTime")}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                {t("cryptoProductPage.supported.moreCoins")}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="mb-6 text-center text-3xl font-bold dark:text-gray-100">
                {t("cryptoProductPage.whyChoose.title")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("cryptoProductPage.whyChoose.features.fast.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("cryptoProductPage.whyChoose.features.fast.description")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("cryptoProductPage.whyChoose.features.lowMin.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("cryptoProductPage.whyChoose.features.lowMin.description")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("cryptoProductPage.whyChoose.features.secure.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("cryptoProductPage.whyChoose.features.secure.description")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("cryptoProductPage.whyChoose.features.realtime.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("cryptoProductPage.whyChoose.features.realtime.description")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="mb-6 text-center text-3xl font-bold dark:text-gray-100">
                {t("cryptoProductPage.howTo.title")}
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xl font-bold text-white">
                    1
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("cryptoProductPage.howTo.step1.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("cryptoProductPage.howTo.step1.description")}
                  </p>
                </div>
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xl font-bold text-white">
                    2
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("cryptoProductPage.howTo.step2.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("cryptoProductPage.howTo.step2.description")}
                  </p>
                </div>
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xl font-bold text-white">
                    3
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("cryptoProductPage.howTo.step3.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("cryptoProductPage.howTo.step3.description")}
                  </p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/order"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:from-orange-600 hover:to-yellow-600 dark:from-orange-600 dark:to-yellow-600 dark:hover:from-orange-700 dark:hover:to-yellow-700"
                >
                  {t("cryptoProductPage.howTo.ctaButton")}
                </Link>
              </div>
            </div>

            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-center text-3xl font-bold dark:text-gray-100">
                {t("cryptoProductPage.faq.title")}
              </h2>
              <Accordion items={faqData} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
