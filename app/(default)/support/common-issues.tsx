"use client";

import { useLanguage } from "@/contexts/language-context";

export default function CommonIssues() {
  const { t } = useLanguage();

  const issues = [
    {
      title: t("supportPage.commonIssues.issues.delayed.title"),
      solution: t("supportPage.commonIssues.issues.delayed.solution"),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
    },
    {
      title: t("supportPage.commonIssues.issues.rate.title"),
      solution: t("supportPage.commonIssues.issues.rate.solution"),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
        </svg>
      ),
      color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    },
    {
      title: t("supportPage.commonIssues.issues.wallet.title"),
      solution: t("supportPage.commonIssues.issues.wallet.solution"),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      ),
      color: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    },
  ];

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl pb-8 text-center">
            <h2 className="mb-4 text-2xl font-bold dark:text-gray-100">
              {t("supportPage.commonIssues.title")}
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {issues.map((issue, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${issue.color}`}>
                  {issue.icon}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">{issue.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{issue.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
