import type { Metadata } from "next";
import { getBlogPosts } from "@/components/mdx/utils";
import { notFound } from "next/navigation";
import PostDate from "@/components/post-date";
import { CustomMDX } from "@/components/mdx/mdx";
import PostNav from "./post-nav";
import PageIllustration from "@/components/page-illustration";
import BackLink from "./back-link";

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>;
  }
): Promise<Metadata | undefined> {
  const params = await props.params;
  const post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) {
    return;
  }

  const { title, summary: description } = post.metadata;

  return {
    title,
    description,
  };
}

export default async function SinglePost(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) notFound();

  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex justify-between pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Left content */}
          <div className="max-w-3xl">
            <article>
              {/* Section header */}
              <header className="pb-6">
                <BackLink />
                <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl dark:text-gray-100">
                  {post.metadata.title}
                </h1>
                <div className="flex items-center gap-3">
                  <img
                    className="rounded-full"
                    src={post.metadata.authorImg}
                    width={32}
                    height={32}
                    alt={post.metadata.author}
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {post.metadata.author} ·{" "}
                    <span className="text-gray-700 dark:text-gray-300">
                      <PostDate dateString={post.metadata.publishedAt} />
                    </span>
                  </div>
                </div>
              </header>
              <div className="prose max-w-none text-gray-700 prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-gray-900 prose-h2:text-gray-900 prose-h3:text-gray-900 prose-h4:text-gray-900 prose-a:font-medium prose-a:text-blue-600 hover:prose-a:underline prose-em:text-gray-900 prose-em:italic prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:font-medium prose-blockquote:italic prose-blockquote:text-gray-900 prose-strong:font-bold prose-strong:text-gray-900 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-gray-900 prose-code:before:content-none prose-code:after:content-none prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-gray-100 prose-pre:text-gray-900 prose-blockquote:xl:-ml-4 dark:text-gray-200 dark:prose-headings:text-white dark:prose-h1:text-white dark:prose-h2:text-white dark:prose-h3:text-white dark:prose-h4:text-white dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300 dark:prose-em:text-white dark:prose-em:italic dark:prose-blockquote:border-gray-500 dark:prose-blockquote:text-gray-100 dark:prose-strong:font-bold dark:prose-strong:text-white dark:prose-code:bg-gray-700 dark:prose-code:text-gray-100 dark:prose-pre:bg-gray-700 dark:prose-pre:text-gray-100 dark:prose-ul:text-gray-200 dark:prose-ol:text-gray-200 dark:prose-li:text-gray-200 dark:prose-li:marker:text-gray-400 dark:prose-hr:border-gray-600 dark:prose-table:text-gray-200">
                <CustomMDX source={post.content} />
              </div>
            </article>
          </div>
          {/* Right sidebar */}
          <PostNav />
        </div>
      </div>
    </section>
  );
}
