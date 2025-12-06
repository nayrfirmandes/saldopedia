import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan Layanan - Aturan Penggunaan",
  description: "Syarat dan ketentuan penggunaan layanan Saldopedia. Baca aturan lengkap tentang jual beli cryptocurrency, PayPal, dan Skrill sebelum bertransaksi.",
  keywords: "syarat ketentuan, terms of service, aturan layanan, ketentuan transaksi, peraturan pengguna",
  openGraph: {
    title: "Syarat & Ketentuan Layanan | Saldopedia",
    description: "Aturan dan ketentuan lengkap penggunaan layanan jual beli crypto di Saldopedia.",
    url: "https://saldopedia.com/terms-of-service",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
