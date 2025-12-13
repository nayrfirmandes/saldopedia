"use client";

import PageIllustration from "@/components/page-illustration";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export default function TermsOfService() {
  const { t } = useLanguage();
  
  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-20 pb-12 md:pt-32 md:pb-20">
          <div className="mx-auto max-w-3xl pb-10 text-center md:pb-12">
            <h1 className="mb-4 py-2 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
              {t("termsOfService.header.title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("termsOfService.header.lastUpdated")}
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="prose max-w-none text-gray-700 prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-gray-900 prose-a:font-medium prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:font-medium prose-strong:text-gray-900 prose-p:mb-1.5 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-h2:mb-1.5 prose-h2:mt-4 prose-h3:mb-1 prose-h3:mt-2.5 dark:text-gray-300 dark:prose-headings:text-gray-100 dark:prose-a:text-blue-400 dark:prose-strong:text-white dark:prose-strong:font-bold">
              
              <h2>{t("termsOfService.section1.title")}</h2>
              <p>{t("termsOfService.section1.p1")}</p>
              <p>{t("termsOfService.section1.p2")}</p>
              <p>{t("termsOfService.section1.p3")}</p>

              <h2>{t("termsOfService.section2.title")}</h2>
              <p>{t("termsOfService.section2.intro")}</p>
              <ul>
                <li><strong>{t("termsOfService.section2.we")}</strong> {t("termsOfService.section2.weDesc")}</li>
                <li><strong>{t("termsOfService.section2.user")}</strong> {t("termsOfService.section2.userDesc")}</li>
                <li><strong>{t("termsOfService.section2.service")}</strong> {t("termsOfService.section2.serviceDesc")}</li>
                <li><strong>{t("termsOfService.section2.crypto")}</strong> {t("termsOfService.section2.cryptoDesc")}</li>
                <li><strong>{t("termsOfService.section2.bot")}</strong> {t("termsOfService.section2.botDesc")}</li>
                <li><strong>{t("termsOfService.section2.balance")}</strong> {t("termsOfService.section2.balanceDesc")}</li>
                <li><strong>{t("termsOfService.section2.withdrawal")}</strong> {t("termsOfService.section2.withdrawalDesc")}</li>
                <li><strong>{t("termsOfService.section2.order")}</strong> {t("termsOfService.section2.orderDesc")}</li>
              </ul>

              <h2>{t("termsOfService.section3.title")}</h2>
              
              <h3>{t("termsOfService.section3.sub1.title")}</h3>
              <p>{t("termsOfService.section3.sub1.intro")}</p>
              <ul>
                <li>{t("termsOfService.section3.sub1.age")}</li>
                <li>{t("termsOfService.section3.sub1.info")}</li>
                <li>{t("termsOfService.section3.sub1.legal")}</li>
                <li>{t("termsOfService.section3.sub1.payment")}</li>
                <li>{t("termsOfService.section3.sub1.telegram")}</li>
              </ul>

              <h3>{t("termsOfService.section3.sub2.title")}</h3>
              <p>{t("termsOfService.section3.sub2.content")}</p>

              <h3>{t("termsOfService.section3.sub3.title")}</h3>
              <p>{t("termsOfService.section3.sub3.intro")}</p>
              <ul>
                <li>{t("termsOfService.section3.sub3.secure")}</li>
                <li>{t("termsOfService.section3.sub3.confidential")}</li>
                <li>{t("termsOfService.section3.sub3.noShare")}</li>
                <li>{t("termsOfService.section3.sub3.report")}</li>
              </ul>

              <h2>{t("termsOfService.section4.title")}</h2>

              <h3>{t("termsOfService.section4.sub1.title")}</h3>
              <p>{t("termsOfService.section4.sub1.intro")}</p>
              <ul>
                <li>{t("termsOfService.section4.sub1.step1")}</li>
                <li>{t("termsOfService.section4.sub1.step2")}</li>
                <li>{t("termsOfService.section4.sub1.step3")}</li>
                <li>{t("termsOfService.section4.sub1.step4")}</li>
                <li>{t("termsOfService.section4.sub1.step5")}</li>
                <li>{t("termsOfService.section4.sub1.step6")}</li>
                <li>{t("termsOfService.section4.sub1.step7")}</li>
              </ul>

              <h3>{t("termsOfService.section4.sub2.title")}</h3>
              <ul>
                <li><strong>{t("termsOfService.section4.sub2.min")}</strong> {t("termsOfService.section4.sub2.minValue")}</li>
                <li><strong>{t("termsOfService.section4.sub2.max")}</strong> {t("termsOfService.section4.sub2.maxValue")}</li>
                <li>{t("termsOfService.section4.sub2.note")}</li>
              </ul>

              <h3>{t("termsOfService.section4.sub3.title")}</h3>
              <p>{t("termsOfService.section4.sub3.content")}</p>

              <h3>{t("termsOfService.section4.sub4.title")}</h3>
              <ul>
                <li>{t("termsOfService.section4.sub4.realtime")}</li>
                <li>{t("termsOfService.section4.sub4.inclusive")}</li>
                <li>{t("termsOfService.section4.sub4.noHidden")}</li>
                <li>{t("termsOfService.section4.sub4.variable")}</li>
                <li>{t("termsOfService.section4.sub4.applies")}</li>
              </ul>

              <h3>{t("termsOfService.section4.sub5.title")}</h3>
              <p>{t("termsOfService.section4.sub5.content")}</p>

              <h2>{t("termsOfService.section5.title")}</h2>

              <h3>{t("termsOfService.section5.sub1.title")}</h3>
              <p>{t("termsOfService.section5.sub1.content")}</p>

              <h3>{t("termsOfService.section5.sub2.title")}</h3>
              <p>{t("termsOfService.section5.sub2.intro")} <strong>{t("termsOfService.section5.sub2.noCancel")}</strong>{t("termsOfService.section5.sub2.conditions")}</p>
              <ul>
                <li>{t("termsOfService.section5.sub2.systemError")}</li>
                <li>{t("termsOfService.section5.sub2.overpay")}</li>
                <li>{t("termsOfService.section5.sub2.notReceived")}</li>
              </ul>
              <p>{t("termsOfService.section5.sub2.refund")}</p>

              <h3>{t("termsOfService.section5.sub3.title")}</h3>
              <p>{t("termsOfService.section5.sub3.intro")}</p>
              <ul>
                <li>{t("termsOfService.section5.sub3.wrongAddress")}</li>
                <li>{t("termsOfService.section5.sub3.wrongAmount")}</li>
                <li>{t("termsOfService.section5.sub3.wrongBank")}</li>
                <li>{t("termsOfService.section5.sub3.lostAccess")}</li>
              </ul>

              <h2>{t("termsOfService.section6.title")}</h2>

              <h3>{t("termsOfService.section6.sub1.title")}</h3>
              <p>{t("termsOfService.section6.sub1.content")}</p>

              <h3>{t("termsOfService.section6.sub2.title")}</h3>
              <p>{t("termsOfService.section6.sub2.intro")}</p>
              <ul>
                <li>{t("termsOfService.section6.sub2.downtime")}</li>
                <li>{t("termsOfService.section6.sub2.internet")}</li>
                <li>{t("termsOfService.section6.sub2.blockchain")}</li>
                <li>{t("termsOfService.section6.sub2.delay")}</li>
              </ul>
              <p>{t("termsOfService.section6.sub2.footer")}</p>

              <h3>{t("termsOfService.section6.sub3.title")}</h3>
              <p>{t("termsOfService.section6.sub3.content")}</p>

              <h2>{t("termsOfService.section7.title")}</h2>

              <h3>{t("termsOfService.section7.sub1.title")}</h3>
              <p>{t("termsOfService.section7.sub1.intro")}</p>
              <ul>
                <li>{t("termsOfService.section7.sub1.verify")}</li>
                <li>{t("termsOfService.section7.sub1.reject")}</li>
                <li>{t("termsOfService.section7.sub1.report")}</li>
                <li>{t("termsOfService.section7.sub1.close")}</li>
              </ul>

              <h3>{t("termsOfService.section7.sub2.title")}</h3>
              <p>{t("termsOfService.section7.sub2.intro")}</p>
              <ul>
                <li>{t("termsOfService.section7.sub2.fraud")}</li>
                <li>{t("termsOfService.section7.sub2.laundering")}</li>
                <li>{t("termsOfService.section7.sub2.manipulation")}</li>
                <li>{t("termsOfService.section7.sub2.spam")}</li>
                <li>{t("termsOfService.section7.sub2.ip")}</li>
                <li>{t("termsOfService.section7.sub2.illegal")}</li>
              </ul>

              <h2>{t("termsOfService.section8.title")}</h2>

              <h3>{t("termsOfService.section8.sub1.title")}</h3>
              <p>{t("termsOfService.section8.sub1.intro")}</p>
              <ul>
                <li>{t("termsOfService.section8.sub1.transaction")}</li>
                <li>{t("termsOfService.section8.sub1.wallet")}</li>
                <li>{t("termsOfService.section8.sub1.payment")}</li>
                <li>{t("termsOfService.section8.sub1.contact")}</li>
              </ul>

              <h3>{t("termsOfService.section8.sub2.title")}</h3>
              <p>{t("termsOfService.section8.sub2.intro")}</p>
              <ul>
                <li>{t("termsOfService.section8.sub2.process")}</li>
                <li>{t("termsOfService.section8.sub2.prevent")}</li>
                <li>{t("termsOfService.section8.sub2.law")}</li>
              </ul>

              <h2>{t("termsOfService.section9.title")}</h2>
              <p>{t("termsOfService.section9.content")}</p>

              <h2>{t("termsOfService.section10.title")}</h2>
              <p>{t("termsOfService.section10.p1")}</p>
              <p>{t("termsOfService.section10.p2")}</p>

              <h2>{t("termsOfService.section11.title")}</h2>
              <p>{t("termsOfService.section11.intro")}</p>
              <ul>
                <li>{t("termsOfService.section11.violate")}</li>
                <li>{t("termsOfService.section11.false")}</li>
                <li>{t("termsOfService.section11.suspect")}</li>
                <li>{t("termsOfService.section11.authority")}</li>
              </ul>

              <h2>{t("termsOfService.section12.title")}</h2>
              <p>{t("termsOfService.section12.content")}</p>

              <h2>{t("termsOfService.section13.title")}</h2>
              <p>{t("termsOfService.section13.intro")}</p>
              <ul>
                <li>
                  <strong>WhatsApp Customer Service:</strong>{" "}
                  <a href="https://wa.me/628119666620?text=Halo%20Saldopedia%2C%20saya%20butuh%20bantuan%20terkait%20transaksi" target="_blank" rel="noopener noreferrer">
                    08119666620
                  </a>
                </li>
                <li>
                  <strong>{t("termsOfService.section13.hours")}</strong> {t("termsOfService.section13.hoursValue")}
                </li>
              </ul>

              <h2>{t("termsOfService.section14.title")}</h2>
              <p>{t("termsOfService.section14.content")}</p>

              <hr className="my-6" />

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 dark:bg-blue-900/20 dark:border-blue-600">
                <p className="text-sm">
                  <strong>{t("termsOfService.notice.title")}</strong> {t("termsOfService.notice.content")}
                </p>
              </div>

              <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
                <h3 className="mb-4 text-lg font-semibold dark:text-gray-100">{t("common.relatedLinks") || "Halaman Terkait"}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/privacy-policy" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    {t("common.privacyPolicy") || "Kebijakan Privasi"}
                  </Link>
                  <Link href="/support" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {t("common.support") || "Pusat Bantuan"}
                  </Link>
                  <Link href="/documentation" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {t("common.documentation") || "Dokumentasi"}
                  </Link>
                  <Link href="/about" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("common.aboutUs") || "Tentang Kami"}
                  </Link>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center mt-6 dark:text-gray-400">
                {t("termsOfService.footer")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
