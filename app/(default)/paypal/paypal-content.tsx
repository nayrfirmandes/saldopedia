"use client";

import React from "react";
import Link from "next/link";
import Accordion from "@/components/accordion";
import { useLanguage } from "@/contexts/language-context";
import PageIllustration from "@/components/page-illustration";

export default function PayPalContent() {
  const { t } = useLanguage();

  const sellRates = [
    { range: t("paypalProductPage.rateTable.sellRates.tier1.range"), rate: t("paypalProductPage.rateTable.sellRates.tier1.rate") },
    { range: t("paypalProductPage.rateTable.sellRates.tier2.range"), rate: t("paypalProductPage.rateTable.sellRates.tier2.rate") },
    { range: t("paypalProductPage.rateTable.sellRates.tier3.range"), rate: t("paypalProductPage.rateTable.sellRates.tier3.rate") },
    { range: t("paypalProductPage.rateTable.sellRates.tier4.range"), rate: t("paypalProductPage.rateTable.sellRates.tier4.rate"), highlight: true },
  ];

  const buyRates = [
    { range: t("paypalProductPage.rateTable.buyRates.tier1.range"), rate: t("paypalProductPage.rateTable.buyRates.tier1.rate"), highlight: true },
    { range: t("paypalProductPage.rateTable.buyRates.tier2.range"), rate: t("paypalProductPage.rateTable.buyRates.tier2.rate") },
    { range: t("paypalProductPage.rateTable.buyRates.tier3.range"), rate: t("paypalProductPage.rateTable.buyRates.tier3.rate") },
    { range: t("paypalProductPage.rateTable.buyRates.tier4.range"), rate: t("paypalProductPage.rateTable.buyRates.tier4.rate") },
  ];

  const faqData = [
    {
      question: t("paypalProductPage.faq.q1.question"),
      answer: t("paypalProductPage.faq.q1.answer"),
    },
    {
      question: t("paypalProductPage.faq.q2.question"),
      answer: t("paypalProductPage.faq.q2.answer"),
    },
    {
      question: t("paypalProductPage.faq.q3.question"),
      answer: t("paypalProductPage.faq.q3.answer"),
    },
    {
      question: t("paypalProductPage.faq.q4.question"),
      answer: t("paypalProductPage.faq.q4.answer"),
    },
    {
      question: t("paypalProductPage.faq.q5.question"),
      answer: t("paypalProductPage.faq.q5.answer"),
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
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg transition-transform duration-200 hover:scale-105">
                  <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852.072-.454.462-.788.922-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.72-4.533z"/>
                  </svg>
                </div>
              </div>

              <h1 className="mb-3 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
                {t("paypalProductPage.hero.title")} <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
                  {t("paypalProductPage.hero.titleHighlight")}
                </span>
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {t("paypalProductPage.hero.subtitle")}
              </p>
            </div>

            <div className="mx-auto mb-8 max-w-4xl">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-xl dark:from-blue-900/20 dark:to-indigo-900/20">
                <h2 className="mb-4 text-center text-2xl font-bold dark:text-gray-100">
                  {t("paypalProductPage.rateTable.title")}
                </h2>
                
                <div className="mb-3">
                  <h3 className="mb-2 text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {t("paypalProductPage.rateTable.sellTitle")}
                  </h3>
                  <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-gray-800">
                    <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-center font-semibold text-white">
                        {t("paypalProductPage.rateTable.amountHeader")}
                      </div>
                      <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-center font-semibold text-white">
                        {t("paypalProductPage.rateTable.rateHeader")}
                      </div>
                      {sellRates.map((item, index) => (
                        <React.Fragment key={index}>
                          <div className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-800/50'} px-4 py-3 text-center`}>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{item.range}</span>
                          </div>
                          <div className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-800/50'} px-4 py-3 text-center`}>
                            <span className={`text-lg font-bold ${item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                              {item.rate}
                            </span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {t("paypalProductPage.rateTable.buyTitle")}
                  </h3>
                  <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-gray-800">
                    <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-center font-semibold text-white">
                        {t("paypalProductPage.rateTable.amountHeader")}
                      </div>
                      <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-center font-semibold text-white">
                        {t("paypalProductPage.rateTable.rateHeader")}
                      </div>
                      {buyRates.map((item, index) => (
                        <React.Fragment key={index}>
                          <div className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-800/50'} px-4 py-3 text-center`}>
                            <span className="font-medium text-gray-900 dark:text-gray-200">{item.range}</span>
                          </div>
                          <div className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-800/50'} px-4 py-3 text-center`}>
                            <span className={`text-lg font-bold ${item.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
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
                    {t("paypalProductPage.rateTable.updateNote")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-center text-3xl font-bold dark:text-gray-100">
                {t("paypalProductPage.whyChoose.title")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("paypalProductPage.whyChoose.features.tier.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("paypalProductPage.whyChoose.features.tier.description")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("paypalProductPage.whyChoose.features.fast.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("paypalProductPage.whyChoose.features.fast.description")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("paypalProductPage.whyChoose.features.secure.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("paypalProductPage.whyChoose.features.secure.description")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-bold dark:text-gray-100">
                    {t("paypalProductPage.whyChoose.features.support.title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("paypalProductPage.whyChoose.features.support.description")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-center text-3xl font-bold dark:text-gray-100">
                {t("paypalProductPage.services.title")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500/50">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("paypalProductPage.services.sell.title")}
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    {t("paypalProductPage.services.sell.description")}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("paypalProductPage.services.sell.features.minMax")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("paypalProductPage.services.sell.features.rate")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("paypalProductPage.services.sell.features.payment")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("paypalProductPage.services.sell.features.process")}
                    </div>
                  </div>
                </div>

                <div className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500/50">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("paypalProductPage.services.buy.title")}
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    {t("paypalProductPage.services.buy.description")}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("paypalProductPage.services.buy.features.max")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("paypalProductPage.services.buy.features.rate")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("paypalProductPage.services.buy.features.payment")}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t("paypalProductPage.services.buy.features.process")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-center text-3xl font-bold dark:text-gray-100">
                {t("paypalProductPage.howTo.title")}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-bold text-white">
                    1
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("paypalProductPage.howTo.step1.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("paypalProductPage.howTo.step1.description")}
                  </p>
                </div>
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-bold text-white">
                    2
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("paypalProductPage.howTo.step2.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("paypalProductPage.howTo.step2.description")}
                  </p>
                </div>
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-bold text-white">
                    3
                  </div>
                  <h3 className="mb-2 text-xl font-bold dark:text-gray-100">
                    {t("paypalProductPage.howTo.step3.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("paypalProductPage.howTo.step3.description")}
                  </p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/order"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all hover:from-blue-600 hover:to-blue-800 dark:from-blue-600 dark:to-blue-800 dark:hover:from-blue-700 dark:hover:to-blue-900"
                >
                  {t("paypalProductPage.howTo.ctaButton")}
                </Link>
              </div>
            </div>

            <div className="mx-auto max-w-3xl">
              <h2 className="mb-4 text-center text-3xl font-bold dark:text-gray-100">
                {t("paypalProductPage.faq.title")}
              </h2>
              <Accordion items={faqData} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
