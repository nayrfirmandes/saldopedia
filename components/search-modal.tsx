"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useLanguage } from "@/contexts/language-context";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface SearchModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSearch: (query: string) => void;
}

export default function SearchModal({ isOpen, setIsOpen, onSearch }: SearchModalProps) {
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState("");

  const allFaqs: FAQ[] = useMemo(() => {
    const faqs01 = [];
    const faqs02 = [];
    const faqs03 = [];
    const faqsCrypto = [];
    const faqsPaypal = [];
    const faqsSkrill = [];
    
    for (let i = 1; i <= 5; i++) {
      faqs01.push({
        category: t('pricing.faq.category1'),
        question: t(`pricing.faq.q${i}`),
        answer: t(`pricing.faq.a${i}`),
      });
    }
    
    for (let i = 6; i <= 10; i++) {
      faqs02.push({
        category: t('pricing.faq.category2'),
        question: t(`pricing.faq.q${i}`),
        answer: t(`pricing.faq.a${i}`),
      });
    }
    
    for (let i = 11; i <= 15; i++) {
      faqs03.push({
        category: t('pricing.faq.category3'),
        question: t(`pricing.faq.q${i}`),
        answer: t(`pricing.faq.a${i}`),
      });
    }

    for (let i = 1; i <= 4; i++) {
      faqsCrypto.push({
        category: t('cryptoProductPage.faq.title'),
        question: t(`cryptoProductPage.faq.q${i}.question`),
        answer: t(`cryptoProductPage.faq.q${i}.answer`),
      });
    }

    for (let i = 1; i <= 5; i++) {
      faqsPaypal.push({
        category: t('paypalProductPage.faq.title'),
        question: t(`paypalProductPage.faq.q${i}.question`),
        answer: t(`paypalProductPage.faq.q${i}.answer`),
      });
    }

    for (let i = 1; i <= 5; i++) {
      faqsSkrill.push({
        category: t('skrillProductPage.faq.title'),
        question: t(`skrillProductPage.faq.q${i}.question`),
        answer: t(`skrillProductPage.faq.q${i}.answer`),
      });
    }
    
    return [...faqs01, ...faqs02, ...faqs03, ...faqsCrypto, ...faqsPaypal, ...faqsSkrill];
  }, [t]);

  useEffect(() => {
    if (isOpen) {
      setSearchInput("");
      onSearch("");
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  const filteredResults = useMemo(() => {
    if (searchInput.trim() === "") return [];
    
    const query = searchInput.toLowerCase();
    return allFaqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
    );
  }, [searchInput, allFaqs]);

  const handleSelectFaq = (faq: FAQ) => {
    onSearch(faq.question);
    setIsOpen(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      setIsOpen(false);
    }
  };

  const popularFaqs = useMemo(() => {
    return [
      allFaqs.find(f => f.question.includes(t('pricing.faq.q1').substring(0, 20))),
      allFaqs.find(f => f.question.includes(t('pricing.faq.q2').substring(0, 20))),
      allFaqs.find(f => f.question.includes(t('pricing.faq.q3').substring(0, 20))),
      allFaqs.find(f => f.question.includes(t('pricing.faq.q4').substring(0, 20))),
      allFaqs.find(f => f.question.includes(t('pricing.faq.q5').substring(0, 20))),
      allFaqs.find(f => f.question.includes(t('pricing.faq.q7').substring(0, 20))),
      allFaqs.find(f => f.category === t('paypalProductPage.faq.title')),
      allFaqs.find(f => f.category === t('skrillProductPage.faq.title')),
    ].filter(Boolean) as FAQ[];
  }, [allFaqs, t]);

  return (
    <Dialog as="div" open={isOpen} onClose={() => setIsOpen(false)}>
      <DialogBackdrop
        transition
        className="fixed inset-0 z-99999 bg-gray-900/20 transition-opacity duration-200 ease-out data-closed:opacity-0 dark:bg-gray-900/60"
      />

      <div className="fixed inset-0 top-20 z-99999 mb-4 flex items-start justify-center overflow-hidden px-4 sm:px-6 md:top-28">
        <DialogPanel transition className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-lg duration-300 ease-out data-closed:translate-y-4 data-closed:opacity-0 flex flex-col dark:bg-gray-800 dark:shadow-black/40">
          <form onSubmit={handleSearch} className="border-b border-gray-200 flex-shrink-0 dark:border-gray-700">
            <div className="flex items-center">
              <label htmlFor="search-modal" className="sr-only">
                {t("supportPage.searchModal.searchLabel")}
              </label>
              <svg
                className="ml-4 h-4 w-4 shrink-0 fill-gray-500 dark:fill-gray-400"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m14.707 13.293-1.414 1.414-2.4-2.4 1.414-1.414 2.4 2.4ZM6.8 12.6A5.8 5.8 0 1 1 6.8 1a5.8 5.8 0 0 1 0 11.6Zm0-2a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6Z" />
              </svg>
              <input
                id="search-modal"
                data-autofocus
                className="w-full appearance-none border-0 bg-white py-2.5 pl-2 pr-4 text-base placeholder-gray-400 focus:ring-transparent dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
                type="search"
                placeholder={t("supportPage.searchModal.placeholder")}
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              {searchInput && (
                <button
                  type="submit"
                  className="mr-3 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {t("supportPage.searchModal.searchButton")}
                </button>
              )}
            </div>
          </form>
          
          <div className="overflow-y-auto flex-1">
            {searchInput === "" ? (
              <div className="p-2">
                <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
                  {t("supportPage.searchModal.popularSearches")}
                </div>
                <ul className="space-y-1">
                  {popularFaqs.map((faq, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        className="flex w-full items-center rounded-lg px-2 py-2 text-sm leading-6 text-gray-700 outline-hidden focus-within:bg-gray-100 hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-700 dark:focus-within:bg-gray-700"
                        onClick={() => handleSelectFaq(faq)}
                      >
                        <svg
                          className="mr-3 h-3 w-3 shrink-0 fill-blue-500 dark:fill-blue-400"
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                        >
                          <path d="M11.953 4.29a.5.5 0 0 0-.454-.292H6.14L6.984.62A.5.5 0 0 0 6.12.173l-6 7a.5.5 0 0 0 .379.825h5.359l-.844 3.38a.5.5 0 0 0 .864.445l6-7a.5.5 0 0 0 .075-.534Z" />
                        </svg>
                        <span className="font-medium line-clamp-1">{faq.question}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="p-2">
                <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
                  {t("supportPage.searchModal.resultsFound")} {filteredResults.length} {t("supportPage.searchModal.results")}
                </div>
                <ul className="space-y-1">
                  {filteredResults.map((faq, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left outline-hidden focus-within:bg-blue-50 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200 dark:hover:bg-blue-500/10 dark:focus-within:bg-blue-500/10 dark:hover:border-blue-500/30"
                        onClick={() => handleSelectFaq(faq)}
                      >
                        <div className="flex items-start w-full">
                          <svg
                            className="mr-2 mt-1 h-4 w-4 shrink-0 fill-blue-500 dark:fill-blue-400"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                          >
                            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm0 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm.93-8.35-.85 5.66a.5.5 0 0 1-.99 0l-.84-5.66a.5.5 0 0 1 .98-.15L8 8.84l.77-5.34a.5.5 0 0 1 .98.15Z" />
                          </svg>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 mb-1 dark:text-gray-100">
                              {faq.question}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                              {faq.answer}
                            </div>
                            <div className="text-xs text-blue-600 mt-1 font-medium dark:text-blue-400">
                              {faq.category}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-sm text-gray-500 mb-1 dark:text-gray-400">
                  {t("supportPage.searchModal.noResults")} "{searchInput}"
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t("supportPage.searchModal.noResultsHelper")}
                </p>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
