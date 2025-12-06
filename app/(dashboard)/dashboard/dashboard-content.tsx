'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, Plus, Clock, ChevronRight, Wallet, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { FormatSaldo } from '@/components/format-saldo';

type Order = {
  id: number;
  order_id: string;
  service_type: string;
  crypto_symbol: string | null;
  transaction_type: string;
  amount_idr: string;
  status: string;
  created_at: string;
  created_at_raw: number;
  expires_at: string | null;
};

type Deposit = {
  id: number;
  deposit_id: string;
  amount: string;
  method: string;
  bank_code: string | null;
  status: string;
  created_at: string;
  created_at_raw: number;
  confirmed_at: string | null;
};

type Withdrawal = {
  id: number;
  withdrawalId: string;
  amount: string;
  method: string;
  bankCode: string | null;
  accountName: string;
  status: string;
  created_at: string;
  created_at_raw: number;
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
  created_at: string;
  created_at_raw: number;
};

type User = {
  id: number;
  email: string;
  name: string;
  saldo: string;
};

type DashboardContentProps = {
  user: User;
  userOrders: Order[];
  userDeposits: Deposit[];
  userWithdrawals: Withdrawal[];
  userTransfers: Transfer[];
};

export default function DashboardContent({ user, userOrders, userDeposits, userWithdrawals, userTransfers }: DashboardContentProps) {
  const { t } = useLanguage();
  const orders = userOrders;
  const deposits = userDeposits;
  const withdrawals = userWithdrawals;
  const transfers = userTransfers;
  const saldo = user.saldo;
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');

  const formatIDR = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user.name ? user.name.split(' ')[0] : user.email.split('@')[0];
    
    if (hour >= 5 && hour < 11) {
      return t('dashboard.greetingMorning').replace('{name}', firstName);
    } else if (hour >= 11 && hour < 15) {
      return t('dashboard.greetingAfternoon').replace('{name}', firstName);
    } else if (hour >= 15 && hour < 18) {
      return t('dashboard.greetingEvening').replace('{name}', firstName);
    } else {
      return t('dashboard.greetingNight').replace('{name}', firstName);
    }
  };

  useEffect(() => {
    setMounted(true);
    setGreeting(getGreeting());
  }, [user.name, t]);

  type ActivityItem = 
    | { type: 'order'; data: Order; timestamp: number }
    | { type: 'deposit'; data: Deposit; timestamp: number }
    | { type: 'withdrawal'; data: Withdrawal; timestamp: number }
    | { type: 'transfer'; data: Transfer; timestamp: number };

  const allActivity: ActivityItem[] = [
    ...orders.map(order => ({
      type: 'order' as const,
      data: order,
      timestamp: order.created_at_raw
    })),
    ...deposits.map(deposit => ({
      type: 'deposit' as const,
      data: deposit,
      timestamp: deposit.created_at_raw
    })),
    ...withdrawals.map(withdrawal => ({
      type: 'withdrawal' as const,
      data: withdrawal,
      timestamp: withdrawal.created_at_raw
    })),
    ...transfers.map(transfer => ({
      type: 'transfer' as const,
      data: transfer,
      timestamp: transfer.created_at_raw
    }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-8">
      {mounted && (
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{greeting}</h1>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.balance')}</p>
          <p className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight">
            <FormatSaldo amount={saldo} />
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            <Link
              href="/dashboard/deposit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.actions.topUp')}</span>
              <span className="sm:hidden">{t('dashboard.actions.depositShort')}</span>
            </Link>
            <Link
              href="/dashboard/withdraw"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              <ArrowDownLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.actions.withdraw')}</span>
              <span className="sm:hidden">{t('dashboard.actions.withdrawShort')}</span>
            </Link>
            <Link
              href="/dashboard/transfer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              <Send className="h-4 w-4" />
              {t('dashboard.actions.transfer')}
            </Link>
          </div>
          <Link
            href="/order"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {t('dashboard.actions.createOrder')}
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('dashboard.recentActivity.title')}</h2>
          {allActivity.length > 0 && (
            <Link 
              href="/dashboard/orders" 
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              {t('dashboard.recentActivity.viewAll')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {allActivity.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('dashboard.recentActivity.noTransactions')}</p>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('dashboard.recentActivity.createFirst')}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {allActivity.slice(0, 5).map((item) => {
              if (item.type === 'order') {
                const order = item.data;
                const serviceLabel = 
                  order.service_type === 'cryptocurrency' ? order.crypto_symbol :
                  order.service_type === 'paypal' ? 'PayPal' : 'Skrill';
                
                const isSell = order.transaction_type === 'sell';
                const transactionLabel = isSell ? t('dashboard.orderType.sell') : t('dashboard.orderType.buy');
                
                const statusConfig: Record<string, { text: string; color: string }> = {
                  completed: { text: t('dashboard.orderStatus.completed'), color: 'text-green-600 dark:text-green-400' },
                  pending: { text: t('dashboard.orderStatus.pending'), color: 'text-yellow-600 dark:text-yellow-400' },
                  processing: { text: t('dashboard.orderStatus.processing'), color: 'text-blue-600 dark:text-blue-400' },
                  pending_proof: { text: t('dashboard.orderStatus.pendingProof'), color: 'text-orange-600 dark:text-orange-400' },
                  expired: { text: t('dashboard.orderStatus.expired'), color: 'text-gray-400 dark:text-gray-500' },
                  cancelled: { text: t('dashboard.orderStatus.cancelled'), color: 'text-gray-400 dark:text-gray-500' },
                };
                const status = statusConfig[order.status] || statusConfig.pending;
                
                const targetUrl = (order.status === 'pending' || order.status === 'processing' || order.status === 'pending_proof')
                  ? `/order/instructions/${order.order_id}`
                  : `/order/${order.order_id}`;

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
                              <span>{order.created_at}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-medium ${amountColorClass}`}>
                          {amountSign}{formatIDR(order.amount_idr)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              } else if (item.type === 'deposit') {
                const deposit = item.data;
                const methodLabel = deposit.method === 'bank_transfer' 
                  ? `Bank ${deposit.bank_code}` 
                  : deposit.bank_code || 'E-Wallet';
                
                const depositStatusConfig: Record<string, { text: string; color: string }> = {
                  completed: { text: t('dashboard.depositStatus.completed'), color: 'text-green-600 dark:text-green-400' },
                  pending: { text: t('dashboard.depositStatus.pending'), color: 'text-yellow-600 dark:text-yellow-400' },
                  expired: { text: t('dashboard.depositStatus.expired'), color: 'text-gray-400 dark:text-gray-500' },
                  rejected: { text: t('dashboard.depositStatus.rejected'), color: 'text-red-600 dark:text-red-400' },
                };
                const status = depositStatusConfig[deposit.status] || depositStatusConfig.pending;

                return (
                  <Link key={`deposit-${deposit.id}`} href={`/dashboard/deposits/${deposit.deposit_id}`} className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                          <span>{isSent ? t('dashboard.activityLabels.to') : t('dashboard.activityLabels.from')}: {personName}</span>
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
        )}

        {allActivity.length > 5 && (
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link 
              href="/dashboard/orders" 
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {t('dashboard.recentActivity.viewAll')} ({allActivity.length} {t('dashboard.activityLabels.transactions')})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
