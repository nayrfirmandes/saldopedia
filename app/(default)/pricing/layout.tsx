import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Harga & Biaya Transaksi - Rate Crypto, PayPal, Skrill",
  description: "Cek rate dan biaya transaksi jual beli cryptocurrency, PayPal, dan Skrill di Saldopedia. Harga transparan, tanpa biaya tersembunyi, update real-time.",
  keywords: "harga crypto indonesia, rate bitcoin, biaya transaksi paypal, fee skrill, rate usdt, harga ethereum",
  openGraph: {
    title: "Harga & Biaya Transaksi | Saldopedia",
    description: "Rate dan biaya transaksi jual beli crypto, PayPal, Skrill. Harga transparan dan update real-time.",
    url: "https://saldopedia.com/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
