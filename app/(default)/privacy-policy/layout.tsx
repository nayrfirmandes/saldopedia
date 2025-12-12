import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi - Perlindungan Data Pengguna",
  description: "Kebijakan privasi Saldopedia menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda. Keamanan data adalah prioritas kami.",
  keywords: "kebijakan privasi, privacy policy, perlindungan data, keamanan data, privasi pengguna",
  openGraph: {
    title: "Kebijakan Privasi | Saldopedia",
    description: "Informasi lengkap tentang bagaimana Saldopedia melindungi data pribadi Anda.",
    url: "https://saldopedia.com/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
