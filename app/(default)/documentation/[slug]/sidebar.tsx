"use client";

import { useRef, useEffect, useState } from "react";
import { useDocumentationProvider } from "./documentation-provider";
import { usePathname } from "next/navigation";
import Link from "next/link";
import useScrollSpy from "@/utils/useScrollspy";
import { useLanguage } from "@/contexts/language-context";

export default function Sidebar({ docs }: { docs: any[] }) {
  const { t } = useLanguage();
  const sidebar = useRef<HTMLDivElement>(null);
  const { sidebarOpen, setSidebarOpen } = useDocumentationProvider();
  const pathname = usePathname();
  const links = useScrollSpy();
  const [expandedDocs, setExpandedDocs] = useState<string[]>([]);

  // Auto-expand current doc
  useEffect(() => {
    const currentDoc = docs.find((doc) => pathname.includes(doc.slug));
    if (currentDoc && currentDoc.metadata.kind === "detailed" && !expandedDocs.includes(currentDoc.slug)) {
      setExpandedDocs([...expandedDocs, currentDoc.slug]);
    }
  }, [pathname, docs]);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (!sidebar.current) return;
      if (!sidebarOpen || sidebar.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const toggleDocExpansion = (slug: string) => {
    if (expandedDocs.includes(slug)) {
      setExpandedDocs(expandedDocs.filter((s) => s !== slug));
    } else {
      setExpandedDocs([...expandedDocs, slug]);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebar}
        id="sidebar"
        className={`w-[280px] max-md:fixed max-md:left-0 max-md:top-0 max-md:z-50 max-md:h-screen max-md:bg-white max-md:shadow-2xl max-md:rounded-r-2xl md:block md:shrink-0 md:border-r md:[border-image:linear-gradient(to_bottom,var(--color-slate-200),var(--color-slate-300),transparent)1] transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] dark:max-md:bg-gray-800 dark:md:[border-image:linear-gradient(to_bottom,var(--color-slate-700),var(--color-slate-600),transparent)1] ${
          sidebarOpen ? "translate-x-0 opacity-100" : "max-md:-translate-x-full max-md:opacity-0"
        }`}
      >
        <div className="no-scrollbar overflow-y-auto px-6 py-4 max-md:h-full max-md:pt-24 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:py-4">
          {/* Docs nav */}
          <nav className="space-y-6 md:block">
            <div>
              <div className="mb-4 text-sm font-bold text-gray-900 tracking-wide dark:text-gray-100">
                {t("docsPage.sidebarTitle")}
              </div>
              <ul className="space-y-1 text-sm">
                {docs.map((doc, index) => {
                  const isExpanded = expandedDocs.includes(doc.slug);
                  const isCurrent = pathname.includes(doc.slug);
                  const isDetailed = doc.metadata.kind === "detailed";

                  return (
                    <li key={index}>
                      <div className="flex items-center gap-2">
                        {isDetailed ? (
                          <button
                            onClick={() => toggleDocExpansion(doc.slug)}
                            className={`relative flex flex-1 items-center px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                              isCurrent 
                                ? "font-semibold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10" 
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700/50"
                            }`}
                          >
                            <svg
                              className={`shrink-0 fill-current mr-2 transition-transform duration-200 ease-in-out ${
                                isExpanded ? "" : "-rotate-90"
                              } ${isCurrent ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}
                              width="11"
                              height="7"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="m2 .94 3.5 3.5L9 .94 10.06 2 5.5 6.56.94 2 2 .94Z" />
                            </svg>
                            <span>{doc.metadata.title}</span>
                          </button>
                        ) : (
                          <Link
                            href={`/documentation/${doc.slug}`}
                            className={`relative flex flex-1 items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                              isCurrent 
                                ? "font-semibold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10" 
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700/50"
                            }`}
                          >
                            <span>{doc.metadata.title}</span>
                          </Link>
                        )}
                      </div>
                      
                      {/* Dropdown content with smooth animation */}
                      {isDetailed && isExpanded && (
                        <div
                          className="overflow-hidden transition-all duration-300 ease-in-out max-h-96 opacity-100 mt-1"
                        >
                          {isCurrent && links.length > 0 ? (
                            <ul className="space-y-0.5 pl-6 ml-3 border-l-2 border-blue-500 dark:border-blue-400">
                              {links.map((link, linkIndex) => (
                                <li key={linkIndex}>
                                  <a
                                    data-scrollspy-link
                                    className="block text-gray-600 hover:text-blue-600 transition-colors py-1.5 px-2 rounded hover:bg-blue-50/50 text-xs dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
                                    href={`#${link.id}`}
                                    onClick={() => {
                                      // Smooth scroll to section
                                      const element = document.getElementById(link.id);
                                      if (element) {
                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                      }
                                    }}
                                  >
                                    {link.innerText}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="pl-6 ml-3 py-2 text-xs text-gray-500 border-l-2 border-gray-200 dark:text-gray-400 dark:border-gray-700">
                              <Link 
                                href={`/documentation/${doc.slug}`}
                                className="hover:text-blue-600 transition-colors inline-flex items-center gap-1 dark:hover:text-blue-400"
                              >
                                {t("docsPage.viewFullToc")}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
