"use client";

import PageIllustration from "@/components/page-illustration";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export default function AboutContent() {
  const { t } = useLanguage();
  
  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Page header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-16">
            <h1 className="mb-6 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
              {t("aboutPage.header.title")}
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {t("aboutPage.header.subtitle")}
            </p>
          </div>

          {/* Stats Section */}
          <div className="mx-auto mb-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{t("aboutPage.stats.transactions.value")}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.stats.transactions.label")}</div>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{t("aboutPage.stats.users.value")}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.stats.users.label")}</div>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{t("aboutPage.stats.satisfaction.value")}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.stats.satisfaction.label")}</div>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{t("aboutPage.stats.experience.value")}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.stats.experience.label")}</div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-3xl space-y-12">
            {/* Siapa Kami */}
            <div>
              <h2 className="mb-4 text-2xl font-bold dark:text-gray-100">{t("aboutPage.whoWeAre.title")}</h2>
              <p className="mb-3 text-gray-700 dark:text-gray-300">
                {t("aboutPage.whoWeAre.paragraph1")}
              </p>
              <p className="mb-3 text-gray-700 dark:text-gray-300">
                {t("aboutPage.whoWeAre.paragraph2")}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {t("aboutPage.whoWeAre.paragraph3")}
              </p>
            </div>

            {/* Visi & Misi */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-gray-50 p-8 dark:from-gray-800 dark:to-gray-800">
              <h2 className="mb-4 text-2xl font-bold dark:text-gray-100">{t("aboutPage.visionMission.title")}</h2>
              
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold text-blue-600 dark:text-blue-400">{t("aboutPage.visionMission.vision.title")}</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {t("aboutPage.visionMission.vision.content")}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-blue-600 dark:text-blue-400">{t("aboutPage.visionMission.mission.title")}</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <svg className="mr-2 mt-1 h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t("aboutPage.visionMission.mission.items.access")}
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 mt-1 h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t("aboutPage.visionMission.mission.items.service")}
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 mt-1 h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t("aboutPage.visionMission.mission.items.education")}
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 mt-1 h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t("aboutPage.visionMission.mission.items.ecosystem")}
                  </li>
                </ul>
              </div>
            </div>

            {/* Core Values */}
            <div>
              <h2 className="mb-6 text-center text-2xl font-bold dark:text-gray-100">{t("aboutPage.coreValues.title")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-semibold dark:text-gray-100">{t("aboutPage.coreValues.values.trust.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.coreValues.values.trust.description")}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-500/20">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-semibold dark:text-gray-100">{t("aboutPage.coreValues.values.speed.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.coreValues.values.speed.description")}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-semibold dark:text-gray-100">{t("aboutPage.coreValues.values.transparency.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.coreValues.values.transparency.description")}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/20">
                    <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-semibold dark:text-gray-100">{t("aboutPage.coreValues.values.security.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.coreValues.values.security.description")}</p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="rounded-2xl bg-gray-50 p-8 dark:bg-gray-900/50">
              <h2 className="mb-2 text-center text-2xl font-bold dark:text-gray-100">{t("aboutPage.services.title")}</h2>
              <p className="mb-6 text-center text-gray-600 dark:text-gray-400">{t("aboutPage.services.subtitle")}</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 text-center dark:border-gray-700 dark:bg-gray-800">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20">
                    <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z"/>
                    </svg>
                  </div>
                  <h3 className="mb-2 font-semibold dark:text-gray-100">{t("aboutPage.services.items.crypto.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.services.items.crypto.description")}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 text-center dark:border-gray-700 dark:bg-gray-800">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
                    </svg>
                  </div>
                  <h3 className="mb-2 font-semibold dark:text-gray-100">{t("aboutPage.services.items.paypal.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.services.items.paypal.description")}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 text-center dark:border-gray-700 dark:bg-gray-800">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/20">
                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.12l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.833.939z"/>
                    </svg>
                  </div>
                  <h3 className="mb-2 font-semibold dark:text-gray-100">{t("aboutPage.services.items.skrill.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.services.items.skrill.description")}</p>
                </div>
              </div>
            </div>

            {/* Keunggulan */}
            <div>
              <h2 className="mb-6 text-center text-2xl font-bold dark:text-gray-100">{t("aboutPage.whyChoose.title")}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-semibold dark:text-gray-100">{t("aboutPage.whyChoose.features.automated.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.whyChoose.features.automated.description")}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-500/10">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-semibold dark:text-gray-100">{t("aboutPage.whyChoose.features.lowMinimum.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.whyChoose.features.lowMinimum.description")}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/10">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-semibold dark:text-gray-100">{t("aboutPage.whyChoose.features.secure.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.whyChoose.features.secure.description")}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/10">
                    <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-semibold dark:text-gray-100">{t("aboutPage.whyChoose.features.competitive.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.whyChoose.features.competitive.description")}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-500/10">
                    <svg className="h-5 w-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-semibold dark:text-gray-100">{t("aboutPage.whyChoose.features.support.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.whyChoose.features.support.description")}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-500/10">
                    <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-semibold dark:text-gray-100">{t("aboutPage.whyChoose.features.variety.title")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("aboutPage.whyChoose.features.variety.description")}</p>
                </div>
              </div>
            </div>

            {/* Komitmen Kami */}
            <div className="rounded-2xl bg-gray-900 p-8 text-white">
              <h2 className="mb-4 text-2xl font-bold">{t("aboutPage.commitment.title")}</h2>
              <p className="mb-6 text-gray-300">
                {t("aboutPage.commitment.description")}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="mb-2 text-3xl font-bold text-blue-400">{t("aboutPage.commitment.stats.availability.value")}</div>
                  <p className="text-sm text-gray-400">{t("aboutPage.commitment.stats.availability.label")}</p>
                </div>
                <div>
                  <div className="mb-2 text-3xl font-bold text-green-400">{t("aboutPage.commitment.stats.transparency.value")}</div>
                  <p className="text-sm text-gray-400">{t("aboutPage.commitment.stats.transparency.label")}</p>
                </div>
                <div>
                  <div className="mb-2 text-3xl font-bold text-purple-400">{t("aboutPage.commitment.stats.speed.value")}</div>
                  <p className="text-sm text-gray-400">{t("aboutPage.commitment.stats.speed.label")}</p>
                </div>
                <div>
                  <div className="mb-2 text-3xl font-bold text-orange-400">{t("aboutPage.commitment.stats.satisfaction.value")}</div>
                  <p className="text-sm text-gray-400">{t("aboutPage.commitment.stats.satisfaction.label")}</p>
                </div>
              </div>
            </div>

            {/* Legal Info */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="mb-3 font-semibold dark:text-gray-100">{t("aboutPage.legalInfo.title")}</h3>
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                {t("aboutPage.legalInfo.content")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {t("aboutPage.legalInfo.disclaimer")}
              </p>
            </div>

            {/* CTA */}
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold dark:text-gray-100">{t("aboutPage.cta.title")}</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                {t("aboutPage.cta.description")}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/order"
                  className="btn group w-full bg-linear-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] sm:w-auto"
                >
                  <span className="relative inline-flex items-center">
                    {t("aboutPage.cta.startButton")}
                    <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                      -&gt;
                    </span>
                  </span>
                </Link>
                <Link
                  href="/documentation"
                  className="btn w-full bg-white text-gray-800 shadow-sm hover:bg-gray-50 sm:w-auto dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                  {t("aboutPage.cta.learnButton")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
