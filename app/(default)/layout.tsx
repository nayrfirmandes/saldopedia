import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import CookieBanner from "@/components/cookie-banner-client";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <main className="grow">{children}</main>

      <Footer border={true} />

      <CookieBanner />
    </>
  );
}
