"use client";

import { useState, useEffect, memo } from "react";
import Testimonial from "@/components/testimonial";
import { saldopediaTestimonials } from "@/data/testimonials";
import type { Testimonial as DbTestimonial } from "@/shared/schema";
import { useLanguage } from "@/contexts/language-context";
import { getAvatarPlaceholder } from "@/lib/formatters";

type TestimonialWithFormattedDate = DbTestimonial & { formattedDate: string };

function TestimonialsCarousel() {
  const { t } = useLanguage();
  const [showCarousel, setShowCarousel] = useState(true);
  const [dbTestimonials, setDbTestimonials] = useState<TestimonialWithFormattedDate[]>([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setDbTestimonials(data.map((t: DbTestimonial) => ({
            ...t,
            formattedDate: new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "Asia/Jakarta"
            }).format(new Date(t.createdAt))
          })));
        }
      })
      .catch(() => {});
  }, []);

  const convertDbToTestimonial = (db: TestimonialWithFormattedDate) => ({
    img: db.photoUrl || getAvatarPlaceholder(db.name),
    name: db.name,
    username: db.username || undefined,
    content: db.content,
    rating: db.rating,
    verified: db.verified,
    date: db.formattedDate,
    channel: db.platform.charAt(0).toUpperCase() + db.platform.slice(1),
  });

  const allTestimonials = [
    ...dbTestimonials.map(convertDbToTestimonial),
    ...saldopediaTestimonials,
  ];

  const displayTestimonials = allTestimonials.slice(0, 8);

  const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

  return (
    <section className="relative before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:h-[120%] before:bg-linear-to-b before:from-gray-100 dark:before:from-gray-800">
      <div className="pt-12 md:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl" suppressHydrationWarning>
              {t('testimonialsCarousel.title')}
            </h2>
          </div>
        </div>
        <div className="relative mx-auto flex max-w-[94rem] justify-center">
          <div
            className="absolute bottom-20 -z-10 -translate-x-36"
            aria-hidden="true"
          >
            <div className="h-80 w-80 rounded-full bg-linear-to-tr from-blue-500 to-gray-900 opacity-30 blur-[160px] will-change-[filter]" />
          </div>
          <div className="absolute -bottom-10 -z-10" aria-hidden="true">
            <div className="h-80 w-80 rounded-full bg-blue-500 opacity-40 blur-[160px] will-change-[filter]" />
          </div>
          <div className="absolute bottom-0 -z-10" aria-hidden="true">
            <div className="h-56 w-56 rounded-full border-[20px] border-white dark:border-gray-800 blur-[20px] will-change-[filter]" />
          </div>
          {/* Row */}
          <div className={`group inline-flex w-full flex-nowrap py-12 [mask-image:_linear-gradient(to_right,transparent_0,_black_10%,_black_90%,transparent_100%)] md:py-20 transition-opacity duration-400 select-none ${
            showCarousel ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex animate-[infinite-scroll_60s_linear_infinite] items-start justify-center group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused] md:justify-start *:mx-3">
              {/* Items */}
              {displayTestimonials.map((testimonial, index) => (
                <Testimonial
                  key={`original-${testimonial.name}-${index}`}
                  testimonial={testimonial}
                  className={`w-[22rem] transition-transform duration-300 group-hover:rotate-0 group-active:rotate-0 ${rotations[index % rotations.length]}`}
                >
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
            {/* Duplicated element for infinite scroll */}
            <div
              className="flex animate-[infinite-scroll_60s_linear_infinite] items-start justify-center group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused] md:justify-start *:mx-3"
              aria-hidden="true"
            >
              {/* Items */}
              {displayTestimonials.map((testimonial, index) => (
                <Testimonial
                  key={`cloned-${testimonial.name}-${index}`}
                  testimonial={testimonial}
                  cloned={true}
                  className={`w-[22rem] transition-transform duration-300 group-hover:rotate-0 group-active:rotate-0 ${rotations[index % rotations.length]}`}
                >
                  {testimonial.content}
                </Testimonial>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


export default memo(TestimonialsCarousel);
