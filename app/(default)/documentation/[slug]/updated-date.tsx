"use client";

import { useLanguage } from "@/contexts/language-context";

export default function UpdatedDate({ dateString }: { dateString: string }) {
  const { t } = useLanguage();
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let updateText = "";
  
  if (diffDays < 2) {
    updateText = t("docsPage.updated.oneDay");
  } else if (diffDays < 30) {
    updateText = t("docsPage.updated.days").replace("{days}", diffDays.toString());
  } else if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    updateText = diffMonths > 1
      ? t("docsPage.updated.months").replace("{months}", diffMonths.toString())
      : t("docsPage.updated.oneMonth");
  } else {
    const diffYears = Math.floor(diffDays / 365);
    updateText = diffYears > 1
      ? t("docsPage.updated.years").replace("{years}", diffYears.toString())
      : t("docsPage.updated.oneYear");
  }

  return (
    <div className="mt-5 flex items-center text-sm text-gray-500 dark:text-gray-400">
      <svg
        className="mr-3 fill-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        width={12}
        height={12}
        fill="none"
      >
        <path d="M10.008.75a.75.75 0 0 1 1.502 0v2.999a.75.75 0 0 1-.75.75H7.756a.75.75 0 1 1 0-1.5h1.607a4.476 4.476 0 0 0-3.359-1.5 4.486 4.486 0 0 0-4.5 4.328.75.75 0 0 1-.749.722H.727a.75.75 0 0 1-.722-.778 5.981 5.981 0 0 1 6-5.771c1.519 0 2.925.564 4.003 1.534V.75Zm.497 5.422a.736.736 0 0 1 .778-.721.75.75 0 0 1 .721.778 5.98 5.98 0 0 1-6 5.77 5.962 5.962 0 0 1-4.003-1.533v.784a.75.75 0 0 1-1.501 0v-3a.75.75 0 0 1 .75-.75h3.003a.75.75 0 1 1 0 1.5H2.646c.84.944 2.046 1.5 3.358 1.5a4.486 4.486 0 0 0 4.501-4.328Z" />
      </svg>
      {updateText}
    </div>
  );
}
