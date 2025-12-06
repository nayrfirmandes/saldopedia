import { Metadata } from "next";
import SkrillContent from "./skrill-content";

export const metadata: Metadata = {
  title: "Jual Beli Saldo Skrill - Rate Terbaik Mulai Rp 12.000/USD | Saldopedia",
  description: "Buy & Sell saldo Skrill terpercaya dengan rate tier mulai Rp 12.000/USD. Minimal transaksi $20, maksimal $5.000, proses otomatis 5-15 menit. Aman dan terpercaya.",
  keywords: "jual saldo skrill, beli skrill, skrill indonesia, tukar skrill, jual beli skrill murah",
};

export default function SkrillPage() {
  return <SkrillContent />;
}
