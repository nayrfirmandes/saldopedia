"use client";

import { useState, useRef } from "react";
import Hero from "./hero";
import WallOfLove from "@/components/wall-of-love";
import TestimonialForm from "@/components/testimonial-form";
import Cta from "@/components/cta-alternative";
import { useLanguage } from "@/contexts/language-context";

export default function Customers() {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleFormSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      testimonialsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setTimeout(() => {
      heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <>
      <div ref={heroRef}>
        <Hero showForm={showForm} setShowForm={setShowForm} />
      </div>
      
      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${showForm ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <section className="relative py-12 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <TestimonialForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
          </div>
        </section>
      </div>
      
      <div ref={testimonialsRef}>
        <WallOfLove refreshKey={refreshKey} />
      </div>
      <Cta
        heading={t('customersPage.cta.title')}
        buttonText={t('customersPage.cta.button')}
        buttonLink="/order"
      />
    </>
  );
}
