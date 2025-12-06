"use client";

import PageIllustration from "@/components/page-illustration";
import { useLanguage } from "@/contexts/language-context";

export default function TermsOfService() {
  const { t } = useLanguage();
  
  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-20 pb-12 md:pt-32 md:pb-20">
          {/* Page header */}
          <div className="mx-auto max-w-3xl pb-10 text-center md:pb-12">
            <h1 className="mb-4 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
              {t("termsOfService.header.title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("termsOfService.header.lastUpdated")}
            </p>
          </div>

          {/* Terms content */}
          <div className="mx-auto max-w-3xl">
            <div className="prose max-w-none text-gray-700 prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-gray-900 prose-a:font-medium prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:font-medium prose-strong:text-gray-900 prose-p:mb-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-h2:mb-2 prose-h2:mt-5 prose-h3:mb-1.5 prose-h3:mt-3 dark:text-gray-300 dark:prose-headings:text-gray-100 dark:prose-a:text-blue-400 dark:prose-strong:text-white dark:prose-strong:font-bold">
              
              <h2>{t("termsOfService.section1.title")}</h2>
              <p>
                {t("termsOfService.section1.p1")}
              </p>
              <p>
                {t("termsOfService.section1.p2")}
              </p>

              <h2>{t("termsOfService.section2.title")}</h2>
              <p>{t("termsOfService.section2.intro")}</p>
              <ul>
                <li><strong>{t("termsOfService.section2.we")}</strong> {t("termsOfService.section2.weDesc")}</li>
                <li><strong>{t("termsOfService.section2.user")}</strong> {t("termsOfService.section2.userDesc")}</li>
                <li><strong>{t("termsOfService.section2.service")}</strong> {t("termsOfService.section2.serviceDesc")}</li>
                <li><strong>{t("termsOfService.section2.bot")}</strong> {t("termsOfService.section2.botDesc")}</li>
                <li><strong>{t("termsOfService.section2.crypto")}</strong> {t("termsOfService.section2.cryptoDesc")}</li>
              </ul>

              <h2>{t("termsOfService.section3.title")}</h2>
              
              <h3>{t("termsOfService.section3.sub1.title")}</h3>
              <p>{t("termsOfService.section3.sub1.intro")}</p>
              <ul>
                <li>{t("termsOfService.section3.sub1.age")}</li>
                <li>{t("termsOfService.section3.sub1.telegram")}</li>
                <li>{t("termsOfService.section3.sub1.payment")}</li>
                <li>{t("termsOfService.section3.sub1.info")}</li>
                <li>{t("termsOfService.section3.sub1.legal")}</li>
              </ul>

              <h3>{t("termsOfService.section3.sub2.title")}</h3>
              <p>
                {t("termsOfService.section3.sub2.content")}
              </p>

              <h3>{t("termsOfService.section3.sub3.title")}</h3>
              <p>{t("termsOfService.section3.sub3.intro")}</p>
              <ul>
                <li>{t("termsOfService.section3.sub3.confidential")}</li>
                <li>{t("termsOfService.section3.sub3.noShare")}</li>
                <li>{t("termsOfService.section3.sub3.report")}</li>
                <li>{t("termsOfService.section3.sub3.secure")}</li>
              </ul>

              <h2>{t("termsOfService.section4.title")}</h2>

              <h3>{t("termsOfService.section4.sub1.title")}</h3>
              <p>{t("termsOfService.section4.sub1.intro")}</p>
              <ol>
                <li>{t("termsOfService.section4.sub1.step1")}</li>
                <li>{t("termsOfService.section4.sub1.step2")}</li>
                <li>{t("termsOfService.section4.sub1.step3")}</li>
                <li>{t("termsOfService.section4.sub1.step4")}</li>
                <li>{t("termsOfService.section4.sub1.step5")}</li>
                <li>{t("termsOfService.section4.sub1.step6")}</li>
                <li>{t("termsOfService.section4.sub1.step7")}</li>
              </ol>

              <h3>{t("termsOfService.section4.sub2.title")}</h3>
              <ul>
                <li><strong>{t("termsOfService.section4.sub2.min")}</strong> {t("termsOfService.section4.sub2.minValue")}</li>
                <li><strong>{t("termsOfService.section4.sub2.max")}</strong> {t("termsOfService.section4.sub2.maxValue")}</li>
                <li>{t("termsOfService.section4.sub2.note")}</li>
              </ul>

              <h3>{t("termsOfService.section4.sub3.title")}</h3>
              <p>
                {t("termsOfService.section4.sub3.content")}
              </p>

              <h3>{t("termsOfService.section4.sub4.title")}</h3>
              <ul>
                <li>{t("termsOfService.section4.sub4.realtime")}</li>
                <li>{t("termsOfService.section4.sub4.inclusive")}</li>
                <li>{t("termsOfService.section4.sub4.noHidden")}</li>
                <li>{t("termsOfService.section4.sub4.variable")}</li>
                <li>{t("termsOfService.section4.sub4.applies")}</li>
              </ul>

              <h3>{t("termsOfService.section4.sub5.title")}</h3>
              <p>
                {t("termsOfService.section4.sub5.content")}
              </p>

              <h2>{t("termsOfService.section5.title")}</h2>

              <h3>{t("termsOfService.section5.sub1.title")}</h3>
              <p>
                {t("termsOfService.section5.sub1.content")}
              </p>

              <h3>{t("termsOfService.section5.sub2.title")}</h3>
              <p>
                {t("termsOfService.section5.sub2.intro")} <strong>{t("termsOfService.section5.sub2.noCancel")}</strong>{t("termsOfService.section5.sub2.conditions")}
              </p>
              <ul>
                <li>{t("termsOfService.section5.sub2.systemError")}</li>
                <li>{t("termsOfService.section5.sub2.overpay")}</li>
                <li>{t("termsOfService.section5.sub2.notReceived")}</li>
              </ul>
              <p>
                {t("termsOfService.section5.sub2.refund")}
              </p>

              <h3>{t("termsOfService.section5.sub3.title")}</h3>
              <p>
                {t("termsOfService.section5.sub3.intro")}
              </p>
              <ul>
                <li>{t("termsOfService.section5.sub3.wrongBank")}</li>
                <li>{t("termsOfService.section5.sub3.wrongAmount")}</li>
                <li>{t("termsOfService.section5.sub3.wrongAddress")}</li>
                <li>{t("termsOfService.section5.sub3.lostAccess")}</li>
              </ul>

              <h2>{t("termsOfService.section6.title")}</h2>

              <h3>{t("termsOfService.section6.sub1.title")}</h3>
              <p>
                {t("termsOfService.section6.sub1.content")}
              </p>

              <h3>{t("termsOfService.section6.sub2.title")}</h3>
              <p>{t("termsOfService.section6.sub2.intro")}</p>
              <ul>
                <li>{t("termsOfService.section6.sub2.downtime")}</li>
                <li>{t("termsOfService.section6.sub2.delay")}</li>
                <li>{t("termsOfService.section6.sub2.blockchain")}</li>
                <li>{t("termsOfService.section6.sub2.internet")}</li>
              </ul>
              <p>
                {t("termsOfService.section6.sub2.footer")}
              </p>

              <h3>{t("termsOfService.section6.sub3.title")}</h3>
              <p>
                {t("termsOfService.section6.sub3.content")}
              </p>

              <h2>{t("termsOfService.section7.title")}</h2>

              <h3>{t("termsOfService.section7.sub1.title")}</h3>
              <p>
                {t("termsOfService.section7.sub1.intro")}
              </p>
              <ul>
                <li>{t("termsOfService.section7.sub1.verify")}</li>
                <li>{t("termsOfService.section7.sub1.reject")}</li>
                <li>{t("termsOfService.section7.sub1.report")}</li>
                <li>{t("termsOfService.section7.sub1.close")}</li>
              </ul>

              <h3>{t("termsOfService.section7.sub2.title")}</h3>
              <p>{t("termsOfService.section7.sub2.intro")}</p>
              <ul>
                <li>{t("termsOfService.section7.sub2.illegal")}</li>
                <li>{t("termsOfService.section7.sub2.laundering")}</li>
                <li>{t("termsOfService.section7.sub2.fraud")}</li>
                <li>{t("termsOfService.section7.sub2.manipulation")}</li>
                <li>{t("termsOfService.section7.sub2.ip")}</li>
                <li>{t("termsOfService.section7.sub2.spam")}</li>
              </ul>

              <h2>{t("termsOfService.section8.title")}</h2>

              <h3>{t("termsOfService.section8.sub1.title")}</h3>
              <p>
                {t("termsOfService.section8.sub1.intro")}
              </p>
              <ul>
                <li>{t("termsOfService.section8.sub1.contact")}</li>
                <li>{t("termsOfService.section8.sub1.payment")}</li>
                <li>{t("termsOfService.section8.sub1.transaction")}</li>
                <li>{t("termsOfService.section8.sub1.wallet")}</li>
              </ul>

              <h3>{t("termsOfService.section8.sub2.title")}</h3>
              <p>
                {t("termsOfService.section8.sub2.intro")}
              </p>
              <ul>
                <li>{t("termsOfService.section8.sub2.law")}</li>
                <li>{t("termsOfService.section8.sub2.process")}</li>
                <li>{t("termsOfService.section8.sub2.prevent")}</li>
              </ul>

              <h2>{t("termsOfService.section9.title")}</h2>
              <p>
                {t("termsOfService.section9.content")}
              </p>

              <h2>{t("termsOfService.section10.title")}</h2>
              <p>
                {t("termsOfService.section10.p1")}
              </p>
              <p>
                {t("termsOfService.section10.p2")}
              </p>

              <h2>{t("termsOfService.section11.title")}</h2>
              <p>
                {t("termsOfService.section11.intro")}
              </p>
              <ul>
                <li>{t("termsOfService.section11.violate")}</li>
                <li>{t("termsOfService.section11.suspect")}</li>
                <li>{t("termsOfService.section11.false")}</li>
                <li>{t("termsOfService.section11.authority")}</li>
              </ul>

              <h2>{t("termsOfService.section12.title")}</h2>
              <p>
                {t("termsOfService.section12.content")}
              </p>

              <h2>{t("termsOfService.section13.title")}</h2>
              <p>
                {t("termsOfService.section13.intro")}
              </p>
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
              <p>
                {t("termsOfService.section14.content")}
              </p>

              <hr className="my-8" />

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 dark:bg-blue-900/20 dark:border-blue-600">
                <p className="text-sm">
                  <strong>{t("termsOfService.notice.title")}</strong> {t("termsOfService.notice.content")}
                </p>
              </div>

              <p className="text-sm text-gray-600 text-center mt-8 dark:text-gray-400">
                {t("termsOfService.footer")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
