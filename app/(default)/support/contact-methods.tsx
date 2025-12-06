"use client";

import { useLanguage } from "@/contexts/language-context";

export default function ContactMethods() {
  const { t } = useLanguage();
  const whatsappIcon = (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );

  const emailIcon = (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  );

  const contactChannels = [
    {
      icon: whatsappIcon,
      title: t("supportPage.contactMethods.whatsapp.title"),
      description: t("supportPage.contactMethods.whatsapp.description"),
      detail: t("supportPage.contactMethods.whatsapp.detail"),
      subDetail: t("supportPage.contactMethods.whatsapp.number"),
      link: "https://wa.me/628119666620?text=Halo%20Saldopedia,%20saya%20butuh%20bantuan",
      available: t("supportPage.contactMethods.whatsapp.available"),
      bgColor: "bg-green-50 dark:bg-green-500/20",
      textColor: "text-green-600 dark:text-green-400",
      hoverBgColor: "group-hover:bg-green-100 dark:group-hover:bg-green-500/30",
    },
    {
      icon: emailIcon,
      title: t("supportPage.contactMethods.email.title"),
      description: t("supportPage.contactMethods.email.description"),
      detail: t("supportPage.contactMethods.email.detail"),
      subDetail: t("supportPage.contactMethods.email.address"),
      link: "mailto:support@saldopedia.com",
      available: t("supportPage.contactMethods.email.available"),
      bgColor: "bg-blue-50 dark:bg-blue-500/20",
      textColor: "text-blue-600 dark:text-blue-400",
      hoverBgColor: "group-hover:bg-blue-100 dark:group-hover:bg-blue-500/30",
    },
  ];

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          <div className="mx-auto max-w-3xl pb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold dark:text-gray-100">
              {t("supportPage.contactMethods.title")} <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-500">Saldopedia</span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t("supportPage.contactMethods.subtitle")}
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {contactChannels.map((channel, index) => (
              <a
                key={index}
                href={channel.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/20"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${channel.bgColor} ${channel.textColor} transition-colors ${channel.hoverBgColor}`}>
                  {channel.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">{channel.title}</h3>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">{channel.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{channel.detail}</p>
                <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">{channel.subDetail}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {channel.available}
                  </span>
                  <svg className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
