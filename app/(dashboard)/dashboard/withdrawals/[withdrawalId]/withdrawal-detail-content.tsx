'use client';

import { useLanguage } from '@/contexts/language-context';
import { FormatSaldo } from '@/components/format-saldo';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, XCircle, ArrowDownLeft, Loader2 } from 'lucide-react';

interface Withdrawal {
  withdrawalId: string;
  userId: number;
  amount: string;
  fee: string;
  netAmount: string;
  method: string;
  bankCode: string | null;
  accountName: string;
  accountNumber: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  processedAt: string | null;
  completedAt: string | null;
}

interface WithdrawalDetailContentProps {
  withdrawal: Withdrawal;
}

export default function WithdrawalDetailContent({ withdrawal }: WithdrawalDetailContentProps) {
  const { t } = useLanguage();

  const formatIDR = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMethodLabel = (method: string, bankCode: string | null) => {
    if (method === 'bank_transfer') {
      const bankLabels: Record<string, string> = {
        'bca': 'Bank BCA',
        'bni': 'Bank BNI',
        'bri': 'Bank BRI',
        'mandiri': 'Bank Mandiri',
      };
      return bankLabels[bankCode || ''] || `Bank Transfer (${bankCode})`;
    }
    if (method === 'ewallet') {
      const ewalletLabels: Record<string, string> = {
        'gopay': 'GoPay',
        'ovo': 'OVO',
        'dana': 'DANA',
        'shopeepay': 'ShopeePay',
      };
      return ewalletLabels[bankCode || ''] || `E-Wallet (${bankCode})`;
    }
    return method;
  };

  const statusConfig = {
    completed: { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20', textKey: 'dashboardPages.withdrawDetail.status.completed', icon: CheckCircle },
    pending: { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', textKey: 'dashboardPages.withdrawDetail.status.pending', icon: Clock },
    processing: { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/20', textKey: 'dashboardPages.withdrawDetail.status.processing', icon: Loader2 },
    rejected: { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20', textKey: 'dashboardPages.withdrawDetail.status.rejected', icon: XCircle },
  };

  const status = statusConfig[withdrawal.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('dashboardPages.withdrawDetail.backToHistory')}
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(() => {
            const isRejected = withdrawal.status === 'rejected';
            return (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isRejected ? 'bg-gray-100 dark:bg-gray-700' : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                <ArrowDownLeft className={`h-5 w-5 ${
                  isRejected ? 'text-gray-400 dark:text-gray-500' : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
            );
          })()}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('dashboardPages.withdrawDetail.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              #{withdrawal.withdrawalId}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bgColor} ${status.color}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{t(status.textKey)}</span>
        </div>
      </div>

      {withdrawal.status === 'rejected' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <XCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
            {t('dashboardPages.withdrawDetail.rejected')}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400 mb-6">
            {t('dashboardPages.withdrawDetail.rejectedDesc')}
          </p>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboardPages.withdrawDetail.withdrawAmount')}</p>
        {(() => {
          const isRejected = withdrawal.status === 'rejected';
          const amountColorClass = isRejected 
            ? 'text-gray-400 dark:text-gray-500 line-through' 
            : 'text-red-600 dark:text-red-400';
          return (
            <p className={`text-3xl font-bold ${amountColorClass}`}>
              <FormatSaldo amount={withdrawal.amount} showSign={isRejected ? 'none' : 'negative'} />
            </p>
          );
        })()}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8 space-y-4">
        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.withdrawDetail.amount')}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white"><FormatSaldo amount={withdrawal.amount} /></span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.withdrawDetail.adminFee')}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white"><FormatSaldo amount={withdrawal.fee} /></span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.withdrawDetail.amountReceived')}</span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400"><FormatSaldo amount={withdrawal.netAmount} /></span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.withdrawDetail.method')}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {getMethodLabel(withdrawal.method, withdrawal.bankCode)}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.withdrawDetail.accountName')}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{withdrawal.accountName}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.withdrawDetail.accountNumber')}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{withdrawal.accountNumber}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.withdrawDetail.createdDate')}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{withdrawal.createdAt}</span>
        </div>
        {withdrawal.processedAt && (
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.withdrawDetail.processedDate')}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{withdrawal.processedAt}</span>
          </div>
        )}
        {withdrawal.completedAt && (
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.withdrawDetail.completedDate')}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{withdrawal.completedAt}</span>
          </div>
        )}
        
        {withdrawal.adminNotes && (
          <div className="pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboardPages.withdrawDetail.adminNotes')}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{withdrawal.adminNotes}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex justify-end">
        <Link
          href="/dashboard/orders"
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {t('dashboardPages.withdrawDetail.back')}
        </Link>
      </div>
    </div>
  );
}
