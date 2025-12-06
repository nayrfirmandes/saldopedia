"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./logo";
import MobileMenu from "./mobile-menu";
import ThemeToggle from "@/components/theme-toggle";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { User, Settings, DollarSign, ShoppingCart, LayoutDashboard, LogOut } from "lucide-react";

const DropdownMenu = dynamic(() => import("@/components/ui/dropdown-menu"), { ssr: false });

export default function Header() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, mounted, logout } = useAuth();
  const [hidden, setHidden] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutScreen, setShowLogoutScreen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideScreenTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (window.innerWidth < 768) {
            // Hide when scrolling down and past 100px
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
              setHidden(true);
            } 
            // Show when scrolling up
            else if (currentScrollY < lastScrollY.current) {
              setHidden(false);
            }
          } else {
            // Always show on desktop
            setHidden(false);
          }
          
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuOpen &&
        userMenuRef.current &&
        userButtonRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setLoggingOut(true);
    
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    
    logoutTimerRef.current = setTimeout(() => {
      setShowLogoutScreen(true);
    }, 20);
    
    try {
      await logout();
      router.push('/');
      router.refresh();
    } finally {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (hideScreenTimerRef.current) {
        clearTimeout(hideScreenTimerRef.current);
      }
      hideScreenTimerRef.current = setTimeout(() => {
        setLoggingOut(false);
        setShowLogoutScreen(false);
      }, 500);
    }
  };
  
  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (hideScreenTimerRef.current) {
        clearTimeout(hideScreenTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {showLogoutScreen && (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-[3px] border-blue-600/20 dark:border-blue-400/20 rounded-full"></div>
              <div className="absolute inset-0 border-[3px] border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
              Logging out...
            </p>
          </div>
        </div>
      )}
      
      <header className={`fixed top-2 z-30 w-full md:top-6 transition-transform duration-300 ${hidden ? '-translate-y-24' : 'translate-y-0'}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-xs before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] dark:bg-gray-800/90 dark:shadow-gray-900/30 dark:before:[background:linear-gradient(var(--color-gray-700),var(--color-gray-800))_border-box]">
            {/* Site branding */}
            <div className="flex flex-1 items-center">
              <Logo />
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex md:grow">
              {/* Desktop menu links */}
              <ul className="flex grow flex-wrap items-center justify-center gap-4 text-sm lg:gap-8">
                <li className="px-3 py-1">
                  <Link
                    href="/crypto"
                    className="flex items-center text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    {t('nav.cryptocurrency')}
                  </Link>
                </li>
                <li className="px-3 py-1">
                  <Link
                    href="/paypal"
                    className="flex items-center text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    {t('nav.paypal')}
                  </Link>
                </li>
                <li className="px-3 py-1">
                  <Link
                    href="/skrill"
                    className="flex items-center text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    {t('nav.skrill')}
                  </Link>
                </li>
                <li className="px-3 py-1">
                  <Link
                    href="/pricing"
                    className="flex items-center text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    {t('nav.pricing')}
                  </Link>
                </li>
                <li className="px-3 py-1">
                  <DropdownMenu />
                </li>
              </ul>
            </nav>

            {/* Desktop sign in links */}
            <ul className="flex flex-1 items-center justify-end gap-2">
              <li>
                <ThemeToggle />
              </li>
              <li className="relative">
                {!mounted || loading ? (
                  <div className="h-9 w-9" />
                ) : user ? (
                    <>
                      <button
                        ref={userButtonRef}
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-full bg-blue-600 text-white font-semibold overflow-hidden hover:ring-2 hover:ring-2 hover:ring-blue-400 transition-all"
                        title={user.name || 'User'}
                      >
                        {user.photoUrl ? (
                          <img 
                            src={user.photoUrl} 
                            alt={user.name} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          user.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </button>
                      {userMenuOpen && (
                        <div
                          ref={userMenuRef}
                          className="absolute right-0 top-12 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="py-1">
                            <Link
                              href="/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              {t('header.userMenu.dashboard')}
                            </Link>
                            <Link
                              href="/dashboard/orders"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              {t('header.userMenu.orders')}
                            </Link>
                            <Link
                              href="/dashboard/deposit"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <DollarSign className="h-4 w-4" />
                              {t('header.userMenu.deposit')}
                            </Link>
                            <Link
                              href="/dashboard/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <User className="h-4 w-4" />
                              {t('header.userMenu.profile')}
                            </Link>
                            <Link
                              href="/dashboard/settings"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Settings className="h-4 w-4" />
                              {t('header.userMenu.settings')}
                            </Link>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                            <button
                              onClick={handleLogout}
                              disabled={loggingOut}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <LogOut className="h-4 w-4" />
                              {loggingOut ? t('header.userMenu.loggingOut') : t('header.userMenu.logout')}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Link
                        href="/login"
                        className="w-[62px] px-2.5 py-1 text-sm font-medium text-center rounded-md bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 dark:border dark:border-gray-600 text-white shadow-sm"
                      >
                        {t('nav.login')}
                      </Link>
                      <Link
                        href="/register"
                        className="w-[62px] px-2.5 py-1 text-sm font-medium text-center rounded-md bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%]"
                      >
                        {t('nav.register')}
                      </Link>
                    </div>
                  )}
              </li>
            </ul>

            <MobileMenu />
          </div>
        </div>
      </header>
    </>
  );
}
