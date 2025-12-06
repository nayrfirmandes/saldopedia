'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Plus, ArrowLeft, Wallet, SlidersHorizontal, ArrowUpRight, ArrowDownLeft, Send } from 'lucide-react';
import { formatIDR } from '@/lib/formatters';
import { useLanguage } from '@/contexts/language-context';

type Order = {
  id: number;
  orderId: string;
  serviceType: string;
  cryptoSymbol: string | null;
  transactionType: string;
  amountIdr: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
};

type Deposit = {
  id: number;
  depositId: string;
  amount: string;
  method: string;
  bankCode: string | null;
  status: string;
  createdAt: string;
  expiresAt: string | null;
};

type Withdrawal = {
  id: number;
  withdrawalId: string;
  amount: string;
  method: string;
  bankCode: string | null;
  accountName: string;
  status: string;
  createdAt: string;
};

type Transfer = {
  id: number;
  transferId: string;
  senderId: number;
  receiverId: number;
  amount: string;
  notes: string | null;
  type: 'sent' | 'received';
  senderName: string;
  receiverName: string;
  createdAt: string;
};

type OrdersListProps = {
  orders: Order[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  transfers: Transfer[];
  currentPage: number;
  totalPages: number;
  currentFilter: string;
  counts: {
    all: number;
    completed: number;
    pending: number;
    expired: number;
    deposit: number;
    withdrawal: number;
    transfer: number;
  };
};

const ITEMS_PER_PAGE = 10;

export default function OrdersList({ orders: initialOrders, deposits: initialDeposits, withdrawals: initialWithdrawals, transfers: initialTransfers, currentPage: initialPage, totalPages: initialTotalPages, currentFilter, counts: initialCounts }: OrdersListProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const orders = initialOrders;
  const deposits = initialDeposits;
  const withdrawals = initialWithdrawals || [];
  const transfers = initialTransfers || [];
  const counts = initialCounts;
  const [mounted, setMounted] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const filterRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (newFilter: string) => {
    setVisibleItems(ITEMS_PER_PAGE);
    router.push(`/dashboard/orders?filter=${newFilter}&page=1`);
    setShowFilterMenu(false);
  };

  const loadMore = () => {
    setVisibleItems(prev => prev + ITEMS_PER_PAGE);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setVisibleItems(ITEMS_PER_PAGE);
  }, [currentFilter]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalAll = counts.all + counts.deposit + (counts.withdrawal || 0) + (counts.transfer || 0);
  
  const tabs = [
    { id: 'all', label: t('dashboardPages.orders.filterAll'), count: totalAll },
    { id: 'completed', label: t('dashboardPages.orders.filterCompleted'), count: counts.completed },
    { id: 'pending', label: t('dashboardPages.orders.filterPending'), count: counts.pending },
    { id: 'expired', label: t('dashboardPages.orders.filterExpired'), count: counts.expired },
    { id: 'deposit', label: t('dashboardPages.orders.filterDeposit'), count: counts.deposit },
    { id: 'withdrawal', label: t('dashboardPages.orders.filterWithdrawal'), count: counts.withdrawal || 0 },
    { id: 'transfer', label: t('dashboardPages.orders.filterTransfer'), count: counts.transfer || 0 },
  ];

  const activeTabLabel = tabs.find(tab => tab.id === currentFilter)?.label || t('dashboardPages.orders.filterAll');

  type ActivityItem = 
    | { type: 'order'; data: Order; timestamp: number }
    | { type: 'deposit'; data: Deposit; timestamp: number }
    | { type: 'withdrawal'; data: Withdrawal; timestamp: number }
    | { type: 'transfer'; data: Transfer; timestamp: number };

  const allCombinedActivity: ActivityItem[] = currentFilter === 'all' ? [
    ...orders.map(order => ({
      type: 'order' as const,
      data: order,
      timestamp: (order as any).created_at_raw || 0
    })),
    ...deposits.map(deposit => ({
      type: 'deposit' as const,
      data: deposit,
      timestamp: (deposit as any).created_at_raw || 0
    })),
    ...withdrawals.map(withdrawal => ({
      type: 'withdrawal' as const,
      data: withdrawal,
      timestamp: (withdrawal as any).created_at_raw || 0
    })),
    ...transfers.map(transfer => ({
      type: 'transfer' as const,
      data: transfer,
      timestamp: (transfer as any).created_at_raw || 0
    }))
  ].sort((a, b) => b.timestamp - a.timestamp) : [];

  const visibleCombinedActivity = allCombinedActivity.slice(0, visibleItems);
  const hasMoreCombined = visibleItems < allCombinedActivity.length;

  const visibleDeposits = deposits.slice(0, visibleItems);
  const hasMoreDeposits = visibleItems < deposits.length;

  const visibleWithdrawals = withdrawals.slice(0, visibleItems);
  const hasMoreWithdrawals = visibleItems < withdrawals.length;

  const visibleTransfers = transfers.slice(0, visibleItems);
  const hasMoreTransfers = visibleItems < transfers.length;

  const visibleOrders = orders.slice(0, visibleItems);
  const hasMoreOrders = visibleItems < orders.length;

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('dashboardPages.orders.backToDashboard')}
      </Link>
      
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboardPages.orders.title')}</h1>
        <Link
          href="/order"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('dashboardPages.orders.createOrder')}
        </Link>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {activeTabLabel}
            </span>
            {currentFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                {tabs.find(t => t.id === currentFilter)?.count || 0}
              </span>
            )}
          </div>
          
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`p-2 rounded-lg border transition-colors flex items-center gap-2 ${
                currentFilter !== 'all' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">{t('dashboardPages.orders.filter')}</span>
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleFilterChange(tab.id)}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                      currentFilter === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      currentFilter === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {currentFilter === 'all' ? (
          allCombinedActivity.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('dashboardPages.orders.noTransactions')}</p>
              <Link
                href="/order"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                {t('dashboardPages.orders.createOrder')}
              </Link>
            </div>
          ) : (<>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleCombinedActivity.map((item, index) => {
                if (item.type === 'order') {
                  const order = item.data;
                  const serviceLabel = 
                    order.serviceType === 'cryptocurrency' ? order.cryptoSymbol :
                    order.serviceType === 'paypal' ? 'PayPal' : 'Skrill';
                  
                  const isSell = order.transactionType === 'sell';
                  const transactionLabel = isSell ? t('dashboard.orderType.sell') : t('dashboard.orderType.buy');
                  
                  const statusConfig: Record<string, { text: string; color: string }> = {
                    completed: { text: t('dashboard.orderStatus.completed'), color: 'text-green-600 dark:text-green-400' },
                    pending: { text: t('dashboard.orderStatus.pending'), color: 'text-yellow-600 dark:text-yellow-400' },
                    pending_proof: { text: t('dashboard.orderStatus.pendingProof'), color: 'text-orange-600 dark:text-orange-400' },
                    processing: { text: t('dashboard.orderStatus.processing'), color: 'text-blue-600 dark:text-blue-400' },
                    expired: { text: t('dashboard.orderStatus.expired'), color: 'text-red-600 dark:text-red-400' },
                    cancelled: { text: t('dashboard.orderStatus.cancelled'), color: 'text-red-600 dark:text-red-400' },
                  };
                  const status = statusConfig[order.status] || statusConfig.pending;

                  const targetUrl = (order.status === 'pending' || order.status === 'processing' || order.status === 'pending_proof')
                    ? `/order/instructions/${order.orderId}`
                    : `/order/${order.orderId}`;

                  const isExpiredOrCancelled = order.status === 'expired' || order.status === 'cancelled';
                  const amountColorClass = isExpiredOrCancelled 
                    ? 'text-gray-400 dark:text-gray-500 line-through' 
                    : isSell 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400';
                  const amountSign = isExpiredOrCancelled ? '' : (isSell ? '+' : '-');

                  return (
                    <Link key={`order-${order.id}`} href={targetUrl} className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isExpiredOrCancelled 
                            ? 'bg-gray-100 dark:bg-gray-800' 
                            : isSell 
                              ? 'bg-green-50 dark:bg-green-900/20' 
                              : 'bg-red-50 dark:bg-red-900/20'
                        }`}>
                          {isSell ? (
                            <ArrowDownLeft className={`h-5 w-5 ${isExpiredOrCancelled ? 'text-gray-400 dark:text-gray-500' : 'text-green-600 dark:text-green-400'}`} />
                          ) : (
                            <ArrowUpRight className={`h-5 w-5 ${isExpiredOrCancelled ? 'text-gray-400 dark:text-gray-500' : 'text-red-600 dark:text-red-400'}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {transactionLabel} {serviceLabel}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className={status.color}>{status.text}</span>
                            {mounted && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">-</span>
                                <span>#{order.orderId}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-medium ${amountColorClass}`}>
                            {amountSign}{formatIDR(order.amountIdr)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                } else if (item.type === 'deposit') {
                  const deposit = item.data;
                  const methodLabel = deposit.method === 'bank_transfer' 
                    ? `Bank ${deposit.bankCode}` 
                    : deposit.bankCode || 'E-Wallet';
                  
                  const depositStatusConfig: Record<string, { text: string; color: string }> = {
                    completed: { text: t('dashboard.depositStatus.completed'), color: 'text-green-600 dark:text-green-400' },
                    pending: { text: t('dashboard.depositStatus.pending'), color: 'text-yellow-600 dark:text-yellow-400' },
                    expired: { text: t('dashboard.depositStatus.expired'), color: 'text-red-600 dark:text-red-400' },
                    rejected: { text: t('dashboard.depositStatus.rejected'), color: 'text-red-600 dark:text-red-400' },
                  };
                  const status = depositStatusConfig[deposit.status] || depositStatusConfig.pending;

                  return (
                    <Link key={`deposit-${deposit.id}`} href={`/dashboard/deposits/${deposit.depositId}`} className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-50 dark:bg-green-900/20">
                          <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {t('dashboard.activityLabels.depositBalance')}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className={status.color}>{status.text}</span>
                            {mounted && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">-</span>
                                <span>{methodLabel}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            +{formatIDR(deposit.amount)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                } else if (item.type === 'withdrawal') {
                  const withdrawal = item.data;
                  const methodLabel = withdrawal.method === 'bank_transfer' 
                    ? `Bank ${withdrawal.bankCode}` 
                    : withdrawal.bankCode || 'E-Wallet';
                  
                  const withdrawalStatusConfig: Record<string, { text: string; color: string }> = {
                    completed: { text: t('dashboard.withdrawalStatus.completed'), color: 'text-green-600 dark:text-green-400' },
                    pending: { text: t('dashboard.withdrawalStatus.pending'), color: 'text-yellow-600 dark:text-yellow-400' },
                    rejected: { text: t('dashboard.withdrawalStatus.rejected'), color: 'text-red-600 dark:text-red-400' },
                  };
                  const status = withdrawalStatusConfig[withdrawal.status] || withdrawalStatusConfig.pending;

                  return (
                    <Link key={`withdrawal-${withdrawal.id}`} href={`/dashboard/withdrawals/${withdrawal.withdrawalId}`} className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-50 dark:bg-red-900/20">
                          <ArrowDownLeft className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {t('dashboard.activityLabels.withdrawBalance')}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className={status.color}>{status.text}</span>
                            {mounted && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">-</span>
                                <span>{methodLabel}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            -{formatIDR(withdrawal.amount)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                } else {
                  const transfer = item.data;
                  const isSent = transfer.type === 'sent';
                  const personName = isSent ? transfer.receiverName : transfer.senderName;

                  return (
                    <Link key={`transfer-${transfer.id}`} href={`/dashboard/transfers/${transfer.transferId}`} className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                        }`}>
                          <Send className={`h-5 w-5 ${
                            isSent ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {isSent ? t('dashboard.activityLabels.sendBalance') : t('dashboard.activityLabels.receiveBalance')}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="text-green-600 dark:text-green-400">{t('dashboard.activityLabels.success')}</span>
                            {mounted && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">-</span>
                                <span>{isSent ? t('dashboard.activityLabels.to') : t('dashboard.activityLabels.from')}: {personName}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-medium ${
                            isSent ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {isSent ? '-' : '+'}{formatIDR(transfer.amount)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                }
              })}
            </div>
            {hasMoreCombined && (
              <div className="pt-6 text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {t('dashboardPages.orders.loadMore')} ({allCombinedActivity.length - visibleItems} {t('dashboardPages.orders.remaining')})
                </button>
              </div>
            )}
          </>)
        ) : currentFilter === 'deposit' ? (
          deposits.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('dashboardPages.orders.noDeposit')}</p>
              <Link
                href="/dashboard/deposit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Wallet className="h-4 w-4" />
                {t('dashboardPages.orders.topUpBalance')}
              </Link>
            </div>
          ) : (<>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleDeposits.map((deposit) => {
                const methodLabel = deposit.method === 'bank_transfer' 
                  ? `Bank ${deposit.bankCode}` 
                  : deposit.bankCode || 'E-Wallet';
                
                const depositStatusConfig: Record<string, { text: string; color: string }> = {
                  completed: { text: t('dashboard.depositStatus.completed'), color: 'text-green-600 dark:text-green-400' },
                  pending: { text: t('dashboard.depositStatus.pending'), color: 'text-yellow-600 dark:text-yellow-400' },
                  expired: { text: t('dashboard.depositStatus.expired'), color: 'text-red-600 dark:text-red-400' },
                  rejected: { text: t('dashboard.depositStatus.rejected'), color: 'text-red-600 dark:text-red-400' },
                };
                const status = depositStatusConfig[deposit.status] || depositStatusConfig.pending;

                return (
                  <Link key={deposit.id} href={`/dashboard/deposits/${deposit.depositId}`} className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-50 dark:bg-green-900/20">
                        <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('dashboard.activityLabels.depositBalance')}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className={status.color}>{status.text}</span>
                          {mounted && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">-</span>
                              <span>{methodLabel}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          +{formatIDR(deposit.amount)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hasMoreDeposits && (
              <div className="pt-6 text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {t('dashboardPages.orders.loadMore')} ({deposits.length - visibleItems} {t('dashboardPages.orders.remaining')})
                </button>
              </div>
            )}
          </>)
        ) : currentFilter === 'withdrawal' ? (
          withdrawals.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('dashboardPages.orders.noWithdrawal')}</p>
              <Link
                href="/dashboard/withdraw"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ArrowDownLeft className="h-4 w-4" />
                {t('dashboard.activityLabels.withdrawBalance')}
              </Link>
            </div>
          ) : (<>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleWithdrawals.map((withdrawal) => {
                const methodLabel = withdrawal.method === 'bank_transfer' 
                  ? `Bank ${withdrawal.bankCode}` 
                  : withdrawal.bankCode || 'E-Wallet';
                
                const withdrawalStatusConfig: Record<string, { text: string; color: string }> = {
                  completed: { text: t('dashboard.withdrawalStatus.completed'), color: 'text-green-600 dark:text-green-400' },
                  pending: { text: t('dashboard.withdrawalStatus.pending'), color: 'text-yellow-600 dark:text-yellow-400' },
                  rejected: { text: t('dashboard.withdrawalStatus.rejected'), color: 'text-red-600 dark:text-red-400' },
                };
                const status = withdrawalStatusConfig[withdrawal.status] || withdrawalStatusConfig.pending;

                return (
                  <Link key={withdrawal.id} href={`/dashboard/withdrawals/${withdrawal.withdrawalId}`} className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-50 dark:bg-red-900/20">
                        <ArrowDownLeft className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('dashboard.activityLabels.withdrawBalance')}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className={status.color}>{status.text}</span>
                          {mounted && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">-</span>
                              <span>{methodLabel} - {withdrawal.accountName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          -{formatIDR(withdrawal.amount)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hasMoreWithdrawals && (
              <div className="pt-6 text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {t('dashboardPages.orders.loadMore')} ({withdrawals.length - visibleItems} {t('dashboardPages.orders.remaining')})
                </button>
              </div>
            )}
          </>)
        ) : currentFilter === 'transfer' ? (
          transfers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('dashboardPages.orders.noTransfer')}</p>
              <Link
                href="/dashboard/transfer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Send className="h-4 w-4" />
                {t('dashboardPages.orders.transferBalance')}
              </Link>
            </div>
          ) : (<>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleTransfers.map((transfer) => {
                const isSent = transfer.type === 'sent';
                const personName = isSent ? transfer.receiverName : transfer.senderName;

                return (
                  <Link key={transfer.id} href={`/dashboard/transfers/${transfer.transferId}`} className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                      }`}>
                        <Send className={`h-5 w-5 ${
                          isSent ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {isSent ? t('dashboard.activityLabels.sendBalance') : t('dashboard.activityLabels.receiveBalance')}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="text-green-600 dark:text-green-400">{t('dashboard.activityLabels.success')}</span>
                          {mounted && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">-</span>
                              <span>{isSent ? t('dashboard.activityLabels.to') : t('dashboard.activityLabels.from')}: {personName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-medium ${
                          isSent ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {isSent ? '-' : '+'}{formatIDR(transfer.amount)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hasMoreTransfers && (
              <div className="pt-6 text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {t('dashboardPages.orders.loadMore')} ({transfers.length - visibleItems} {t('dashboardPages.orders.remaining')})
                </button>
              </div>
            )}
          </>)
        ) : (
          orders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('dashboardPages.orders.noOrders')}</p>
              {currentFilter === 'all' && (
                <Link
                  href="/order"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {t('dashboardPages.orders.createOrder')}
                </Link>
              )}
            </div>
          ) : (<>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleOrders.map((order) => {
                const serviceLabel = 
                  order.serviceType === 'cryptocurrency' ? order.cryptoSymbol :
                  order.serviceType === 'paypal' ? 'PayPal' : 'Skrill';
                
                const isSell = order.transactionType === 'sell';
                const transactionLabel = isSell ? t('dashboard.orderType.sell') : t('dashboard.orderType.buy');
                
                const statusConfig: Record<string, { text: string; color: string }> = {
                  completed: { text: t('dashboard.orderStatus.completed'), color: 'text-green-600 dark:text-green-400' },
                  pending: { text: t('dashboard.orderStatus.pending'), color: 'text-yellow-600 dark:text-yellow-400' },
                  processing: { text: t('dashboard.orderStatus.processing'), color: 'text-blue-600 dark:text-blue-400' },
                  expired: { text: t('dashboard.orderStatus.expired'), color: 'text-red-600 dark:text-red-400' },
                  cancelled: { text: t('dashboard.orderStatus.cancelled'), color: 'text-red-600 dark:text-red-400' },
                };
                const status = statusConfig[order.status] || statusConfig.pending;

                const targetUrl = (order.status === 'pending' || order.status === 'processing')
                  ? `/order/instructions/${order.orderId}`
                  : `/order/${order.orderId}`;

                const isExpiredOrCancelled = order.status === 'expired' || order.status === 'cancelled';
                const amountColorClass = isExpiredOrCancelled 
                  ? 'text-gray-400 dark:text-gray-500 line-through' 
                  : isSell 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400';
                const amountSign = isExpiredOrCancelled ? '' : (isSell ? '+' : '-');

                return (
                  <Link key={order.id} href={targetUrl} className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isExpiredOrCancelled 
                          ? 'bg-gray-100 dark:bg-gray-800' 
                          : isSell 
                            ? 'bg-green-50 dark:bg-green-900/20' 
                            : 'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        {isSell ? (
                          <ArrowDownLeft className={`h-5 w-5 ${isExpiredOrCancelled ? 'text-gray-400 dark:text-gray-500' : 'text-green-600 dark:text-green-400'}`} />
                        ) : (
                          <ArrowUpRight className={`h-5 w-5 ${isExpiredOrCancelled ? 'text-gray-400 dark:text-gray-500' : 'text-red-600 dark:text-red-400'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {transactionLabel} {serviceLabel}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className={status.color}>{status.text}</span>
                          {mounted && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">-</span>
                              <span>#{order.orderId}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-medium ${amountColorClass}`}>
                          {amountSign}{formatIDR(order.amountIdr)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hasMoreOrders && (
              <div className="pt-6 text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {t('dashboardPages.orders.loadMore')} ({orders.length - visibleItems} {t('dashboardPages.orders.remaining')})
                </button>
              </div>
            )}
          </>)
        )}
      </div>
    </div>
  );
}
