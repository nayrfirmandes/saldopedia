import { Metadata } from "next";
import dynamic from "next/dynamic";

const OrderForm = dynamic(() => import("@/components/order-form"), {
  loading: () => (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  ),
  ssr: true,
});

export const metadata: Metadata = {
  title: "Form Order - Transaksi Cepat & Mudah | Saldopedia",
  description: "Order cryptocurrency, PayPal, dan Skrill dengan form online. Perhitungan rate otomatis, transaksi mulai 25 ribu rupiah. Cepat, aman, dan terpercaya.",
  openGraph: {
    title: "Form Order - Transaksi Cepat & Mudah | Saldopedia",
    description: "Order cryptocurrency, PayPal, dan Skrill dengan form online. Perhitungan rate otomatis, transaksi mulai 25 ribu rupiah.",
    type: "website",
  },
};

export default function OrderPage() {
  return (
    <>
      <OrderForm />
    </>
  );
}
