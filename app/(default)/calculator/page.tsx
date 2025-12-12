import dynamic from "next/dynamic";

const RateCalculator = dynamic(() => import("@/components/rate-calculator"), {
  ssr: true,
});

export const metadata = {
  title: "Kalkulator Rate Crypto, PayPal & Skrill | Hitung Estimasi Real-Time | Saldopedia",
  description: "Kalkulator rate otomatis untuk jual beli cryptocurrency, PayPal, dan Skrill mulai 25 ribu. Rate real-time, transparan, dan akurat. Lihat estimasi sebelum transaksi!",
};

export default function CalculatorPage() {
  return (
    <>
      <RateCalculator />
    </>
  );
}
