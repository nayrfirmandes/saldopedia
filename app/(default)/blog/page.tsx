import { getBlogPosts } from "@/components/mdx/utils";
import PageIllustration from "@/components/page-illustration";
import BlogList from "@/components/blog-list";
import BlogHero from "./blog-hero";
import { AdsterraBanner, AdsterraSocialBar } from "@/components/adsterra-ads";

export default function Blog() {
  const allBlogs = getBlogPosts();

  // Sort posts by date
  allBlogs.sort((a, b) => {
    return new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
      ? -1
      : 1;
  });

  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Main content */}
        <div className="mx-auto max-w-3xl pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Section header */}
          <BlogHero />

          <BlogList posts={allBlogs} />
          
          {/* Ad after blog list */}
          <AdsterraBanner className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700" />
        </div>
      </div>
      
      {/* Social Bar Ad */}
      <AdsterraSocialBar />
    </section>
  );
}
