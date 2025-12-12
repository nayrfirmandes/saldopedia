'use client';

import { memo } from "react";
import Link from "next/link";
import Logo from "./logo";
import LanguageToggle from "../language-toggle";
import SystemStatus from "../system-status";
import { useLanguage } from "@/contexts/language-context";

function FooterMinimal() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Logo />
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <Link href="/calculator" className="hover:text-gray-900 dark:hover:text-gray-100">
              {t('footer.calculator')}
            </Link>
            <Link href="/terms-of-service" className="hover:text-gray-900 dark:hover:text-gray-100">
              {t('footer.termsOfService')}
            </Link>
            <Link href="/privacy-policy" className="hover:text-gray-900 dark:hover:text-gray-100">
              {t('footer.privacyPolicy')}
            </Link>
            <Link href="/support" className="hover:text-gray-900 dark:hover:text-gray-100">
              {t('footer.contact')}
            </Link>
            <LanguageToggle />
            <SystemStatus />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(FooterMinimal);
