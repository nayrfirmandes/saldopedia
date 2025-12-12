import { Metadata } from "next";
import PayPalContent from "./paypal-content";

export const metadata: Metadata = {
  title: "Jual Beli Saldo PayPal - Rate Terbaik Mulai Rp 12.000/USD | Saldopedia",
  description: "Buy & Sell saldo PayPal terpercaya dengan rate tier mulai Rp 12.000/USD. Minimal transaksi $20, maksimal $5.000, proses otomatis 5-15 menit. Aman dan terpercaya.",
  keywords: "jual saldo paypal, beli paypal, paypal indonesia, tukar paypal, jual beli paypal murah",
};

export default function PayPalPage() {
  return <PayPalContent />;
}
