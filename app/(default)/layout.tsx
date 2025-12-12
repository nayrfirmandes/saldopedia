import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import FooterMinimal from "@/components/ui/footer-minimal";
import CookieBanner from "@/components/cookie-banner-client";
import { MainContentWrapper } from "@/components/ui/main-content-wrapper";
import { getSessionUser } from "@/lib/auth/session";

export default async function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <>
      <Header />

      <MainContentWrapper>{children}</MainContentWrapper>

      {user ? <FooterMinimal /> : <Footer border={true} />}

      <CookieBanner />
    </>
  );
}
