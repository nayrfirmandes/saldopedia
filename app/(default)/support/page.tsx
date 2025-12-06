import type { Metadata } from "next";
import SupportContent from "./support-content";

export const metadata: Metadata = {
  title: "Pusat Bantuan & Customer Service - Saldopedia",
  description: "Butuh bantuan transaksi cryptocurrency, PayPal, atau Skrill? Tim support Saldopedia siap membantu 24/7. FAQ lengkap, panduan transaksi, dan kontak WhatsApp untuk layanan cepat mulai 25 ribu.",
  keywords: [
    "bantuan saldopedia",
    "customer service crypto",
    "support paypal skrill",
    "cara transaksi cryptocurrency",
    "hubungi saldopedia",
    "faq crypto indonesia",
    "whatsapp crypto buy & sell",
    "whatsapp customer service",
    "layanan pelanggan 24/7",
    "order crypto online",
  ],
};

export default function Support() {
  return <SupportContent />;
}
