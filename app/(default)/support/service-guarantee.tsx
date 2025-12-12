"use client";

import { useLanguage } from "@/contexts/language-context";

export default function ServiceGuarantee() {
  const { t } = useLanguage();

  const guarantees = [
    {
      title: t("supportPage.serviceGuarantee.guarantees.response.title"),
      description: t("supportPage.serviceGuarantee.guarantees.response.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      ),
    },
    {
      title: t("supportPage.serviceGuarantee.guarantees.solution.title"),
      description: t("supportPage.serviceGuarantee.guarantees.solution.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
    },
    {
      title: t("supportPage.serviceGuarantee.guarantees.professional.title"),
      description: t("supportPage.serviceGuarantee.guarantees.professional.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      ),
    },
    {
      title: t("supportPage.serviceGuarantee.guarantees.secure.title"),
      description: t("supportPage.serviceGuarantee.guarantees.secure.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="relative bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl pb-8 text-center">
            <h2 className="mb-4 text-2xl font-bold dark:text-gray-100">
              {t("supportPage.serviceGuarantee.title")}
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {guarantees.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  {item.icon}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
