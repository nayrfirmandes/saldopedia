import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Cryptocurrency - Bitcoin, USDT, Ethereum & 100+ Crypto",
  description: "Lihat daftar lengkap cryptocurrency yang tersedia di Saldopedia. Bitcoin, USDT, Ethereum, dan 100+ altcoin lainnya dengan harga real-time dari CoinGecko.",
  keywords: "daftar cryptocurrency, list crypto indonesia, harga bitcoin, harga usdt, harga ethereum, altcoin indonesia, crypto terpercaya",
  openGraph: {
    title: "Daftar Cryptocurrency | Saldopedia",
    description: "100+ cryptocurrency tersedia: Bitcoin, USDT, Ethereum, dan altcoin lainnya dengan harga real-time.",
    url: "https://saldopedia.com/cryptocurrencies",
  },
};

export default function CryptocurrenciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
