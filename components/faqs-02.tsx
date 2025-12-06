"use client";

import { useState, useEffect } from "react";
import Accordion from "@/components/accordion";
import { slugifyQuestion } from "@/lib/faq-utils";
import { useLanguage } from "@/contexts/language-context";

export default function Faqs({ searchQuery = "", onSearch }: { searchQuery?: string; onSearch?: (query: string) => void }) {
  const { t } = useLanguage();
  
  const faqs01 = [
    {
      question: t('pricing.faq.q1'),
      answer: t('pricing.faq.a1'),
    },
    {
      question: t('pricing.faq.q2'),
      answer: t('pricing.faq.a2'),
    },
    {
      question: t('pricing.faq.q3'),
      answer: t('pricing.faq.a3'),
    },
    {
      question: t('pricing.faq.q4'),
      answer: t('pricing.faq.a4'),
    },
    {
      question: t('pricing.faq.q5'),
      answer: t('pricing.faq.a5'),
    },
  ];

  const faqs02 = [
    {
      question: t('pricing.faq.q6'),
      answer: t('pricing.faq.a6'),
    },
    {
      question: t('pricing.faq.q7'),
      answer: t('pricing.faq.a7'),
    },
    {
      question: t('pricing.faq.q8'),
      answer: t('pricing.faq.a8'),
    },
    {
      question: t('pricing.faq.q9'),
      answer: t('pricing.faq.a9'),
    },
    {
      question: t('pricing.faq.q10'),
      answer: t('pricing.faq.a10'),
    },
  ];

  const faqs03 = [
    {
      question: t('pricing.faq.q11'),
      answer: t('pricing.faq.a11'),
    },
    {
      question: t('pricing.faq.q12'),
      answer: t('pricing.faq.a12'),
    },
    {
      question: t('pricing.faq.q13'),
      answer: t('pricing.faq.a13'),
    },
    {
      question: t('pricing.faq.q14'),
      answer: t('pricing.faq.a14'),
    },
    {
      question: t('pricing.faq.q15'),
      answer: t('pricing.faq.a15'),
    },
  ];

  const faqsCrypto = [
    {
      question: t('cryptoProductPage.faq.q1.question'),
      answer: t('cryptoProductPage.faq.q1.answer'),
    },
    {
      question: t('cryptoProductPage.faq.q2.question'),
      answer: t('cryptoProductPage.faq.q2.answer'),
    },
    {
      question: t('cryptoProductPage.faq.q3.question'),
      answer: t('cryptoProductPage.faq.q3.answer'),
    },
    {
      question: t('cryptoProductPage.faq.q4.question'),
      answer: t('cryptoProductPage.faq.q4.answer'),
    },
  ];

  const faqsPaypal = [
    {
      question: t('paypalProductPage.faq.q1.question'),
      answer: t('paypalProductPage.faq.q1.answer'),
    },
    {
      question: t('paypalProductPage.faq.q2.question'),
      answer: t('paypalProductPage.faq.q2.answer'),
    },
    {
      question: t('paypalProductPage.faq.q3.question'),
      answer: t('paypalProductPage.faq.q3.answer'),
    },
    {
      question: t('paypalProductPage.faq.q4.question'),
      answer: t('paypalProductPage.faq.q4.answer'),
    },
    {
      question: t('paypalProductPage.faq.q5.question'),
      answer: t('paypalProductPage.faq.q5.answer'),
    },
  ];

  const faqsSkrill = [
    {
      question: t('skrillProductPage.faq.q1.question'),
      answer: t('skrillProductPage.faq.q1.answer'),
    },
    {
      question: t('skrillProductPage.faq.q2.question'),
      answer: t('skrillProductPage.faq.q2.answer'),
    },
    {
      question: t('skrillProductPage.faq.q3.question'),
      answer: t('skrillProductPage.faq.q3.answer'),
    },
    {
      question: t('skrillProductPage.faq.q4.question'),
      answer: t('skrillProductPage.faq.q4.answer'),
    },
    {
      question: t('skrillProductPage.faq.q5.question'),
      answer: t('skrillProductPage.faq.q5.answer'),
    },
  ];

  const allFaqs = [
    { category: t('pricing.faq.category1'), faqs: faqs01 },
    { category: t('pricing.faq.category2'), faqs: faqs02 },
    { category: t('pricing.faq.category3'), faqs: faqs03 },
    { category: t('cryptoProductPage.faq.title'), faqs: faqsCrypto },
    { category: t('paypalProductPage.faq.title'), faqs: faqsPaypal },
    { category: t('skrillProductPage.faq.title'), faqs: faqsSkrill },
  ];

  const filteredFaqs = allFaqs.map((section) => ({
    ...section,
    faqs: section.faqs.filter(
      (faq) =>
        searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => section.faqs.length > 0);

  const hasResults = filteredFaqs.length > 0;

  useEffect(() => {
    if (searchQuery) {
      setTimeout(() => {
        const faqSection = document.getElementById('faq-section');
        if (faqSection) {
          const yOffset = -100;
          const y = faqSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [searchQuery]);

  return (
    <section id="faq-section">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          {searchQuery && (
            <div className="mx-auto max-w-3xl mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('pricing.faq.searchResultFor')} <span className="font-semibold text-gray-900 dark:text-gray-100">"{searchQuery}"</span>
              </p>
              <button
                onClick={() => onSearch?.("")}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('pricing.faq.viewAllFaq')}
              </button>
            </div>
          )}
          {!hasResults && searchQuery !== "" ? (
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {t('pricing.faq.noResults')} "{searchQuery}"{t('pricing.faq.noResultsCta')}
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-12">
              {filteredFaqs.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h2 className="mb-5 text-xl font-bold dark:text-gray-100">{section.category}</h2>
                  <div className="space-y-2">
                    {section.faqs.map((faq, index) => {
                      const faqSlug = slugifyQuestion(faq.question);
                      const shouldOpen = searchQuery !== "" && faq.question.toLowerCase().includes(searchQuery.toLowerCase());
                      return (
                        <div key={index} id={`faq-${faqSlug}`}>
                          <Accordion
                            title={faq.question}
                            id={`faqs-${sectionIndex}-${index}`}
                            open={shouldOpen}
                          >
                            {faq.answer}
                          </Accordion>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
