"use client";

import PageIllustration from "@/components/page-illustration";
import { useLanguage } from "@/contexts/language-context";

export default function CookiePolicy() {
  const { t } = useLanguage();
  
  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-20 pb-12 md:pt-32 md:pb-20">
          {/* Page header */}
          <div className="mx-auto max-w-3xl pb-10 text-center md:pb-12">
            <h1 className="mb-4 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
              {t("cookiePolicy.header.title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("cookiePolicy.header.lastUpdated")}
            </p>
          </div>

          {/* Policy content */}
          <div className="mx-auto max-w-3xl">
            <div className="prose max-w-none text-gray-700 prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-gray-900 prose-a:font-medium prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline prose-strong:font-medium prose-strong:text-gray-900 prose-p:mb-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-h2:mb-2 prose-h2:mt-5 prose-h3:mb-1.5 prose-h3:mt-3 dark:text-gray-300 dark:prose-headings:text-gray-100 dark:prose-a:text-blue-400 dark:prose-strong:text-white dark:prose-strong:font-bold">
              <h2>{t("cookiePolicy.whatIs.title")}</h2>
              <p>
                {t("cookiePolicy.whatIs.content")}
              </p>

              <h2>{t("cookiePolicy.howWeUse.title")}</h2>
              <p>
                {t("cookiePolicy.howWeUse.content")}
              </p>

              <h2>{t("cookiePolicy.types.title")}</h2>

              <h3>{t("cookiePolicy.types.necessary.title")}</h3>
              <p>
                {t("cookiePolicy.types.necessary.description")}
              </p>
              <p><strong>{t("cookiePolicy.types.necessary.examplesTitle")}</strong></p>
              <ul>
                <li>{t("cookiePolicy.types.necessary.examples.consent")}</li>
                <li>{t("cookiePolicy.types.necessary.examples.session")}</li>
                <li>{t("cookiePolicy.types.necessary.examples.security")}</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("cookiePolicy.types.necessary.consentRequired")}</strong> {t("cookiePolicy.types.necessary.consentAnswer")}
              </p>

              <h3>{t("cookiePolicy.types.preference.title")}</h3>
              <p>
                {t("cookiePolicy.types.preference.description")}
              </p>
              <p><strong>{t("cookiePolicy.types.preference.examplesTitle")}</strong></p>
              <ul>
                <li>{t("cookiePolicy.types.preference.examples.language")}</li>
                <li>{t("cookiePolicy.types.preference.examples.theme")}</li>
                <li>{t("cookiePolicy.types.preference.examples.regional")}</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("cookiePolicy.types.preference.consentRequired")}</strong> {t("cookiePolicy.types.preference.consentAnswer")}
              </p>

              <h3>{t("cookiePolicy.types.analytics.title")}</h3>
              <p>
                {t("cookiePolicy.types.analytics.description")}
              </p>
              <p><strong>{t("cookiePolicy.types.analytics.examplesTitle")}</strong></p>
              <ul>
                <li>{t("cookiePolicy.types.analytics.examples.visitors")}</li>
                <li>{t("cookiePolicy.types.analytics.examples.popular")}</li>
                <li>{t("cookiePolicy.types.analytics.examples.effectiveness")}</li>
                <li>{t("cookiePolicy.types.analytics.examples.googleAnalytics")}</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("cookiePolicy.types.analytics.consentRequired")}</strong> {t("cookiePolicy.types.analytics.consentAnswer")}
              </p>

              <h3>{t("cookiePolicy.types.marketing.title")}</h3>
              <p>
                {t("cookiePolicy.types.marketing.description")}
              </p>
              <p><strong>{t("cookiePolicy.types.marketing.examplesTitle")}</strong></p>
              <ul>
                <li>{t("cookiePolicy.types.marketing.examples.relevantAds")}</li>
                <li>{t("cookiePolicy.types.marketing.examples.effectiveness")}</li>
                <li>{t("cookiePolicy.types.marketing.examples.retargeting")}</li>
                <li>{t("cookiePolicy.types.marketing.examples.thirdParty")}</li>
              </ul>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t("cookiePolicy.types.marketing.consentRequired")}</strong> {t("cookiePolicy.types.marketing.consentAnswer")}
              </p>

              <h2>{t("cookiePolicy.thirdParty.title")}</h2>
              <p>
                {t("cookiePolicy.thirdParty.description")}
              </p>
              <ul>
                <li>
                  <strong>{t("cookiePolicy.thirdParty.vendors.googleAnalytics")}</strong>{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    policies.google.com/privacy
                  </a>
                </li>
                <li>
                  <strong>{t("cookiePolicy.thirdParty.vendors.facebook")}</strong>{" "}
                  <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    facebook.com/privacy/policy
                  </a>
                </li>
              </ul>

              <h2>{t("cookiePolicy.control.title")}</h2>
              <p>
                {t("cookiePolicy.control.intro")}
              </p>

              <h3>{t("cookiePolicy.control.banner.title")}</h3>
              <p>
                {t("cookiePolicy.control.banner.description")}
              </p>

              <h3>{t("cookiePolicy.control.browser.title")}</h3>
              <p>
                {t("cookiePolicy.control.browser.description")}
              </p>
              <ul>
                <li>
                  <strong>{t("cookiePolicy.control.browser.browsers.chrome")}</strong>{" "}
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    support.google.com/chrome/answer/95647
                  </a>
                </li>
                <li>
                  <strong>{t("cookiePolicy.control.browser.browsers.firefox")}</strong>{" "}
                  <a href="https://support.mozilla.org/id/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    support.mozilla.org
                  </a>
                </li>
                <li>
                  <strong>{t("cookiePolicy.control.browser.browsers.safari")}</strong>{" "}
                  <a href="https://support.apple.com/id-id/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    support.apple.com/safari
                  </a>
                </li>
                <li>
                  <strong>{t("cookiePolicy.control.browser.browsers.edge")}</strong>{" "}
                  <a href="https://support.microsoft.com/id-id/microsoft-edge/menghapus-cookie-di-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    support.microsoft.com/edge
                  </a>
                </li>
              </ul>

              <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 dark:bg-yellow-900/20 dark:border-yellow-600">
                <strong>{t("cookiePolicy.control.note")}</strong> {t("cookiePolicy.control.noteContent")}
              </p>

              <h2>{t("cookiePolicy.duration.title")}</h2>
              <p>
                {t("cookiePolicy.duration.intro")}
              </p>
              <ul>
                <li>
                  <strong>{t("cookiePolicy.duration.session")}</strong> {t("cookiePolicy.duration.sessionDesc")}
                </li>
                <li>
                  <strong>{t("cookiePolicy.duration.persistent")}</strong> {t("cookiePolicy.duration.persistentDesc")}
                </li>
              </ul>

              <h2>{t("cookiePolicy.updates.title")}</h2>
              <p>
                {t("cookiePolicy.updates.content")}
              </p>

              <h2>{t("cookiePolicy.contact.title")}</h2>
              <p>
                {t("cookiePolicy.contact.intro")}
              </p>
              <ul>
                <li>
                  <strong>{t("cookiePolicy.contact.labels.whatsapp")}</strong>{" "}
                  <a href="https://wa.me/628119666620?text=Halo%20Saldopedia%2C%20saya%20punya%20pertanyaan%20tentang%20cookie%20policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    08119666620
                  </a>
                </li>
              </ul>

              <hr className="my-8" />

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("cookiePolicy.footer")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
