"use client";

import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { Transaction } from "@/shared/schema";
import { formatDistanceToNow } from "date-fns";
import { id as localeId, enUS as localeEn } from "date-fns/locale";
import { 
  TrendingUp, 
  TrendingDown, 
  Bitcoin, 
  Wallet,
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

// OPTIMIZED: Memoized icon components to prevent re-creation
const PayPalIcon = memo(({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="currentColor">
    <path d="M14.06 3.713c.12-1.071-.093-1.832-.702-2.526C12.628.356 11.312 0 9.626 0H4.734a.7.7 0 0 0-.691.59L2.005 13.509a.42.42 0 0 0 .415.486h2.756l-.202 1.28a.628.628 0 0 0 .62.726H8.14c.429 0 .793-.31.862-.731l.025-.13.48-3.043.03-.164.001-.007a.35.35 0 0 1 .348-.297h.38c1.266 0 2.425-.256 3.345-.91q.57-.403.993-1.005a4.94 4.94 0 0 0 .88-2.195c.242-1.246.13-2.356-.57-3.154a2.7 2.7 0 0 0-.76-.59l-.094-.061ZM6.543 8.82a.7.7 0 0 1 .321-.079H8.3c2.82 0 5.027-1.144 5.672-4.456l.003-.016q.326.186.548.438c.546.623.679 1.535.45 2.71-.272 1.397-.866 2.307-1.663 2.874-.802.57-1.842.815-3.043.815h-.38a.87.87 0 0 0-.863.734l-.03.164-.48 3.043-.024.13-.001.004a.35.35 0 0 1-.348.296H5.595a.106.106 0 0 1-.105-.123l.208-1.32z"/>
  </svg>
));
PayPalIcon.displayName = "PayPalIcon";

const SkrillIcon = memo(({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="17.6" fontWeight="bold">S</text>
  </svg>
));
SkrillIcon.displayName = "SkrillIcon";

// OPTIMIZED: Move hydration and helper functions outside component
const hydrateTransaction = (tx: any): Transaction => ({
  ...tx,
  createdAt: typeof tx.createdAt === 'string' ? new Date(tx.createdAt) : tx.createdAt,
  completedAt: tx.completedAt && typeof tx.completedAt === 'string' ? new Date(tx.completedAt) : tx.completedAt,
});

const formatAmount = (amount: string | null, decimals: number = 2) => {
  if (!amount) return "0";
  const num = parseFloat(amount);
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatCryptoAmount = (amount: string | null) => {
  if (!amount) return "0";
  const num = parseFloat(amount);
  
  if (num >= 1000000000) {
    return (num / 1000000000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "B";
  } else if (num >= 1000000) {
    return (num / 1000000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "K";
  } else if (num >= 1) {
    return num.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  } else {
    return num.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    });
  }
};

const getServiceIcon = (serviceType: string) => {
  if (serviceType === "cryptocurrency") return Bitcoin;
  if (serviceType === "paypal") return PayPalIcon;
  if (serviceType === "skrill") return SkrillIcon;
  return Bitcoin;
};

const getServiceIconColor = (serviceType: string) => {
  if (serviceType === "cryptocurrency") return "text-amber-600 dark:text-amber-400";
  if (serviceType === "paypal") return "text-[#0070BA] dark:text-[#00A0E3]";
  if (serviceType === "skrill") return "text-[#862165] dark:text-[#A8368E]";
  return "text-blue-600 dark:text-blue-400";
};

const getServiceIconBg = (serviceType: string) => {
  if (serviceType === "cryptocurrency") return "bg-amber-50 dark:bg-amber-900/20";
  if (serviceType === "paypal") return "bg-blue-50 dark:bg-blue-900/20";
  if (serviceType === "skrill") return "bg-purple-50 dark:bg-purple-900/20";
  return "bg-blue-50 dark:bg-blue-900/20";
};

export default function TransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSseConnected, setIsSseConnected] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasNewTransaction, setHasNewTransaction] = useState(false);
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    let shouldReconnect = true;
    let isPageVisible = true;

    const connectSSE = () => {
      if (!shouldReconnect || !isPageVisible) return;

      const eventSource = new EventSource("/api/transactions/stream");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsSseConnected(true);
        setIsLoading(false);
      };

      eventSource.onmessage = (event) => {
        setIsSseConnected(true);
        setIsLoading(false);
        
        const eventData = JSON.parse(event.data);
        if (eventData.type === "new") {
          const newTx = hydrateTransaction(eventData.transaction);
          
          if (!isInitialLoad) {
            setHasNewTransaction(true);
            setTimeout(() => setHasNewTransaction(false), 600);
          }
          
          setTransactions((prev) => {
            const updated = [newTx, ...prev].slice(0, 5);
            if (isInitialLoad && updated.length >= 3) {
              setTimeout(() => setIsInitialLoad(false), 500);
            }
            return updated;
          });
        } else if (eventData.type === "status_update") {
          const updatedTx = hydrateTransaction(eventData.transaction);
          
          setStatusChangeId(updatedTx.transactionId);
          setTimeout(() => setStatusChangeId(null), 600);
          
          setTransactions((prev) => 
            prev.map((tx) => 
              tx.transactionId === updatedTx.transactionId ? updatedTx : tx
            )
          );
        }
      };

      eventSource.onerror = () => {
        setIsSseConnected(false);
        setIsLoading(false);
        eventSource.close();
        if (shouldReconnect && isPageVisible) {
          reconnectTimeout = setTimeout(() => {
            connectSSE();
          }, 5000);
        }
      };
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      
      if (!isPageVisible) {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          setIsSseConnected(false);
        }
      } else {
        connectSSE();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    connectSSE();

    return () => {
      shouldReconnect = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // OPTIMIZED: useMemo for language-dependent functions
  const getStatusConfig = useMemo(() => (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle2,
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800",
          label: language === "id" ? "Selesai" : "Completed",
        };
      case "processing":
        return {
          icon: Clock,
          color: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          label: language === "id" ? "Diproses" : "Processing",
        };
      case "pending":
        return {
          icon: AlertCircle,
          color: "text-orange-600 dark:text-orange-400",
          bg: "bg-orange-50 dark:bg-orange-900/20",
          border: "border-orange-200 dark:border-orange-800",
          label: language === "id" ? "Menunggu" : "Pending",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-800",
          label: status,
        };
    }
  }, [language]);

  const getServiceLabel = useCallback((serviceType: string, cryptoSymbol: string | null) => {
    if (serviceType === "cryptocurrency" && cryptoSymbol) {
      return cryptoSymbol;
    }
    return serviceType === "paypal" ? "PayPal" : "Skrill";
  }, []);

  const formatRelativeTime = useCallback((date: Date | string) => {
    if (!mounted) {
      const d = new Date(date);
      return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta"
      }).format(d);
    }
    const locale = language === "id" ? localeId : localeEn;
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
  }, [language, mounted]);

  // Show all transactions, max 5
  const visibleTransactions = useMemo(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) return [];
    return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-4">
      <style jsx>{`
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
          }
          60% {
            opacity: 1;
            transform: translateY(2px) scale(1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes smoothSlideDown {
          0% {
            transform: translateY(-8px);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes gentlePulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
          50% {
            transform: scale(1.005);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          }
        }
        @keyframes initialFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .transaction-item {
            animation: none !important;
          }
        }
      `}</style>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {visibleTransactions.map((transaction, index) => {
        // OPTIMIZED: Compute these once per transaction, not on every parent render
        const ServiceIcon = getServiceIcon(transaction.serviceType);
        const isBuy = transaction.transactionType === "buy";
        const TransactionIcon = isBuy ? TrendingUp : TrendingDown;
        
        // Get status config with proper language
        const statusConfigData = getStatusConfig(transaction.status);
        const StatusIcon = statusConfigData.icon;
        const statusLabel = language === "id" 
          ? (transaction.status === "pending" ? "Menunggu" : transaction.status === "processing" ? "Diproses" : "Selesai")
          : (transaction.status === "pending" ? "Pending" : transaction.status === "processing" ? "Processing" : "Completed");

        const isStatusChanging = statusChangeId === transaction.transactionId;
        
        const getAnimation = () => {
          if (isStatusChanging) {
            return "gentlePulse 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
          }
          if (hasNewTransaction) {
            if (index === 0) {
              return "fadeSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
            }
            return `smoothSlideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1) ${index * 40}ms both`;
          }
          if (isInitialLoad) {
            return `initialFadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) ${index * 60}ms both`;
          }
          return undefined;
        };

        return (
          <div
            key={transaction.id}
            className="transaction-item group py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            style={{ animation: getAnimation() }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${getServiceIconBg(transaction.serviceType)}`}>
                  <ServiceIcon className={`h-4 w-4 ${getServiceIconColor(transaction.serviceType)}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {isBuy ? (language === "id" ? "Beli" : "Buy") : (language === "id" ? "Jual" : "Sell")}{" "}
                      {getServiceLabel(transaction.serviceType, transaction.cryptoSymbol)}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium ${statusConfigData.bg} ${statusConfigData.color} ${statusConfigData.border} border flex-shrink-0`}
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{transaction.userName}</span>
                    <span>•</span>
                    <span>{transaction.paymentMethod}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(transaction.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                {transaction.amountForeign && (
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-sm font-semibold ${isBuy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {isBuy ? "+" : "-"}
                      {transaction.serviceType === "cryptocurrency"
                        ? formatCryptoAmount(transaction.amountForeign)
                        : formatAmount(transaction.amountForeign, 2)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.serviceType === "cryptocurrency"
                        ? transaction.cryptoSymbol
                        : "USD"}
                    </span>
                  </div>
                )}

                <div className="flex items-baseline gap-0.5">
                  <span className={`text-sm font-semibold ${!isBuy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {!isBuy ? "+" : "-"}Rp {formatAmount(transaction.amountIdr, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
