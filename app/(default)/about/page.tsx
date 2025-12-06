import type { Metadata } from "next";
import AboutContent from "./about-content";

export const metadata: Metadata = {
  title: "Tentang Kami - Saldopedia",
  description: "Saldopedia adalah platform buy & sell cryptocurrency, PayPal, dan Skrill terpercaya untuk pengguna Indonesia dengan transaksi mulai dari Rp 25.000.",
};

export default function About() {
  return <AboutContent />;
}
