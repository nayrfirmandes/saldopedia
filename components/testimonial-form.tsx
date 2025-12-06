"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";

interface TestimonialFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TestimonialForm({ onSuccess, onCancel }: TestimonialFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const messageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (message && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      
      if (message.type === "success") {
        const timer = setTimeout(() => {
          setMessage(null);
        }, 8000);
        return () => clearTimeout(timer);
      }
    }
  }, [message]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: t('customersPage.form.successTitle') });
        form.reset();
        setPhotoPreview(null);
        setCharCount(0);
        setRating(5);
        
        // Auto-hide form after 3 seconds
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 3000);
        }
      } else {
        setMessage({ type: "error", text: data.error || t('customersPage.form.errorDefault') });
      }
    } catch (error) {
      setMessage({ type: "error", text: t('customersPage.form.errorNetwork') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl bg-white p-6 shadow-lg shadow-black/[0.03] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] md:p-8 dark:bg-gray-800 dark:before:[background:linear-gradient(rgb(55_65_81),rgb(75_85_99))_border-box]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold dark:text-gray-100">{t('customersPage.form.title')}</h2>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label={t('customersPage.form.cancelButton')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">{t('customersPage.form.cancelButton')}</span>
            </button>
          )}
        </div>

        {message && (
          <div
            ref={messageRef}
            className={`mb-6 animate-[slideDown_0.3s_ease-out] rounded-lg p-4 ${
              message.type === "success"
                ? "border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-900 dark:border-green-400 dark:bg-gradient-to-br dark:from-green-900/50 dark:to-emerald-900/50 dark:text-green-100"
                : "border-2 border-red-500 bg-gradient-to-br from-red-50 to-orange-50 text-red-900 dark:border-red-400 dark:bg-gradient-to-br dark:from-red-900/50 dark:to-orange-900/50 dark:text-red-100"
            }`}
          >
            <div className="flex items-start gap-3">
              {message.type === "success" ? (
                <svg className="mt-0.5 h-6 w-6 shrink-0 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="mt-0.5 h-6 w-6 shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div className="flex-1">
                <p className="font-medium">{message.text}</p>
                {message.type === "success" && (
                  <p className="mt-1 text-sm text-green-700 dark:text-green-300">{t('customersPage.form.successMessage')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('customersPage.form.nameLabel')} <span className="text-red-500 dark:text-red-400">{t('customersPage.form.required')}</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder={t('customersPage.form.namePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('customersPage.form.usernameLabel')}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder={t('customersPage.form.usernamePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="platform" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('customersPage.form.platformLabel')} <span className="text-red-500 dark:text-red-400">{t('customersPage.form.required')}</span>
            </label>
            <select
              id="platform"
              name="platform"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">{t('customersPage.form.platformPlaceholder')}</option>
              <option value="Telegram">{t('customersPage.form.platformTelegram')}</option>
              <option value="Twitter">{t('customersPage.form.platformTwitter')}</option>
              <option value="Instagram">{t('customersPage.form.platformInstagram')}</option>
              <option value="Facebook">{t('customersPage.form.platformFacebook')}</option>
              <option value="WhatsApp">{t('customersPage.form.platformWhatsApp')}</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('lang') === 'id' ? 'Rating' : 'Rating'} <span className="text-red-500 dark:text-red-400">{t('customersPage.form.required')}</span>
            </label>
            <input type="hidden" name="rating" value={rating} />
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="group transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${star} ${t('lang') === 'id' ? 'bintang' : 'stars'}`}
                >
                  <svg
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600'
                    }`}
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {rating}/5
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="photo" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('customersPage.form.photoLabel')}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="photo"
              name="photo"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoChange}
              className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 ${photoPreview ? 'hidden' : ''}`}
            />
            {!photoPreview ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('customersPage.form.photoHelp')}</p>
            ) : (
              <div className="mt-2 flex items-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                <img
                  src={photoPreview}
                  alt={t('customersPage.form.photoAlt')}
                  className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm dark:border-gray-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('customersPage.form.photoSelected')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('customersPage.form.photoPreview')}</p>
                </div>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                >
                  {t('customersPage.form.photoRemove')}
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('customersPage.form.testimonialLabel')} <span className="text-red-500 dark:text-red-400">{t('customersPage.form.required')}</span>
              </label>
              <span className={`text-xs ${charCount >= 150 ? 'text-orange-600 font-medium dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {charCount}/170 {t('customersPage.form.charCount')}
              </span>
            </div>
            <textarea
              id="content"
              name="content"
              required
              rows={4}
              maxLength={170}
              onChange={(e) => setCharCount(e.target.value.length)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder={t('customersPage.form.testimonialPlaceholder')}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('lang') === 'id' ? 'Maksimal 170 karakter untuk testimoni singkat dan padat.' : 'Maximum 170 characters for concise testimonials.'}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-lg border-2 border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700/50"
              >
                {t('customersPage.form.cancelButton')}
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex-1 overflow-hidden rounded-lg bg-gradient-to-t from-blue-600 to-blue-500 px-6 py-3 font-medium text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('customersPage.form.submitting')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t('customersPage.form.submitButton')}
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
