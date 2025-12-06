"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export default function BackLink() {
  const { t } = useLanguage();

  return (
    <div className="mb-4">
      <Link
        className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        href="/blog"
      >
        <span className="tracking-normal text-blue-300 dark:text-blue-500">←</span>{" "}
        {t('blogPage.backToBlog')}
      </Link>
    </div>
  );
}
