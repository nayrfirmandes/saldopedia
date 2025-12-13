import { Metadata } from "next";
import SkrillContent from "./skrill-content";
import { ServiceSchema, BreadcrumbSchema } from "@/components/seo";

export const metadata: Metadata = {
  title: "Jual Beli Saldo Skrill Indonesia - Rate Terbaik 2024 | Saldopedia",
  description: "Jual beli saldo Skrill dengan rate terbaik mulai Rp 12.000/USD. Proses 5-15 menit, transfer ke semua bank & e-wallet Indonesia. Exchanger Skrill terpercaya sejak 2020.",
  keywords: [
    "jual saldo skrill",
    "beli skrill indonesia",
    "tukar skrill ke rupiah",
    "convert skrill ke bank",
    "jual beli skrill murah",
    "skrill exchanger indonesia",
    "tukar skrill cepat",
    "jual skrill rate tinggi",
    "beli saldo skrill legal",
    "skrill to rupiah",
    "withdraw skrill indonesia",
    "top up skrill murah",
    "jasa convert skrill",
    "exchanger skrill terpercaya"
  ],
  alternates: {
    canonical: "https://saldopedia.com/skrill",
  },
  openGraph: {
    title: "Jual Beli Saldo Skrill - Rate Terbaik Indonesia | Saldopedia",
    description: "Convert Skrill ke Rupiah dengan rate tinggi. Proses 5-15 menit ke semua bank & e-wallet.",
    url: "https://saldopedia.com/skrill",
    type: "website",
  },
};

export default function SkrillPage() {
  return (
    <>
      <ServiceSchema
        name="Jual Beli Saldo Skrill Indonesia"
        description="Layanan jual beli dan convert saldo Skrill ke Rupiah dengan rate terbaik. Proses 5-15 menit, transfer ke semua bank dan e-wallet Indonesia."
        url="https://saldopedia.com/skrill"
        serviceType="CurrencyExchange"
      />
      <BreadcrumbSchema
        items={[
          { name: "Beranda", url: "https://saldopedia.com" },
          { name: "Skrill", url: "https://saldopedia.com/skrill" }
        ]}
      />
      <SkrillContent />
    </>
  );
}
