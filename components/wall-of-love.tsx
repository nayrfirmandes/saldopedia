"use client";

import { useEffect, useState, useCallback } from "react";
import useMasonry from "@/utils/useMasonry";
import Testimonial from "@/components/testimonial";
import { saldopediaTestimonials } from "@/data/testimonials";
import type { Testimonial as DbTestimonial } from "@/shared/schema";

interface WallOfLoveProps {
  refreshKey?: number;
}

export default function WallOfLove({ refreshKey = 0 }: WallOfLoveProps) {
  const [dbTestimonials, setDbTestimonials] = useState<DbTestimonial[]>([]);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = useCallback(() => {
    setLoading(true);
    fetch("/api/testimonials?t=" + Date.now())
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

  useEffect(() => {
    fetchTestimonials();
  }, [refreshKey, fetchTestimonials]);

  const getAvatarPlaceholder = (name: string) => {
    const initial = name.charAt(0).toUpperCase();
    const colors = [
      { bg: '#3B82F6', text: '#FFFFFF' }, // blue
      { bg: '#8B5CF6', text: '#FFFFFF' }, // purple
      { bg: '#10B981', text: '#FFFFFF' }, // green
      { bg: '#F59E0B', text: '#FFFFFF' }, // orange
      { bg: '#EF4444', text: '#FFFFFF' }, // red
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" fill="${color.bg}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="PayPal Sans, Arial, sans-serif" font-size="26.4" font-weight="bold" fill="${color.text}">${initial}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
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

  const allTestimonials = [
    ...dbTestimonials.map(convertDbToTestimonial),
    ...saldopediaTestimonials,
  ];
  
  const displayTestimonials = loading ? saldopediaTestimonials : allTestimonials;

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          <div
            className="grid items-start gap-4 sm:grid-cols-3 md:gap-6"
          >
            {displayTestimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`group transition-all duration-300 ${
                  showTestimonials
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                }`}
                style={{ transitionDelay: `${index * 40}ms` }}
              >
                <Testimonial
                  testimonial={testimonial}
                  className="w-full group-odd:!-rotate-1 group-even:!rotate-1"
                >
                  {testimonial.content}
                </Testimonial>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
