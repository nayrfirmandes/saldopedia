'use client';

import { useLanguage } from '@/contexts/language-context';
import { FormatSaldo } from '@/components/format-saldo';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Send, CheckCircle } from 'lucide-react';

interface Transfer {
  transferId: string;
  senderId: number;
  receiverId: number;
  amount: string;
  notes: string | null;
  createdAt: string;
  type: 'sent' | 'received';
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
}

interface TransferDetailContentProps {
  transfer: Transfer;
}

export default function TransferDetailContent({ transfer }: TransferDetailContentProps) {
  const { t } = useLanguage();
  const isSent = transfer.type === 'sent';

  const formatIDR = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('dashboardPages.transferDetail.backToHistory')}
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSent ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
            }`}>
              {isSent ? (
                <Send className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {isSent ? t('dashboardPages.transferDetail.outgoingTransfer') : t('dashboardPages.transferDetail.incomingTransfer')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                #{transfer.transferId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{t('dashboardPages.transferDetail.completed')}</span>
          </div>
        </div>

        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboardPages.transferDetail.transferAmount')}</p>
          <p className={`text-4xl font-semibold tracking-tight ${isSent ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            <FormatSaldo amount={transfer.amount} showSign={isSent ? 'negative' : 'positive'} />
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8 space-y-4">
        {isSent ? (
          <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.transferDetail.sentTo')}</span>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900 dark:text-white block">{transfer.receiverName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{transfer.receiverEmail}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.transferDetail.receivedFrom')}</span>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900 dark:text-white block">{transfer.senderName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{transfer.senderEmail}</span>
            </div>
          </div>
        )}
        <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.transferDetail.date')}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{transfer.createdAt}</span>
        </div>
        
        {transfer.notes && (
          <div className="pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboardPages.transferDetail.notes')}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{transfer.notes}</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex justify-end">
        <Link
          href="/dashboard/orders"
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {t('dashboardPages.transferDetail.back')}
        </Link>
      </div>
    </div>
  );
}
