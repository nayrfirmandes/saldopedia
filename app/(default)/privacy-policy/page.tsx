"use client";

import PageIllustration from "@/components/page-illustration";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-20 pb-12 md:pt-32 md:pb-20">
          {/* Page header */}
          <div className="mx-auto max-w-3xl pb-10 text-center md:pb-12">
            <h1 className="mb-4 py-2 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
              {t("privacyPolicy.header.title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("privacyPolicy.header.lastUpdated")}
            </p>
          </div>

          {/* Privacy Policy content */}
          <div className="mx-auto max-w-3xl">
            <div className="prose max-w-none text-gray-700 prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-gray-900 prose-a:font-medium prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:font-medium prose-strong:text-gray-900 prose-p:mb-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-h2:mb-2 prose-h2:mt-5 prose-h3:mb-1.5 prose-h3:mt-3 dark:text-gray-300 dark:prose-headings:text-gray-100 dark:prose-a:text-blue-400 dark:prose-strong:text-white dark:prose-strong:font-bold">
              
              {/* Commitment Box */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 dark:bg-blue-900/20 dark:border-blue-600">
                <p className="text-sm">
                  <strong>{t("privacyPolicy.commitment.title")}</strong> {t("privacyPolicy.commitment.content")}
                </p>
              </div>

              {/* Section 1: Introduction */}
              <h2>{t("privacyPolicy.section1.title")}</h2>
              <p>{t("privacyPolicy.section1.p1")}</p>
              <p>{t("privacyPolicy.section1.p2")}</p>
              <p>{t("privacyPolicy.section1.p3")}</p>

              {/* Section 2: Information We Collect */}
              <h2>{t("privacyPolicy.section2.title")}</h2>
              <p>{t("privacyPolicy.section2.intro")}</p>
              
              <h3>{t("privacyPolicy.section2.sub1.title")}</h3>
              <p>{t("privacyPolicy.section2.sub1.intro")}</p>
              <ul>
                <li><strong>{t("privacyPolicy.section2.sub1.contact")}</strong> {t("privacyPolicy.section2.sub1.contactDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub1.email")}</strong> {t("privacyPolicy.section2.sub1.emailDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub1.phone")}</strong> {t("privacyPolicy.section2.sub1.phoneDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub1.payment")}</strong> {t("privacyPolicy.section2.sub1.paymentDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub1.transaction")}</strong> {t("privacyPolicy.section2.sub1.transactionDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub1.communication")}</strong> {t("privacyPolicy.section2.sub1.communicationDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub1.newsletter")}</strong> {t("privacyPolicy.section2.sub1.newsletterDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub1.referral")}</strong> {t("privacyPolicy.section2.sub1.referralDesc")}</li>
              </ul>

              <h3>{t("privacyPolicy.section2.sub2.title")}</h3>
              <p>{t("privacyPolicy.section2.sub2.intro")}</p>
              <ul>
                <li><strong>{t("privacyPolicy.section2.sub2.device")}</strong> {t("privacyPolicy.section2.sub2.deviceDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub2.usage")}</strong> {t("privacyPolicy.section2.sub2.usageDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub2.ip")}</strong> {t("privacyPolicy.section2.sub2.ipDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub2.cookie")}</strong> {t("privacyPolicy.section2.sub2.cookieDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub2.session")}</strong> {t("privacyPolicy.section2.sub2.sessionDesc")}</li>
                <li><strong>{t("privacyPolicy.section2.sub2.security")}</strong> {t("privacyPolicy.section2.sub2.logDesc")}</li>
              </ul>

              <h3>{t("privacyPolicy.section2.sub3.title")}</h3>
              <p>{t("privacyPolicy.section2.sub3.intro")}</p>
              <ul>
                <li>{t("privacyPolicy.section2.sub3.provider")}</li>
                <li>{t("privacyPolicy.section2.sub3.blockchain")}</li>
                <li>{t("privacyPolicy.section2.sub3.social")}</li>
                <li>{t("privacyPolicy.section2.sub3.kyc")}</li>
                <li>{t("privacyPolicy.section2.sub3.analytics")}</li>
              </ul>

              <h3>{t("privacyPolicy.section2.sub4.title")}</h3>
              <p>{t("privacyPolicy.section2.sub4.content")}</p>

              {/* Section 3: How We Use Your Information */}
              <h2>{t("privacyPolicy.section3.title")}</h2>
              <p>{t("privacyPolicy.section3.intro")}</p>

              <h3>{t("privacyPolicy.section3.sub1.title")}</h3>
              <p>{t("privacyPolicy.section3.sub1.intro")}</p>
              <ul>
                <li>{t("privacyPolicy.section3.sub1.process")}</li>
                <li>{t("privacyPolicy.section3.sub1.order")}</li>
                <li>{t("privacyPolicy.section3.sub1.sell")}</li>
                <li>{t("privacyPolicy.section3.sub1.withdraw")}</li>
                <li>{t("privacyPolicy.section3.sub1.transfer")}</li>
                <li>{t("privacyPolicy.section3.sub1.notify")}</li>
                <li>{t("privacyPolicy.section3.sub1.support")}</li>
                <li>{t("privacyPolicy.section3.sub1.manage")}</li>
              </ul>

              <h3>{t("privacyPolicy.section3.sub2.title")}</h3>
              <p>{t("privacyPolicy.section3.sub2.intro")}</p>
              <ul>
                <li>{t("privacyPolicy.section3.sub2.detect")}</li>
                <li>{t("privacyPolicy.section3.sub2.verify")}</li>
                <li>{t("privacyPolicy.section3.sub2.access")}</li>
                <li>{t("privacyPolicy.section3.sub2.monitor")}</li>
                <li>{t("privacyPolicy.section3.sub2.protect")}</li>
                <li>{t("privacyPolicy.section3.sub2.block")}</li>
              </ul>

              <h3>{t("privacyPolicy.section3.sub3.title")}</h3>
              <p>{t("privacyPolicy.section3.sub3.intro")}</p>
              <ul>
                <li>{t("privacyPolicy.section3.sub3.comply")}</li>
                <li>{t("privacyPolicy.section3.sub3.report")}</li>
                <li>{t("privacyPolicy.section3.sub3.respond")}</li>
                <li>{t("privacyPolicy.section3.sub3.audit")}</li>
              </ul>

              <h3>{t("privacyPolicy.section3.sub4.title")}</h3>
              <p>{t("privacyPolicy.section3.sub4.intro")}</p>
              <ul>
                <li>{t("privacyPolicy.section3.sub4.analyze")}</li>
                <li>{t("privacyPolicy.section3.sub4.develop")}</li>
                <li>{t("privacyPolicy.section3.sub4.optimize")}</li>
                <li>{t("privacyPolicy.section3.sub4.research")}</li>
                <li>{t("privacyPolicy.section3.sub4.test")}</li>
                <li>{t("privacyPolicy.section3.sub4.measure")}</li>
              </ul>

              <h3>{t("privacyPolicy.section3.sub5.title")}</h3>
              <p>{t("privacyPolicy.section3.sub5.intro")}</p>
              <ul>
                <li>{t("privacyPolicy.section3.sub5.service")}</li>
                <li>{t("privacyPolicy.section3.sub5.transaction")}</li>
                <li>{t("privacyPolicy.section3.sub5.rate")}</li>
                <li>{t("privacyPolicy.section3.sub5.survey")}</li>
                <li>{t("privacyPolicy.section3.sub5.respond")}</li>
                <li>{t("privacyPolicy.section3.sub5.education")}</li>
              </ul>

              {/* Section 4: Legal Basis */}
              <h2>{t("privacyPolicy.section4.title")}</h2>
              <p>{t("privacyPolicy.section4.intro")}</p>

              <h3>{t("privacyPolicy.section4.sub1.title")}</h3>
              <p>{t("privacyPolicy.section4.sub1.content")}</p>

              <h3>{t("privacyPolicy.section4.sub2.title")}</h3>
              <p>{t("privacyPolicy.section4.sub2.content")}</p>

              <h3>{t("privacyPolicy.section4.sub3.title")}</h3>
              <p>{t("privacyPolicy.section4.sub3.content")}</p>

              <h3>{t("privacyPolicy.section4.sub4.title")}</h3>
              <p>{t("privacyPolicy.section4.sub4.content")}</p>

              <h3>{t("privacyPolicy.section4.sub5.title")}</h3>
              <p>{t("privacyPolicy.section4.sub5.content")}</p>

              {/* Section 5: Information Sharing */}
              <h2>{t("privacyPolicy.section5.title")}</h2>
              <p>{t("privacyPolicy.section5.intro")}</p>

              <h3>{t("privacyPolicy.section5.sub1.title")}</h3>
              <p>{t("privacyPolicy.section5.sub1.intro")}</p>
              <ul>
                <li>{t("privacyPolicy.section5.sub1.payment")}</li>
                <li>{t("privacyPolicy.section5.sub1.cloud")}</li>
                <li>{t("privacyPolicy.section5.sub1.email")}</li>
                <li>{t("privacyPolicy.section5.sub1.customer")}</li>
                <li>{t("privacyPolicy.section5.sub1.analytics")}</li>
              </ul>
              <p>{t("privacyPolicy.section5.sub1.footer")}</p>

              <h3>{t("privacyPolicy.section5.sub2.title")}</h3>
              <p>{t("privacyPolicy.section5.sub2.intro")}</p>
              <ul>
                <li>{t("privacyPolicy.section5.sub2.court")}</li>
                <li>{t("privacyPolicy.section5.sub2.law")}</li>
                <li>{t("privacyPolicy.section5.sub2.aml")}</li>
                <li>{t("privacyPolicy.section5.sub2.tax")}</li>
                <li>{t("privacyPolicy.section5.sub2.protect")}</li>
                <li>{t("privacyPolicy.section5.sub2.emergency")}</li>
              </ul>

              <h3>{t("privacyPolicy.section5.sub3.title")}</h3>
              <p>{t("privacyPolicy.section5.sub3.content")}</p>

              <h3>{t("privacyPolicy.section5.sub4.title")}</h3>
              <p>{t("privacyPolicy.section5.sub4.content")}</p>

              <h3>{t("privacyPolicy.section5.sub5.title")}</h3>
              <p>{t("privacyPolicy.section5.sub5.content")}</p>

              {/* Section 6: Data Security */}
              <h2>{t("privacyPolicy.section6.title")}</h2>
              <p>{t("privacyPolicy.section6.intro")}</p>

              <h3>{t("privacyPolicy.section6.sub1.title")}</h3>
              <p>{t("privacyPolicy.section6.sub1.intro")}</p>
              <ul>
                <li><strong>{t("privacyPolicy.section6.sub1.encryption")}</strong> {t("privacyPolicy.section6.sub1.encryptionDesc")}</li>
                <li><strong>{t("privacyPolicy.section6.sub1.storage")}</strong> {t("privacyPolicy.section6.sub1.storageDesc")}</li>
                <li><strong>{t("privacyPolicy.section6.sub1.firewall")}</strong> {t("privacyPolicy.section6.sub1.firewallDesc")}</li>
                <li><strong>{t("privacyPolicy.section6.sub1.ddos")}</strong> {t("privacyPolicy.section6.sub1.ddosDesc")}</li>
                <li><strong>{t("privacyPolicy.section6.sub1.backup")}</strong> {t("privacyPolicy.section6.sub1.backupDesc")}</li>
              </ul>

              <h3>{t("privacyPolicy.section6.sub2.title")}</h3>
              <p>{t("privacyPolicy.section6.sub2.intro")}</p>
              <ul>
                <li><strong>{t("privacyPolicy.section6.sub2.access")}</strong> {t("privacyPolicy.section6.sub2.accessDesc")}</li>
                <li><strong>{t("privacyPolicy.section6.sub2.session")}</strong> {t("privacyPolicy.section6.sub2.sessionDesc")}</li>
                <li><strong>{t("privacyPolicy.section6.sub2.password")}</strong> {t("privacyPolicy.section6.sub2.passwordDesc")}</li>
                <li><strong>{t("privacyPolicy.section6.sub2.verification")}</strong> {t("privacyPolicy.section6.sub2.verificationDesc")}</li>
              </ul>

              <h3>{t("privacyPolicy.section6.sub3.title")}</h3>
              <p>{t("privacyPolicy.section6.sub3.intro")}</p>
              <ul>
                <li><strong>{t("privacyPolicy.section6.sub3.monitoring")}</strong> {t("privacyPolicy.section6.sub3.monitoringDesc")}</li>
                <li><strong>{t("privacyPolicy.section6.sub3.logging")}</strong> {t("privacyPolicy.section6.sub3.loggingDesc")}</li>
                <li><strong>{t("privacyPolicy.section6.sub3.alert")}</strong> {t("privacyPolicy.section6.sub3.alertDesc")}</li>
              </ul>

              <h3>{t("privacyPolicy.section6.sub4.title")}</h3>
              <p>{t("privacyPolicy.section6.sub4.p1")}</p>
              <p>{t("privacyPolicy.section6.sub4.p2")}</p>
              <p>{t("privacyPolicy.section6.sub4.p3")}</p>

              {/* Section 7: Data Retention */}
              <h2>{t("privacyPolicy.section7.title")}</h2>
              <p>{t("privacyPolicy.section7.intro")}</p>

              <h3>{t("privacyPolicy.section7.sub1.title")}</h3>
              <p>{t("privacyPolicy.section7.sub1.content")}</p>

              <h3>{t("privacyPolicy.section7.sub2.title")}</h3>
              <p>{t("privacyPolicy.section7.sub2.intro")}</p>
              <ul>
                <li><strong>{t("privacyPolicy.section7.sub2.transaction")}</strong> {t("privacyPolicy.section7.sub2.transactionDesc")}</li>
                <li><strong>{t("privacyPolicy.section7.sub2.account")}</strong> {t("privacyPolicy.section7.sub2.accountDesc")}</li>
                <li><strong>{t("privacyPolicy.section7.sub2.communication")}</strong> {t("privacyPolicy.section7.sub2.communicationDesc")}</li>
                <li><strong>{t("privacyPolicy.section7.sub2.security")}</strong> {t("privacyPolicy.section7.sub2.securityDesc")}</li>
                <li><strong>{t("privacyPolicy.section7.sub2.marketing")}</strong> {t("privacyPolicy.section7.sub2.marketingDesc")}</li>
                <li><strong>{t("privacyPolicy.section7.sub2.legal")}</strong> {t("privacyPolicy.section7.sub2.legalDesc")}</li>
              </ul>

              <h3>{t("privacyPolicy.section7.sub3.title")}</h3>
              <p>{t("privacyPolicy.section7.sub3.content")}</p>

              <h3>{t("privacyPolicy.section7.sub4.title")}</h3>
              <p>{t("privacyPolicy.section7.sub4.content")}</p>

              {/* Section 8: Your Rights */}
              <h2>{t("privacyPolicy.section8.title")}</h2>
              <p>{t("privacyPolicy.section8.intro")}</p>

              <h3>{t("privacyPolicy.section8.sub1.title")}</h3>
              <p>{t("privacyPolicy.section8.sub1.content")}</p>

              <h3>{t("privacyPolicy.section8.sub2.title")}</h3>
              <p>{t("privacyPolicy.section8.sub2.content")}</p>

              <h3>{t("privacyPolicy.section8.sub3.title")}</h3>
              <p>{t("privacyPolicy.section8.sub3.content")}</p>

              <h3>{t("privacyPolicy.section8.sub4.title")}</h3>
              <p>{t("privacyPolicy.section8.sub4.content")}</p>

              <h3>{t("privacyPolicy.section8.sub5.title")}</h3>
              <p>{t("privacyPolicy.section8.sub5.content")}</p>

              <h3>{t("privacyPolicy.section8.sub6.title")}</h3>
              <p>{t("privacyPolicy.section8.sub6.content")}</p>

              <h3>{t("privacyPolicy.section8.sub7.title")}</h3>
              <p>{t("privacyPolicy.section8.sub7.content")}</p>

              <h3>{t("privacyPolicy.section8.sub8.title")}</h3>
              <p>{t("privacyPolicy.section8.sub8.content")}</p>

              <h3>{t("privacyPolicy.section8.sub9.title")}</h3>
              <p>{t("privacyPolicy.section8.sub9.intro")}</p>
              <ul>
                <li><strong>WhatsApp:</strong> <a href="https://wa.me/628119666620?text=Halo%20Saldopedia%2C%20saya%20ingin%20menggunakan%20hak%20privasi%20saya" target="_blank" rel="noopener noreferrer">08119666620</a></li>
              </ul>
              <p>{t("privacyPolicy.section8.sub9.process")}</p>
              <p>{t("privacyPolicy.section8.sub9.footer")}</p>

              {/* Section 9: Cookies */}
              <h2>{t("privacyPolicy.section9.title")}</h2>
              <p>
                {t("privacyPolicy.section9.intro")}{" "}
                <Link href="/cookie-policy" className="text-blue-600 hover:underline dark:text-blue-400">
                  {t("privacyPolicy.section9.linkText")}
                </Link>{t("privacyPolicy.section9.kami")}
              </p>

              <h3>{t("privacyPolicy.section9.sub1.title")}</h3>
              <ul>
                <li><strong>{t("privacyPolicy.section9.sub1.necessary")}</strong> {t("privacyPolicy.section9.sub1.necessaryDesc")}</li>
                <li><strong>{t("privacyPolicy.section9.sub1.preference")}</strong> {t("privacyPolicy.section9.sub1.preferenceDesc")}</li>
                <li><strong>{t("privacyPolicy.section9.sub1.analytics")}</strong> {t("privacyPolicy.section9.sub1.analyticsDesc")}</li>
                <li><strong>{t("privacyPolicy.section9.sub1.marketing")}</strong> {t("privacyPolicy.section9.sub1.marketingDesc")}</li>
              </ul>

              <h3>{t("privacyPolicy.section9.sub2.title")}</h3>
              <p>{t("privacyPolicy.section9.sub2.content")}</p>

              {/* Section 10: Children's Privacy */}
              <h2>{t("privacyPolicy.section10.title")}</h2>
              <p>{t("privacyPolicy.section10.content")}</p>

              {/* Section 11: International Data Transfers */}
              <h2>{t("privacyPolicy.section11.title")}</h2>
              <p>{t("privacyPolicy.section11.p1")}</p>
              <p>{t("privacyPolicy.section11.p2")}</p>
              <p>{t("privacyPolicy.section11.p3")}</p>

              {/* Section 12: Links to Third-Party Websites */}
              <h2>{t("privacyPolicy.section12.title")}</h2>
              <p>{t("privacyPolicy.section12.p1")}</p>
              <p>{t("privacyPolicy.section12.p2")}</p>

              {/* Section 13: Policy Changes */}
              <h2>{t("privacyPolicy.section13.title")}</h2>
              <p>{t("privacyPolicy.section13.p1")}</p>
              <p>{t("privacyPolicy.section13.p2")}</p>
              <p>{t("privacyPolicy.section13.p3")}</p>

              {/* Section 14: Contact */}
              <h2>{t("privacyPolicy.section14.title")}</h2>
              <p>{t("privacyPolicy.section14.intro")}</p>
              <ul>
                <li>
                  <strong>WhatsApp Customer Service:</strong>{" "}
                  <a href="https://wa.me/628119666620?text=Halo%20Saldopedia%2C%20saya%20punya%20pertanyaan%20tentang%20kebijakan%20privasi" target="_blank" rel="noopener noreferrer">
                    08119666620
                  </a>
                </li>
                <li>
                  <strong>{t("privacyPolicy.section14.hours")}</strong> {t("privacyPolicy.section14.hoursValue")}
                </li>
              </ul>

              <hr className="my-8" />

              <p className="text-sm text-gray-600 text-center mt-8 dark:text-gray-400">
                {t("privacyPolicy.footer")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
