import { Metadata } from "next";
import PayPalContent from "./paypal-content";
import { ServiceSchema, BreadcrumbSchema } from "@/components/seo";

export const metadata: Metadata = {
  title: "Jual Beli Saldo PayPal Indonesia - Rate Terbaik 2024 | Saldopedia",
  description: "Jual beli saldo PayPal dengan rate terbaik mulai Rp 12.000/USD. Proses 5-15 menit, transfer ke semua bank & e-wallet Indonesia. Lebih cepat dari Triv, JualSaldo, Tukardana.",
  keywords: [
    "jual saldo paypal",
    "beli paypal indonesia",
    "tukar paypal ke rupiah",
    "convert paypal ke bank",
    "jual beli paypal murah",
    "paypal exchanger indonesia",
    "tukar paypal cepat",
    "jual paypal rate tinggi",
    "beli saldo paypal legal",
    "paypal to rupiah",
    "withdraw paypal indonesia",
    "top up paypal murah",
    "jasa convert paypal",
    "exchanger paypal terpercaya"
  ],
  alternates: {
    canonical: "https://saldopedia.com/paypal",
  },
  openGraph: {
    title: "Jual Beli Saldo PayPal - Rate Terbaik Indonesia | Saldopedia",
    description: "Convert PayPal ke Rupiah dengan rate tinggi. Proses 5-15 menit ke semua bank & e-wallet.",
    url: "https://saldopedia.com/paypal",
    type: "website",
  },
};

export default function PayPalPage() {
  return (
    <>
      <ServiceSchema
        name="Jual Beli Saldo PayPal Indonesia"
        description="Layanan jual beli dan convert saldo PayPal ke Rupiah dengan rate terbaik. Proses 5-15 menit, transfer ke semua bank dan e-wallet Indonesia."
        url="https://saldopedia.com/paypal"
        serviceType="CurrencyExchange"
      />
      <BreadcrumbSchema
        items={[
          { name: "Beranda", url: "https://saldopedia.com" },
          { name: "PayPal", url: "https://saldopedia.com/paypal" }
        ]}
      />
      <PayPalContent />
    </>
  );
}
