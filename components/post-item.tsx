'use client';

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";

export default function PostItem({ ...props }) {
  const { t, language } = useLanguage();
  // Calculate read time (rough estimate: 200 words per minute)
  const wordCount = props.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'id' ? 'id-ID' : 'en-US';
    return date.toLocaleDateString(locale, { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Category color mapping
  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'Cryptocurrency': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/30',
      'PayPal': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30',
      'Skrill': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/30',
      'Tips Transaksi': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30',
      'Update': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/30',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  };

  return (
    <article className="group pl-6 sm:pl-10">
      <header className="mb-3">
        {/* Category badge & metadata */}
        <div className="relative mb-3 flex flex-wrap items-center gap-3 before:absolute before:inset-y-0 before:-left-6 before:-ml-px before:w-px before:bg-blue-500 sm:before:-left-10 dark:before:bg-blue-400">
          {props.metadata.category && (
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getCategoryColor(props.metadata.category)}`}>
              {props.metadata.category}
            </span>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <time dateTime={props.metadata.publishedAt}>
              {formatDate(props.metadata.publishedAt)}
            </time>
            <span>•</span>
            <span>{readTime} {t('components.postItem.readingTime')}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-xl font-bold leading-snug transition-colors group-hover:text-blue-600 md:text-2xl dark:text-gray-100 dark:group-hover:text-blue-400">
          <Link href={`/blog/${props.slug}`}>
            {props.metadata.title}
          </Link>
        </h2>
      </header>

      {/* Summary */}
      <p className="mb-4 text-gray-700 leading-relaxed dark:text-gray-300">{props.metadata.summary}</p>

      {/* Footer with author and CTA */}
      <footer className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            className="rounded-full"
            src={props.metadata.authorImg}
            width="32"
            height="32"
            alt={props.metadata.author}
          />
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{props.metadata.author}</div>
        </div>
        <Link
          className="group/link inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          href={`/blog/${props.slug}`}
        >
          {t('components.postItem.readMore')}
          <span className="inline-block transition-transform group-hover/link:translate-x-0.5">→</span>
        </Link>
      </footer>
    </article>
  );
}
