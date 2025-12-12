import Image from "next/image";
import { LargeTestimonialClient } from "./large-testimonial-client";

export default function LargeTestimonial() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-t from-transparent via-gray-100/50 to-gray-100 dark:via-gray-800/50 dark:to-gray-800" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-gray-100/50 to-gray-100 dark:via-gray-800/50 dark:to-gray-800" />
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="space-y-3 text-center">
            <div className="relative inline-flex">
              <svg
                className="absolute -left-6 -top-2 -z-10"
                width={40}
                height={49}
                viewBox="0 0 40 49"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.7976 -0.000136375L39.9352 23.4746L33.4178 31.7234L13.7686 11.4275L22.7976 -0.000136375ZM9.34947 17.0206L26.4871 40.4953L19.9697 48.7441L0.320491 28.4482L9.34947 17.0206Z"
                  fill="#D1D5DB"
                />
              </svg>
              <Image
                className="rounded-full"
                src="/images/large-testimonial.jpg"
                width={48}
                height={48}
                alt="Large testimonial"
              />
            </div>
            <LargeTestimonialClient />
          </div>
        </div>
      </div>
    </section>
  );
}
