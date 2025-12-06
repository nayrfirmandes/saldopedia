"use client";

import { Shield, Lock, CheckCircle, FileCheck } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function TrustBadges() {
  const { t } = useLanguage();

  const badges = [
    {
      icon: Shield,
      label: t("trustBadges.ssl"),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: CheckCircle,
      label: t("trustBadges.verified"),
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: Lock,
      label: t("trustBadges.secure"),
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: FileCheck,
      label: t("trustBadges.privacy"),
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-700",
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-6">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className={`group flex items-center gap-2 rounded-lg ${badge.bgColor} px-4 py-2 transition-all hover:scale-105`}
            
            
          >
            <Icon className={`h-5 w-5 ${badge.color}`} />
            <span className={`text-sm font-medium ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
