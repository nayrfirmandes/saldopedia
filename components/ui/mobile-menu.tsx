"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Transition, Disclosure } from "@headlessui/react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { ChevronDown, LogOut } from "lucide-react";

export default function MobileMenu() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  const trigger = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLDivElement>(null);

  const isDashboard = pathname?.startsWith('/dashboard');

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (!mobileNav.current || !trigger.current) return;
      if (
        !mobileNavOpen ||
        mobileNav.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return;
      setMobileNavOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!mobileNavOpen || keyCode !== 27) return;
      setMobileNavOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div className="flex md:hidden">
      {/* Hamburger button */}
      <button
        ref={trigger}
        className={`group inline-flex h-8 w-8 items-center justify-center text-center text-gray-800 dark:text-gray-200 transition ${mobileNavOpen && "active"}`}
        aria-controls="mobile-nav"
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <span className="sr-only">Menu</span>
        <svg
          className="pointer-events-none fill-current"
          width={16}
          height={16}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] -translate-y-[5px] translate-x-[7px] group-aria-expanded:rotate-[315deg] group-aria-expanded:translate-y-0 group-aria-expanded:translate-x-0"
            y="7"
            width="9"
            height="2"
            rx="1"
          ></rect>
          <rect
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
            y="7"
            width="16"
            height="2"
            rx="1"
          ></rect>
          <rect
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] translate-y-[5px] group-aria-expanded:rotate-[135deg] group-aria-expanded:translate-y-0"
            y="7"
            width="9"
            height="2"
            rx="1"
          ></rect>
        </svg>
      </button>

      {/*Mobile navigation */}
      <div ref={mobileNav}>
        <Transition
          show={mobileNavOpen}
          as="nav"
          id="mobile-nav"
          className="absolute left-0 top-full z-20 w-full rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 shadow-black/[0.03] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] dark:before:[background:linear-gradient(var(--color-gray-800),var(--color-gray-800))_border-box] transform transition ease-out duration-200 data-enter:data-closed:-translate-y-2 data-closed:opacity-0"
        >
          <div className="p-2 text-sm space-y-1">
            {loading ? (
              <div className="space-y-2 p-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <>
                {/* Logged In User Menu */}
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Layanan
                </div>
                <Link
                  href="/crypto"
                  className="flex rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t('nav.cryptocurrency')}
                </Link>
                <Link
                  href="/paypal"
                  className="flex rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t('nav.paypal')}
                </Link>
                <Link
                  href="/skrill"
                  className="flex rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t('nav.skrill')}
                </Link>
                <Link
                  href="/pricing"
                  className="flex rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t('nav.pricing')}
                </Link>
              </>
            ) : (
              <>
                {/* Guest User Menu */}
                <Link
                  href="/crypto"
                  className="flex rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t('nav.cryptocurrency')}
                </Link>
                <Link
                  href="/paypal"
                  className="flex rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t('nav.paypal')}
                </Link>
                <Link
                  href="/skrill"
                  className="flex rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t('nav.skrill')}
                </Link>
                <Link
                  href="/pricing"
                  className="flex rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {t('nav.pricing')}
                </Link>

                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <span>{t('nav.help')}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            open ? 'rotate-180' : ''
                          }`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="ml-2 space-y-1 mt-1">
                        <Link
                          href="/support"
                          className="flex rounded-lg px-2 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          {t('nav.support')}
                        </Link>
                        <Link
                          href="/calculator"
                          className="flex rounded-lg px-2 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          {t('nav.calculator')}
                        </Link>
                        <Link
                          href="/cryptocurrencies"
                          className="flex rounded-lg px-2 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          {t('nav.cryptoList')}
                        </Link>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
                
                <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>
                
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-gradient-to-t from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </Transition>
      </div>
    </div>
  );
}
