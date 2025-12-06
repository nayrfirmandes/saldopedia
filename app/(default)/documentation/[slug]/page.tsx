import type { Metadata } from "next";
import { getDocPages } from "@/components/mdx/utils";
import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/mdx/mdx";
import PageIllustration from "@/components/page-illustration";
import DocumentationProvider from "./documentation-provider";
import Sidebar from "./sidebar";
import Hamburger from "./hamburger";
import PageNavigation from "@/components/page-navigation";
import Feedback from "./feedback";
import Breadcrumbs from "./breadcrumbs";
import UpdatedDate from "./updated-date";
import idTranslations from "@/locales/id.json";

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>;
  }
): Promise<Metadata | undefined> {
  const params = await props.params;
  const post = getDocPages().find((post) => post.slug === params.slug);

  if (!post) {
    return;
  }

  const { title, summary: description } = post.metadata;

  return {
    title: `${title} ${idTranslations.docsPage.metadata.titleSuffix}`,
    description: `${description} ${idTranslations.docsPage.metadata.descriptionSuffix}`,
  };
}

export default async function DocumentationPage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const allDocs = getDocPages();
  // Sort pages by date
  allDocs.sort((a, b) => {
    return new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
      ? 1
      : -1;
  });
  const post = allDocs.find((post) => post.slug === params.slug);
  const currentIndex = allDocs.findIndex((post) => post.slug === params.slug);

  if (!post) notFound();

  const prevPost = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextPost =
    currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return (
    <DocumentationProvider>
      <section className="relative">
        <PageIllustration />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Main content */}
          <div className="flex justify-between pb-12 pt-32 md:pb-20 md:pt-40">
            {/* Sidebar */}
            <Sidebar docs={allDocs} />

            {/* Page container */}
            <div className="w-full grow">
              <div className="md:pl-6 lg:pl-12">
                <div className="ml-auto max-w-[740px]">
                  <article className="border-b border-gray-200 pb-10 dark:border-gray-700">
                    {/* Main area */}
                    <div className="min-w-0">
                      {/* Mobile hamburger + breadcrumbs */}
                      <div className="mb-6 flex items-center md:hidden">
                        {/* Hamburger button */}
                        <Hamburger />
                        {/* Breadcrumbs */}
                        <Breadcrumbs pageTitle={post.metadata.title} />
                      </div>
                      {/* Article content */}
                      <div>
                        <header className="mb-8">
                          <h1 className="mb-2 text-3xl font-bold dark:text-gray-100">
                            {post.metadata.title}
                          </h1>
                          <p className="text-lg text-gray-700 dark:text-gray-300">
                            {post.metadata.summary}
                          </p>
                        </header>
                        <div className="prose max-w-none text-gray-700 prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-gray-900 prose-h2:text-gray-900 prose-h3:text-gray-900 prose-h4:text-gray-900 prose-a:font-medium prose-a:text-blue-600 hover:prose-a:underline prose-em:text-gray-900 prose-em:italic prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:text-gray-700 prose-strong:font-bold prose-strong:text-gray-900 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-gray-900 prose-code:before:content-none prose-code:after:content-none prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-gray-100 prose-pre:text-gray-900 dark:text-gray-200 dark:prose-headings:text-white dark:prose-h1:text-white dark:prose-h2:text-white dark:prose-h3:text-white dark:prose-h4:text-white dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300 dark:prose-em:text-white dark:prose-em:italic dark:prose-blockquote:border-blue-400 dark:prose-blockquote:bg-blue-500/10 dark:prose-blockquote:text-gray-100 dark:prose-strong:font-bold dark:prose-strong:text-white dark:prose-code:bg-gray-700 dark:prose-code:text-gray-100 dark:prose-pre:bg-gray-700 dark:prose-pre:text-gray-100 dark:prose-ul:text-gray-200 dark:prose-ol:text-gray-200 dark:prose-li:text-gray-200 dark:prose-li:marker:text-gray-400 dark:prose-hr:border-gray-600 dark:prose-table:text-gray-200">
                          <CustomMDX source={post.content} />
                        </div>
                      </div>
                      {post.metadata.updatedAt && (
                        <UpdatedDate dateString={post.metadata.updatedAt} />
                      )}
                    </div>
                  </article>
                  {/* Page navigation */}
                  <PageNavigation
                    prevArticle={prevPost}
                    nextArticle={nextPost}
                  />
                  {/* Feedback */}
                  <Feedback pageSlug={params.slug} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DocumentationProvider>
  );
}
