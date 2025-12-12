import { Shield, Lock, CheckCircle, FileCheck } from "lucide-react";
import { TrustBadgesClient } from "./trust-badges-client";

const badgeConfig = [
  {
    icon: Shield,
    tKey: "trustBadges.ssl",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: CheckCircle,
    tKey: "trustBadges.verified",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: Lock,
    tKey: "trustBadges.secure",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: FileCheck,
    tKey: "trustBadges.privacy",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-700",
  },
];

export default function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-6">
      {badgeConfig.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className={`group flex items-center gap-2 rounded-lg ${badge.bgColor} px-4 py-2 transition-all hover:scale-105`}
          >
            <Icon className={`h-5 w-5 ${badge.color}`} />
            <TrustBadgesClient tKey={badge.tKey} color={badge.color} />
          </div>
        );
      })}
    </div>
  );
}
