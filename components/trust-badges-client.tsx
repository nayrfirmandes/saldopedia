'use client';

import { useLanguage } from "@/contexts/language-context";

export function TrustBadgesClient({ tKey, color }: { tKey: string; color: string }) {
  const { t } = useLanguage();
  return (
    <span className={`text-sm font-medium ${color}`}>
      {t(tKey)}
    </span>
  );
}
