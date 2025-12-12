'use client';

import { memo } from 'react';
import { useLanguage } from '@/contexts/language-context';

function LanguageToggle() {
  const { language, setLanguage, isHydrated } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const displayLanguage = isHydrated ? language : 'id';

  return (
    <button
      onClick={toggleLanguage}
      className="group inline-flex items-center gap-1.5 text-xs transition-all hover:scale-105"
      aria-label="Toggle language"
    >
      <svg
        className="w-3 h-3 text-gray-500 dark:text-gray-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      
      <span className={`text-xs font-medium transition-all duration-300 ${
        displayLanguage === 'id' 
          ? 'text-blue-600 dark:text-blue-400 scale-105' 
          : 'text-gray-400 dark:text-gray-600 scale-95 opacity-60'
      }`}>
        ID
      </span>
      
      <div className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-all duration-300 shadow-inner ${
        displayLanguage === 'en' 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500' 
          : 'bg-gray-300 dark:bg-gray-700'
      }`}>
        <span
          className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
            displayLanguage === 'en' ? 'translate-x-3.5 rotate-180' : 'translate-x-0.5 rotate-0'
          }`}
        >
          <span className={`block h-full w-full rounded-full transition-colors duration-300 ${
            displayLanguage === 'en' 
              ? 'bg-gradient-to-br from-blue-100 to-white' 
              : 'bg-gradient-to-br from-gray-100 to-white'
          }`} />
        </span>
      </div>
      
      <span className={`text-xs font-medium transition-all duration-300 ${
        displayLanguage === 'en' 
          ? 'text-blue-600 dark:text-blue-400 scale-105' 
          : 'text-gray-400 dark:text-gray-600 scale-95 opacity-60'
      }`}>
        EN
      </span>
    </button>
  );
}

export default memo(LanguageToggle);
