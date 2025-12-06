import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Cookie - Penggunaan Cookie di Saldopedia",
  description: "Pelajari bagaimana Saldopedia menggunakan cookie untuk meningkatkan pengalaman pengguna. Informasi lengkap tentang jenis cookie dan cara mengelolanya.",
  keywords: "kebijakan cookie, cookie policy, privasi cookie, pengaturan cookie",
  openGraph: {
    title: "Kebijakan Cookie | Saldopedia",
    description: "Informasi lengkap tentang penggunaan cookie di platform Saldopedia.",
    url: "https://saldopedia.com/cookie-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
