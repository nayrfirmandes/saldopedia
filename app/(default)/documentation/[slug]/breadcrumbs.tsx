"use client";

import { useLanguage } from "@/contexts/language-context";

export default function Breadcrumbs({ pageTitle }: { pageTitle: string }) {
  const { t } = useLanguage();
  
  return (
    <div className="ml-3 flex min-w-0 items-center whitespace-nowrap text-sm">
      <span className="text-gray-600 dark:text-gray-400">
        {t("docsPage.breadcrumb")}
      </span>
      <svg
        className="mx-2 shrink-0 -rotate-90 fill-gray-400"
        width={11}
        height={7}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m2 .94 3.5 3.5L9 .94 10.06 2 5.5 6.56.94 2 2 .94Z" />
      </svg>
      <span className="truncate font-medium text-gray-900 dark:text-gray-100">
        {pageTitle}
      </span>
    </div>
  );
}
