import { Metadata } from "next";
import CryptoContent from "./crypto-content";

export const metadata: Metadata = {
  title: "Jual Beli Cryptocurrency - Bitcoin, USDT, Ethereum | Saldopedia",
  description: "Buy & Sell cryptocurrency terpercaya mulai Rp 25.000. Jual beli Bitcoin, USDT, Ethereum, dan crypto lainnya dengan rate real-time dan proses otomatis 5-15 menit.",
  keywords: "jual beli bitcoin, beli usdt, jual ethereum, crypto indonesia, buy & sell cryptocurrency",
};

export default function CryptoPage() {
  return <CryptoContent />;
}
