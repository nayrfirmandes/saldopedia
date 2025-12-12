import { Users, TrendingUp, Star } from "lucide-react";
import { StatsCounterClient } from "./stats-counter-client";

const stats = [
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    tKey: "statsCounter.users",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: TrendingUp,
    value: 50,
    suffix: "M+",
    prefix: "$",
    tKey: "statsCounter.volume",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: Star,
    value: 4.8,
    suffix: "/5",
    decimals: 1,
    tKey: "statsCounter.rating",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
];

export default function StatsCounter() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-6 md:py-8">
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="group rounded-lg border border-gray-200 bg-white p-5 text-center transition-all hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                >
                  <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <StatsCounterClient
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    decimals={stat.decimals}
                    tKey={stat.tKey}
                    color={stat.color}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
