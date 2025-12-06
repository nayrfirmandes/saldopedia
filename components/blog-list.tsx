"use client";

import { useState, useMemo } from "react";
import PostItem from "@/components/post-item";
import { useLanguage } from "@/contexts/language-context";

interface BlogPost {
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    author: string;
    authorImg: string;
    category?: string;
  };
  slug: string;
  content: string;
}

interface BlogListProps {
  posts: BlogPost[];
}

export default function BlogList({ posts }: BlogListProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visiblePosts, setVisiblePosts] = useState(3);

  // Filter posts by category
  const filteredBlogs = useMemo(() => {
    if (selectedCategory === "All") return posts;
    return posts.filter(
      (post) => post.metadata.category === selectedCategory
    );
  }, [selectedCategory, posts]);

  // Posts to display (with pagination)
  const displayedPosts = filteredBlogs.slice(0, visiblePosts);
  const hasMore = visiblePosts < filteredBlogs.length;

  const categories = [
    { key: "All", label: t('blogPage.categories.all') },
    { key: "Cryptocurrency", label: t('blogPage.categories.cryptocurrency') },
    { key: "PayPal", label: t('blogPage.categories.paypal') },
    { key: "Skrill", label: t('blogPage.categories.skrill') },
    { key: "Tips Transaksi", label: t('blogPage.categories.tips') },
    { key: "Update", label: t('blogPage.categories.update') },
  ];

  const loadMore = () => {
    setVisiblePosts((prev) => prev + 3);
  };

  return (
    <>
      {/*Categories */}
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => {
              setSelectedCategory(category.key);
              setVisiblePosts(3);
            }}
            className={`btn-sm font-normal transition-colors ${
              selectedCategory === category.key
                ? "bg-gray-800 text-gray-200 hover:bg-gray-900 dark:bg-gray-600 dark:text-gray-100"
                : "bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>


      <div className="space-y-10 border-l [border-image:linear-gradient(to_bottom,var(--color-slate-200),var(--color-slate-300),transparent)1] dark:[border-image:linear-gradient(to_bottom,var(--color-slate-700),var(--color-slate-600),transparent)1]">
        {displayedPosts.map((post, postIndex) => (
          <PostItem key={postIndex} {...post} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            className="btn-sm min-w-[200px] bg-gray-800 text-gray-200 hover:bg-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            {t('blogPage.loadMore')}{" "}
            <span className="ml-2 tracking-normal text-gray-500 dark:text-gray-400">↓</span>
          </button>
        </div>
      )}

      {/* No posts message */}
      {filteredBlogs.length === 0 && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          {t('blogPage.noArticles')}
        </div>
      )}
    </>
  );
}
