'use client';

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";

export function CtaClient({ type = 'title' }: { type?: 'title' | 'button' | 'registerButton' }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  if (type === 'button') {
    return (
      <span className="relative inline-flex items-center">
        {t('nav.formOrder')}{" "}
        <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    );
  }

  if (type === 'registerButton') {
    return (
      <span className="relative inline-flex items-center">
        {t('cta.register')}{" "}
        <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    );
  }
  
  return (
    <h2 className="mb-6 py-2 border-y text-3xl font-bold text-white dark:text-gray-100 [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-700/.7),transparent)1] md:mb-8 md:text-4xl">
      {user ? t('cta.title') : t('cta.titleRegister')}
    </h2>
  );
}

export function CtaButtons() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
      <Link
        className="btn group w-full bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] sm:w-auto"
        href={user ? "/order" : "/register"}
      >
        <span className="relative inline-flex items-center">
          {user ? t('nav.formOrder') : t('cta.register')}{" "}
          <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </Link>
    </div>
  );
}
