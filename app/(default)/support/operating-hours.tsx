"use client";

import { useLanguage } from "@/contexts/language-context";

export default function OperatingHours() {
  const { t } = useLanguage();

  const hours = [
    {
      title: t("supportPage.operatingHours.automated.title"),
      hours: t("supportPage.operatingHours.automated.hours"),
      description: t("supportPage.operatingHours.automated.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      ),
      color: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    },
    {
      title: t("supportPage.operatingHours.customerService.title"),
      hours: t("supportPage.operatingHours.customerService.hours"),
      description: t("supportPage.operatingHours.customerService.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
        </svg>
      ),
      color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    },
    {
      title: t("supportPage.operatingHours.priority.title"),
      hours: t("supportPage.operatingHours.priority.hours"),
      description: t("supportPage.operatingHours.priority.description"),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      ),
      color: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    },
  ];

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl pb-8 text-center">
            <h2 className="mb-4 text-2xl font-bold dark:text-gray-100">
              {t("supportPage.operatingHours.title")}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t("supportPage.operatingHours.subtitle")}
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {hours.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                <p className="mb-2 text-lg font-bold text-blue-600 dark:text-blue-400">{item.hours}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
