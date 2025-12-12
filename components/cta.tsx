import Image from "next/image";
import Link from "next/link";
import { CtaClient } from "./cta-client";

export default function Cta() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl text-center shadow-xl before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gray-900 dark:before:bg-linear-to-br dark:before:from-gray-800 dark:before:via-gray-900 dark:before:to-black"
        >
          <div
            className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2 translate-y-1/2 ios-blur-hidden"
            aria-hidden="true"
          >
            <div className="h-56 w-[480px] rounded-full border-[20px] border-blue-500 blur-3xl will-change-[filter]" />
          </div>
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform"
            aria-hidden="true"
          >
            <Image className="max-w-none" src="/images/stripes-dark.svg" width={768} height={432} alt="Stripes" style={{ height: 'auto' }} />
          </div>
          <div className="px-4 py-12 md:px-12 md:py-20">
            <CtaClient />
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <Link
                className="btn group mb-4 w-full bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto"
                href="/order"
              >
                <CtaClient type="button" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
