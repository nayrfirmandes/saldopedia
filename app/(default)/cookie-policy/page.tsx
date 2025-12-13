"use client";

import PageIllustration from "@/components/page-illustration";
import { useLanguage } from "@/contexts/language-context";
import { useCookieSettings } from "@/components/cookie-banner";
import Link from "next/link";

export default function CookiePolicy() {
  const { t } = useLanguage();
  const { openSettings } = useCookieSettings();
  
  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-20 pb-12 md:pt-32 md:pb-20">
          {/* Page header */}
          <div className="mx-auto max-w-3xl pb-10 text-center md:pb-12">
            <h1 className="mb-4 py-2 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
              {t("cookiePolicy.header.title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("cookiePolicy.header.lastUpdated")}
            </p>
          </div>

          {/* Policy content */}
          <div className="mx-auto max-w-3xl">
            <div className="prose max-w-none text-gray-700 prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-gray-900 prose-a:font-medium prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:font-medium prose-strong:text-gray-900 prose-p:mb-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-h2:mb-2 prose-h2:mt-5 prose-h3:mb-1.5 prose-h3:mt-3 dark:text-gray-300 dark:prose-headings:text-gray-100 dark:prose-a:text-blue-400 dark:prose-strong:text-white dark:prose-strong:font-bold">
              
              {/* Commitment Box */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 dark:bg-blue-900/20 dark:border-blue-600">
                <p className="text-sm">
                  <strong>{t("cookiePolicy.commitment.title")}</strong> {t("cookiePolicy.commitment.content")}
                </p>
              </div>

              {/* Section 1: Introduction */}
              <h2>{t("cookiePolicy.section1.title")}</h2>
              <p>{t("cookiePolicy.section1.p1")}</p>
              <p>{t("cookiePolicy.section1.p2")}</p>
              <p>
                {t("cookiePolicy.section1.p3")}{" "}
                {t("cookiePolicy.section1.privacyLink") || "Kebijakan ini melengkapi"}{" "}
                <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                  {t("common.privacyPolicy") || "Kebijakan Privasi"}
                </Link>{" "}
                {t("cookiePolicy.section1.privacyLinkEnd") || "kami."}
              </p>

              {/* Section 2: What Are Cookies */}
              <h2>{t("cookiePolicy.section2.title")}</h2>
              
              <h3>{t("cookiePolicy.section2.sub1.title")}</h3>
              <p>{t("cookiePolicy.section2.sub1.content")}</p>

              <h3>{t("cookiePolicy.section2.sub2.title")}</h3>
              <ul>
                <li><strong>{t("cookiePolicy.section2.sub2.firstParty")}</strong> {t("cookiePolicy.section2.sub2.firstPartyDesc")}</li>
                <li><strong>{t("cookiePolicy.section2.sub2.thirdParty")}</strong> {t("cookiePolicy.section2.sub2.thirdPartyDesc")}</li>
              </ul>

              <h3>{t("cookiePolicy.section2.sub3.title")}</h3>
              <p>{t("cookiePolicy.section2.sub3.intro")}</p>
              <ul>
                <li>{t("cookiePolicy.section2.sub3.localStorage")}</li>
                <li>{t("cookiePolicy.section2.sub3.pixel")}</li>
                <li>{t("cookiePolicy.section2.sub3.fingerprint")}</li>
                <li>{t("cookiePolicy.section2.sub3.sdk")}</li>
              </ul>

              {/* Section 3: Purposes */}
              <h2>{t("cookiePolicy.section3.title")}</h2>
              <p>{t("cookiePolicy.section3.intro")}</p>

              <h3>{t("cookiePolicy.section3.sub1.title")}</h3>
              <p>{t("cookiePolicy.section3.sub1.content")}</p>

              <h3>{t("cookiePolicy.section3.sub2.title")}</h3>
              <p>{t("cookiePolicy.section3.sub2.content")}</p>

              <h3>{t("cookiePolicy.section3.sub3.title")}</h3>
              <p>{t("cookiePolicy.section3.sub3.content")}</p>

              <h3>{t("cookiePolicy.section3.sub4.title")}</h3>
              <p>{t("cookiePolicy.section3.sub4.content")}</p>

              <h3>{t("cookiePolicy.section3.sub5.title")}</h3>
              <p>{t("cookiePolicy.section3.sub5.content")}</p>

              {/* Section 4: Cookie Categories */}
              <h2>{t("cookiePolicy.section4.title")}</h2>
              <p>{t("cookiePolicy.section4.intro")}</p>

              <h3>{t("cookiePolicy.section4.necessary.title")}</h3>
              <p>{t("cookiePolicy.section4.necessary.description")}</p>
              <p><strong>{t("cookiePolicy.section4.necessary.examplesTitle")}</strong></p>
              <ul>
                <li>{t("cookiePolicy.section4.necessary.examples.session")}</li>
                <li>{t("cookiePolicy.section4.necessary.examples.consent")}</li>
                <li>{t("cookiePolicy.section4.necessary.examples.security")}</li>
                <li>{t("cookiePolicy.section4.necessary.examples.csrf")}</li>
                <li>{t("cookiePolicy.section4.necessary.examples.load")}</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("cookiePolicy.section4.necessary.retention")}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("cookiePolicy.section4.necessary.consentRequired")}</strong> {t("cookiePolicy.section4.necessary.consentAnswer")}
              </p>

              <h3>{t("cookiePolicy.section4.preference.title")}</h3>
              <p>{t("cookiePolicy.section4.preference.description")}</p>
              <p><strong>{t("cookiePolicy.section4.preference.examplesTitle")}</strong></p>
              <ul>
                <li>{t("cookiePolicy.section4.preference.examples.language")}</li>
                <li>{t("cookiePolicy.section4.preference.examples.theme")}</li>
                <li>{t("cookiePolicy.section4.preference.examples.regional")}</li>
                <li>{t("cookiePolicy.section4.preference.examples.accessibility")}</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("cookiePolicy.section4.preference.retention")}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("cookiePolicy.section4.preference.consentRequired")}</strong> {t("cookiePolicy.section4.preference.consentAnswer")}
              </p>

              <h3>{t("cookiePolicy.section4.analytics.title")}</h3>
              <p>{t("cookiePolicy.section4.analytics.description")}</p>
              <p><strong>{t("cookiePolicy.section4.analytics.examplesTitle")}</strong></p>
              <ul>
                <li>{t("cookiePolicy.section4.analytics.examples.visitors")}</li>
                <li>{t("cookiePolicy.section4.analytics.examples.source")}</li>
                <li>{t("cookiePolicy.section4.analytics.examples.behavior")}</li>
                <li>{t("cookiePolicy.section4.analytics.examples.performance")}</li>
                <li>{t("cookiePolicy.section4.analytics.examples.googleAnalytics")}</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("cookiePolicy.section4.analytics.retention")}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("cookiePolicy.section4.analytics.consentRequired")}</strong> {t("cookiePolicy.section4.analytics.consentAnswer")}
              </p>

              <h3>{t("cookiePolicy.section4.marketing.title")}</h3>
              <p>{t("cookiePolicy.section4.marketing.description")}</p>
              <p><strong>{t("cookiePolicy.section4.marketing.examplesTitle")}</strong></p>
              <ul>
                <li>{t("cookiePolicy.section4.marketing.examples.relevantAds")}</li>
                <li>{t("cookiePolicy.section4.marketing.examples.retargeting")}</li>
                <li>{t("cookiePolicy.section4.marketing.examples.conversion")}</li>
                <li>{t("cookiePolicy.section4.marketing.examples.social")}</li>
                <li>{t("cookiePolicy.section4.marketing.examples.thirdParty")}</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t("cookiePolicy.section4.marketing.retention")}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("cookiePolicy.section4.marketing.consentRequired")}</strong> {t("cookiePolicy.section4.marketing.consentAnswer")}
              </p>

              {/* Section 5: Third-Party Cookies */}
              <h2>{t("cookiePolicy.section5.title")}</h2>
              <p>{t("cookiePolicy.section5.intro")}</p>

              <h3>{t("cookiePolicy.section5.sub1.title")}</h3>
              <p>{t("cookiePolicy.section5.sub1.content")}</p>

              <h3>{t("cookiePolicy.section5.sub2.title")}</h3>
              <p>{t("cookiePolicy.section5.sub2.content")}</p>

              <h3>{t("cookiePolicy.section5.sub3.title")}</h3>
              <p>{t("cookiePolicy.section5.sub3.content")}</p>

              <h3>{t("cookiePolicy.section5.sub4.title")}</h3>
              <p>{t("cookiePolicy.section5.sub4.intro")}</p>
              <ul>
                <li>
                  <strong>{t("cookiePolicy.section5.sub4.vendors.google")}</strong>{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    policies.google.com/privacy
                  </a>
                </li>
                <li>
                  <strong>{t("cookiePolicy.section5.sub4.vendors.googleAnalytics")}</strong>{" "}
                  <a href="https://support.google.com/analytics" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    support.google.com/analytics
                  </a>
                </li>
                <li>
                  <strong>{t("cookiePolicy.section5.sub4.vendors.facebook")}</strong>{" "}
                  <a href="https://www.facebook.com/policies/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    facebook.com/policies/cookies
                  </a>
                </li>
              </ul>

              {/* Section 6: How to Control Cookies */}
              <h2>{t("cookiePolicy.section6.title")}</h2>
              <p>{t("cookiePolicy.section6.intro")}</p>

              <p>
                <button
                  onClick={openSettings}
                  className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {t("cookieBanner.manageSettings")}
                </button>
              </p>

              <h3>{t("cookiePolicy.section6.sub1.title")}</h3>
              <p>{t("cookiePolicy.section6.sub1.content")}</p>

              <h3>{t("cookiePolicy.section6.sub2.title")}</h3>
              <p>{t("cookiePolicy.section6.sub2.intro")}</p>
              <ul>
                <li>
                  <strong>Google Chrome:</strong> {t("cookiePolicy.section6.sub2.chrome")}{" "}
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    support.google.com/chrome
                  </a>
                </li>
                <li>
                  <strong>Mozilla Firefox:</strong> {t("cookiePolicy.section6.sub2.firefox")}{" "}
                  <a href="https://support.mozilla.org/id/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    support.mozilla.org
                  </a>
                </li>
                <li>
                  <strong>Apple Safari:</strong> {t("cookiePolicy.section6.sub2.safari")}{" "}
                  <a href="https://support.apple.com/id-id/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    support.apple.com/safari
                  </a>
                </li>
                <li>
                  <strong>Microsoft Edge:</strong> {t("cookiePolicy.section6.sub2.edge")}{" "}
                  <a href="https://support.microsoft.com/id-id/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    support.microsoft.com/edge
                  </a>
                </li>
              </ul>

              <h3>{t("cookiePolicy.section6.sub3.title")}</h3>
              <p>{t("cookiePolicy.section6.sub3.content")}</p>

              <h3>{t("cookiePolicy.section6.sub4.title")}</h3>
              <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 dark:bg-yellow-900/20 dark:border-yellow-600">
                {t("cookiePolicy.section6.sub4.content")}
              </p>

              {/* Section 7: Cookie Duration */}
              <h2>{t("cookiePolicy.section7.title")}</h2>
              <p>{t("cookiePolicy.section7.intro")}</p>

              <h3>{t("cookiePolicy.section7.sub1.title")}</h3>
              <p>{t("cookiePolicy.section7.sub1.content")}</p>

              <h3>{t("cookiePolicy.section7.sub2.title")}</h3>
              <p>{t("cookiePolicy.section7.sub2.content")}</p>

              <h3>{t("cookiePolicy.section7.sub3.title")}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left border-b dark:border-gray-700">{t("cookiePolicy.section7.sub3.table.category")}</th>
                      <th className="px-4 py-2 text-left border-b dark:border-gray-700">{t("cookiePolicy.section7.sub3.table.duration")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b dark:border-gray-700" colSpan={2}>{t("cookiePolicy.section7.sub3.table.essential")}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b dark:border-gray-700" colSpan={2}>{t("cookiePolicy.section7.sub3.table.preference")}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b dark:border-gray-700" colSpan={2}>{t("cookiePolicy.section7.sub3.table.analytics")}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 dark:border-gray-700" colSpan={2}>{t("cookiePolicy.section7.sub3.table.marketing")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 8: Policy Updates */}
              <h2>{t("cookiePolicy.section8.title")}</h2>
              <p>{t("cookiePolicy.section8.p1")}</p>
              <p>{t("cookiePolicy.section8.p2")}</p>
              <p>{t("cookiePolicy.section8.p3")}</p>

              {/* Section 9: Your Rights */}
              <h2>{t("cookiePolicy.section9.title")}</h2>
              <p>{t("cookiePolicy.section9.p1")}</p>
              <p>{t("cookiePolicy.section9.p2")}</p>

              {/* Section 10: Contact */}
              <h2>{t("cookiePolicy.section10.title")}</h2>
              <p>{t("cookiePolicy.section10.intro")}</p>
              <ul>
                <li><strong>Email:</strong> support@saldopedia.com</li>
                <li>
                  <strong>{t("cookiePolicy.section10.whatsapp")}</strong>{" "}
                  <a href="https://wa.me/628119666620?text=Halo%20Saldopedia%2C%20saya%20punya%20pertanyaan%20tentang%20cookie%20policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    +62 811 9666 620
                  </a>
                </li>
                <li>{t("cookiePolicy.section10.hours")}</li>
                <li>{t("cookiePolicy.section10.response")}</li>
              </ul>

              <p className="mt-6">
                {t("cookiePolicy.relatedInfo.text") || "Lihat juga"}{" "}
                <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                  {t("common.privacyPolicy") || "Kebijakan Privasi"}
                </Link>{" "}
                {t("cookiePolicy.relatedInfo.and") || "dan"}{" "}
                <Link href="/terms-of-service" className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                  {t("common.termsOfService") || "Syarat dan Ketentuan"}
                </Link>{" "}
                {t("cookiePolicy.relatedInfo.kami") || "kami untuk informasi lengkap."}
              </p>

              <hr className="my-8" />

              <p className="text-sm text-gray-600 text-center dark:text-gray-400">
                {t("cookiePolicy.footer")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
