"use client";

import { useState } from "react";
import Hero from "./hero";
import ContactMethods from "./contact-methods";
import OperatingHours from "./operating-hours";
import ServiceGuarantee from "./service-guarantee";
import CommonIssues from "./common-issues";
import Faqs from "@/components/faqs-02";
import QuickLinks from "./quick-links";
import Cta from "@/components/cta-alternative";
import { useLanguage } from "@/contexts/language-context";

export default function SupportContent() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Hero onSearch={setSearchQuery} />
      <Faqs searchQuery={searchQuery} onSearch={setSearchQuery} />
      {!searchQuery && (
        <>
          <ContactMethods />
          <OperatingHours />
          <ServiceGuarantee />
          <CommonIssues />
          <QuickLinks />
        </>
      )}
      <Cta
        className="overflow-hidden"
        heading={t("supportPage.cta.heading")}
        buttonText={t("supportPage.cta.button")}
        buttonLink="https://wa.me/628119666620"
      />
    </>
  );
}
