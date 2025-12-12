'use client';

import { useLanguage } from "@/contexts/language-context";
import Hero from "./hero";
import CryptoList from "@/components/crypto-list";
import Cta from "@/components/cta-alternative";

export default function Cryptocurrencies() {
  const { t } = useLanguage();
  
  return (
    <>
      <Hero />
      <CryptoList />
      <Cta
        heading={t("cryptoPage.cta.title")}
        buttonText={t("cryptoPage.cta.button")}
        buttonLink="/order"
      />
    </>
  );
}
