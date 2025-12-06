"use client";

import { useEffect, useState } from "react";
import Testimonial from "@/components/testimonial";
import { saldopediaTestimonials } from "@/data/testimonials";
import { useLanguage } from "@/contexts/language-context";
import { getAvatarPlaceholder } from "@/lib/formatters";

interface DbTestimonial {
  id: number;
  name: string;
  username: string | null;
  platform: string;
  photoUrl: string | null;
  content: string;
  rating: number;
  status: string;
  verified: boolean;
  createdAt: Date;
}

export default function TestimonialsGrid() {
  const { t } = useLanguage();
  const [dbTestimonials, setDbTestimonials] = useState<DbTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetch("/api/testimonials")
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch testimonials');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setDbTestimonials(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching testimonials:", err instanceof Error ? err.message : err);
        setLoading(false);
      });
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const convertDbToTestimonial = (db: DbTestimonial) => ({
    img: db.photoUrl || getAvatarPlaceholder(db.name),
    name: db.name,
    username: db.username || undefined,
    content: db.content,
    rating: db.rating,
    verified: db.verified,
    date: new Date(db.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    channel: db.platform.charAt(0).toUpperCase() + db.platform.slice(1),
  });

  const allTestimonials = isClient
    ? shuffleArray([
        ...dbTestimonials.map(convertDbToTestimonial),
        ...saldopediaTestimonials,
      ])
    : [
        ...dbTestimonials.map(convertDbToTestimonial),
        ...saldopediaTestimonials,
      ];

  const testimonials = allTestimonials.slice(0, 9);
  
  const displayTestimonials = loading
    ? (isClient ? shuffleArray(saldopediaTestimonials) : saldopediaTestimonials).slice(0, 9)
    : testimonials;

  return (
    <section className="relative before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:h-[120%] before:bg-linear-to-b before:from-gray-100 dark:before:from-gray-900/30">
      <div
        className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2 translate-y-1/2"
        aria-hidden="true"
      >
        <div className="h-80 w-80 rounded-full bg-linear-to-tr from-blue-500 to-gray-900 opacity-30 blur-[160px] will-change-[filter]"></div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl dark:text-gray-100">
              {t('pricing.testimonials.title')}
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              {t('pricing.testimonials.subtitle')}
            </p>
          </div>
          
          {/* Testimonials grid */}
          <div className="grid gap-4 [mask-image:linear-gradient(to_top,--theme(--color-white/.3),black_800px)] sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {displayTestimonials.map((testimonial, index) => (
              <Testimonial
                key={index}
                testimonial={testimonial}
                className={`transition-all duration-300 ${
                  showTestimonials
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                } ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}
              >
                {testimonial.content}
              </Testimonial>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
