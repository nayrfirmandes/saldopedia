"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";

export default function Feedback({ pageSlug }: { pageSlug: string }) {
  const { t } = useLanguage();
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Check if already voted
  useEffect(() => {
    const storageKey = `feedback-${pageSlug}`;
    const savedVote = localStorage.getItem(storageKey);
    if (savedVote) {
      setVoted(savedVote as "yes" | "no");
      setSubmitted(true);
    }
  }, [pageSlug]);

  const handleVote = (vote: "yes" | "no") => {
    setVoted(vote);
    const storageKey = `feedback-${pageSlug}`;
    
    if (vote === "yes") {
      // Save vote immediately
      localStorage.setItem(storageKey, "yes");
      setSubmitted(true);
      
      // Log to console (bisa diganti dengan analytics)
      console.log("Page Feedback:", {
        page: pageSlug,
        vote: "positive",
        timestamp: new Date().toISOString(),
      });
    } else {
      // Show form for negative feedback
      setShowForm(true);
    }
  };

  const handleSubmitFeedback = () => {
    const storageKey = `feedback-${pageSlug}`;
    localStorage.setItem(storageKey, "no");
    
    // Log to console (bisa diganti dengan analytics)
    console.log("Page Feedback:", {
      page: pageSlug,
      vote: "negative",
      feedback: feedbackText,
      timestamp: new Date().toISOString(),
    });
    
    setSubmitted(true);
    setShowForm(false);
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mt-6 inline-flex items-center justify-center rounded-xl bg-green-50 border border-green-200 px-4 py-3 shadow-lg shadow-black/[0.03] dark:bg-green-900/20 dark:border-green-800/30">
          <svg
            className="mr-2 fill-green-600 dark:fill-green-400"
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 16 16"
          >
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm3.707 6.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L7 8.086l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <span className="text-sm font-medium text-green-800 dark:text-green-300">
            {t("docsPage.feedback.thankYou")}
          </span>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="text-center">
        <div className="mt-6 inline-block max-w-md rounded-xl bg-white px-6 py-4 shadow-lg shadow-black/[0.03] dark:bg-gray-800 dark:shadow-black/20">
          <div className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
            {t("docsPage.feedback.whatToImprove")}
          </div>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={t("docsPage.feedback.placeholder")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:border-blue-400"
            rows={3}
          />
          <div className="mt-3 flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowForm(false);
                setVoted(null);
              }}
              className="btn-sm rounded-sm bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {t("docsPage.feedback.cancel")}
            </button>
            <button
              onClick={handleSubmitFeedback}
              className="btn-sm rounded-sm bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {t("docsPage.feedback.submit")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 shadow-lg shadow-black/[0.03] dark:bg-gray-800 dark:shadow-black/20">
        <div className="mr-3 text-sm text-gray-700 dark:text-gray-300">
          {t("docsPage.feedback.question")}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleVote("yes")}
            className="btn-sm rounded-sm bg-white px-2 py-0 shadow-sm hover:bg-green-50 transition-colors dark:bg-gray-700 dark:hover:bg-green-900/20"
          >
            <svg
              className="mr-1 fill-gray-400 dark:fill-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              width={12}
              height={13}
            >
              <path d="M6.731 5.5h3.225a1.883 1.883 0 0 1 1.575.75 1.9 1.9 0 0 1 .45 1.575l-.6 3.45A2.009 2.009 0 0 1 9.431 13H3V7l1.784-5.625A.5.5 0 0 1 5.234 1a1.3 1.3 0 0 1 .882.176A1.314 1.314 0 0 1 6.73 2.5v3ZM2 7H.5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5H2V7Z" />
            </svg>
            {t("docsPage.feedback.yes")}
          </button>
          <button
            onClick={() => handleVote("no")}
            className="btn-sm rounded-sm bg-white px-2 py-0 shadow-sm hover:bg-red-50 transition-colors dark:bg-gray-700 dark:hover:bg-red-900/20"
          >
            <svg
              className="mr-1 rotate-180 fill-gray-400 dark:fill-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              width={12}
              height={13}
            >
              <path d="M6.731 5.5h3.225a1.883 1.883 0 0 1 1.575.75 1.9 1.9 0 0 1 .45 1.575l-.6 3.45A2.009 2.009 0 0 1 9.431 13H3V7l1.784-5.625A.5.5 0 0 1 5.234 1a1.3 1.3 0 0 1 .882.176A1.314 1.314 0 0 1 6.73 2.5v3ZM2 7H.5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5H2V7Z" />
            </svg>
            {t("docsPage.feedback.no")}
          </button>
        </div>
      </div>
    </div>
  );
}
