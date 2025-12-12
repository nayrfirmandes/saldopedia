"use client";

import Link from "next/link";
import { Menu } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function DropdownMenu() {
  const { t } = useLanguage();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
        {t('nav.help')}
        <ChevronDown className="ml-1 h-3 w-3" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
        <div className="p-1">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/support"
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-300`}
              >
                {t('nav.support')}
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/calculator"
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-300`}
              >
                {t('nav.calculator')}
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/cryptocurrencies"
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-300`}
              >
                {t('nav.cryptoList')}
              </Link>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
