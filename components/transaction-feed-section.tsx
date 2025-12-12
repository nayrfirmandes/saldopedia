"use client";

import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/language-context";
import { ErrorBoundary } from "./error-boundary";
import IntersectionWrapper from "./ui/intersection-wrapper";
import LoadingSkeleton from "./ui/loading-skeleton";
import { AnimateOnScroll } from "@/lib/use-animate-on-scroll";

const TransactionFeed = dynamic(() => import("./transaction-feed"), {
  loading: () => <LoadingSkeleton variant="spinner" />,
  ssr: false,
});

export default function TransactionFeedSection() {
  const { t } = useLanguage();

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="pb-12 text-center md:pb-16">
            <AnimateOnScroll animation="fade-up">
              <h2 suppressHydrationWarning className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,theme(colors.gray.800),theme(colors.blue.600),theme(colors.gray.800))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent dark:bg-[linear-gradient(to_right,theme(colors.gray.200),theme(colors.blue.400),theme(colors.gray.200))] md:text-4xl">
                {t("transactionFeed.title")}{" "}
                <span suppressHydrationWarning className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-500">
                  {t("transactionFeed.titleHighlight")}
                </span>
              </h2>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={100}>
              <p suppressHydrationWarning className="text-lg text-gray-700 dark:text-gray-300">
                {t("transactionFeed.subtitle")}
              </p>
            </AnimateOnScroll>
          </div>

          <IntersectionWrapper 
            fallback={<LoadingSkeleton variant="default" />}
            rootMargin="200px"
          >
            <AnimateOnScroll animation="fade-up" delay={200}>
              <ErrorBoundary>
                <TransactionFeed />
              </ErrorBoundary>
            </AnimateOnScroll>
          </IntersectionWrapper>
        </div>
      </div>
    </section>
  );
}
