"use client";

import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId, enUS as localeEn } from "date-fns/locale";
import { TrendingUp, TrendingDown, Bitcoin, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

type Transaction = {
  id: number;
  transactionId: string;
  userName: string;
  serviceType: string;
  cryptoSymbol: string | null;
  cryptoNetwork: string | null;
  transactionType: string;
  amountIdr: string;
  amountForeign: string | null;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  completedAt: Date | null;
};

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

const hydrateTransaction = (tx: any): Transaction => ({
  ...tx,
  createdAt: typeof tx.createdAt === 'string' ? new Date(tx.createdAt) : tx.createdAt,
  completedAt: tx.completedAt && typeof tx.completedAt === 'string' ? new Date(tx.completedAt) : tx.completedAt,
});

const formatAmount = (amount: string | null, decimals: number = 0) => {
  if (!amount) return "0";
  return parseFloat(amount).toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatCryptoAmount = (amount: string | null) => {
  if (!amount) return "0";
  const num = parseFloat(amount);
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + "M";
  if (num >= 10000) return (num / 1000).toFixed(0) + "K";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + "K";
  if (num >= 100) return num.toFixed(0);
  if (num >= 1) return num.toFixed(2).replace(/\.00$/, '');
  if (num >= 0.01) return num.toFixed(4).replace(/\.?0+$/, '');
  return num.toFixed(6).replace(/\.?0+$/, '');
};

const getServiceIcon = (serviceType: string) => {
  if (serviceType === "cryptocurrency") return Bitcoin;
  if (serviceType === "paypal") return PayPalIcon;
  return SkrillIcon;
};

const getServiceIconColor = (serviceType: string) => {
  if (serviceType === "cryptocurrency") return "text-amber-600 dark:text-amber-400";
  if (serviceType === "paypal") return "text-[#0070BA] dark:text-[#00A0E3]";
  return "text-[#862165] dark:text-[#A8368E]";
};

const getServiceIconBg = (serviceType: string) => {
  if (serviceType === "cryptocurrency") return "bg-amber-50 dark:bg-amber-900/20";
  if (serviceType === "paypal") return "bg-blue-50 dark:bg-blue-900/20";
  return "bg-purple-50 dark:bg-purple-900/20";
};

const getShortNetwork = (network: string | null) => {
  if (!network) return null;
  if (network.includes("TRC")) return "TRC20";
  if (network.includes("ERC")) return "ERC20";
  if (network.includes("BSC") || network.includes("BEP")) return "BEP20";
  if (network.includes("Solana")) return "SOL";
  if (network.includes("TON")) return "TON";
  if (network.includes("Polygon")) return "POL";
  if (network.includes("Tron")) return "TRC20";
  return network.split(" ")[0];
};

export default function TransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hasNewTransaction, setHasNewTransaction] = useState(false);
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { language } = useLanguage();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    let shouldReconnect = true;

    const connectSSE = () => {
      if (!shouldReconnect) return;
      const eventSource = new EventSource("/api/transactions/stream");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => { setIsLoading(false); };

      eventSource.onmessage = (event) => {
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
            if (isInitialLoad && updated.length >= 3) setTimeout(() => setIsInitialLoad(false), 500);
            return updated;
          });
        } else if (eventData.type === "status_update") {
          const updatedTx = hydrateTransaction(eventData.transaction);
          setStatusChangeId(updatedTx.transactionId);
          setTimeout(() => setStatusChangeId(null), 600);
          setTransactions((prev) => prev.map((tx) => tx.transactionId === updatedTx.transactionId ? updatedTx : tx));
        }
      };

      eventSource.onerror = () => {
        setIsLoading(false);
        eventSource.close();
        if (shouldReconnect) reconnectTimeout = setTimeout(connectSSE, 5000);
      };
    };

    const handleVisibility = () => {
      if (document.hidden) {
        eventSourceRef.current?.close();
      } else {
        connectSSE();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    connectSSE();

    return () => {
      shouldReconnect = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimeout(reconnectTimeout);
      eventSourceRef.current?.close();
    };
  }, []);

  const getStatusConfig = useMemo(() => (status: string) => {
    const configs: Record<string, any> = {
      completed: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
      processing: { icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
      pending: { icon: AlertCircle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
    };
    return configs[status] || configs.pending;
  }, []);

  const formatRelativeTime = useCallback((date: Date | string) => {
    if (!mounted) return "";
    const locale = language === "id" ? localeId : localeEn;
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
  }, [language, mounted]);

  const visibleTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visibleTransactions.map((tx, index) => {
        const ServiceIcon = getServiceIcon(tx.serviceType);
        const isBuy = tx.transactionType === "buy";
        const statusConfig = getStatusConfig(tx.status);
        const StatusIcon = statusConfig.icon;
        const isAnimating = statusChangeId === tx.transactionId;
        const shortNetwork = getShortNetwork(tx.cryptoNetwork);

        const animation = isAnimating 
          ? "gentlePulse 0.8s ease" 
          : hasNewTransaction && index === 0 
            ? "fadeSlideIn 0.5s ease" 
            : isInitialLoad 
              ? `initialFadeIn 0.35s ease ${index * 60}ms both` 
              : undefined;

        return (
          <div
            key={tx.id}
            className="group p-2.5 sm:p-3 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-700"
            style={{ animation }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full ${getServiceIconBg(tx.serviceType)}`}>
                <ServiceIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${getServiceIconColor(tx.serviceType)}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {isBuy ? (language === "id" ? "Beli" : "Buy") : (language === "id" ? "Jual" : "Sell")}{" "}
                    {tx.cryptoSymbol || (tx.serviceType === "paypal" ? "PayPal" : "Skrill")}
                  </h3>
                  {shortNetwork && (
                    <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {shortNetwork}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                    <StatusIcon className="h-2.5 w-2.5" />
                    {tx.status === "pending" ? (language === "id" ? "Menunggu" : "Pending") : tx.status === "processing" ? (language === "id" ? "Diproses" : "Processing") : (language === "id" ? "Selesai" : "Done")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <span className="truncate max-w-[80px] sm:max-w-none">{tx.userName}</span>
                  {!isBuy && tx.paymentMethod && tx.paymentMethod !== "Saldo" && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{tx.paymentMethod}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatRelativeTime(tx.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-right">
                {tx.amountForeign && (
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-xs sm:text-sm font-semibold ${isBuy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {isBuy ? "+" : "-"}
                      {tx.serviceType === "cryptocurrency" ? formatCryptoAmount(tx.amountForeign) : formatAmount(tx.amountForeign, 0)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {tx.serviceType === "cryptocurrency" ? tx.cryptoSymbol : "USD"}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-xs sm:text-sm font-semibold ${!isBuy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {!isBuy ? "+" : "-"}Rp {formatAmount(tx.amountIdr)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
