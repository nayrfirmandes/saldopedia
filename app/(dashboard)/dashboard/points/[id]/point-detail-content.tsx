'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { ArrowLeft, Coins, TrendingUp, TrendingDown, Gift, Users, Clock, Hash, FileText } from 'lucide-react';

interface PointTransactionDetail {
  id: number;
  type: 'referral_bonus' | 'referred_bonus' | 'redeem' | 'expired' | 'adjustment';
  amount: number;
  description: string | null;
  createdAt: string;
  referralInfo?: {
    referredUserName: string;
    referredUserEmail: string;
  } | null;
}

interface PointDetailContentProps {
  transaction: PointTransactionDetail;
}

export default function PointDetailContent({ transaction }: PointDetailContentProps) {
  const { t, language } = useLanguage();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      referral_bonus: t('dashboard.points.typeReferralBonus'),
      referred_bonus: t('dashboard.points.typeReferredBonus'),
      redeem: t('dashboard.points.typeRedeem'),
      expired: t('dashboard.points.typeExpired'),
      adjustment: t('dashboard.points.typeAdjustment'),
    };
    return typeMap[type] || type;
  };

  const getTypeDescription = (type: string) => {
    const descMap: Record<string, string> = {
      referral_bonus: t('dashboard.points.descReferralBonus'),
      referred_bonus: t('dashboard.points.descReferredBonus'),
      redeem: t('dashboard.points.descRedeem'),
      expired: t('dashboard.points.descExpired'),
      adjustment: t('dashboard.points.descAdjustment'),
    };
    return descMap[type] || '';
  };

  const getTypeIcon = () => {
    if (transaction.amount > 0) {
      return <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />;
    } else {
      return <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />;
    }
  };

  const getTypeColor = () => {
    if (transaction.amount > 0) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    } else {
      return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    }
  };

  const idrEquivalent = transaction.type === 'redeem' 
    ? Math.abs(transaction.amount) * 0.5 
    : null;

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href="/dashboard/points"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('dashboard.points.backToPoints')}
      </Link>

      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getTypeColor()} mb-4`}>
          {getTypeIcon()}
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {getTypeLabel(transaction.type)}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getTypeDescription(transaction.type)}
        </p>
      </div>

      <div className="text-center mb-8 py-6 border-y border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {t('dashboard.points.pointsAmount')}
        </p>
        <p className={`text-4xl font-bold ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {transaction.amount > 0 ? '+' : ''}{formatNumber(transaction.amount)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('dashboard.points.pointsUnit')}
        </p>
        
        {idrEquivalent && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {t('dashboard.points.convertedTo')} Rp {formatNumber(idrEquivalent)}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
          <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.points.transactionId')}
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              PT-{transaction.id.toString().padStart(6, '0')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.points.transactionTime')}
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(transaction.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
          <Coins className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.points.transactionType')}
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {getTypeLabel(transaction.type)}
            </p>
          </div>
        </div>

        {transaction.referralInfo && (
          <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
            <Users className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {transaction.type === 'referral_bonus' 
                  ? t('dashboard.points.referredFriend')
                  : t('dashboard.points.invitedBy')
                }
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {transaction.referralInfo.referredUserName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {transaction.referralInfo.referredUserEmail}
              </p>
            </div>
          </div>
        )}

        {(() => {
          const getLocalizedDescription = () => {
            if (transaction.type === 'referral_bonus') {
              return t('dashboard.points.descReferralBonus');
            }
            if (transaction.type === 'referred_bonus') {
              return t('dashboard.points.descReferredBonus');
            }
            if (transaction.type === 'expired') {
              return t('dashboard.points.descExpired');
            }
            if (transaction.type === 'adjustment') {
              return transaction.description || t('dashboard.points.descAdjustment');
            }
            if (transaction.type === 'redeem') {
              return t('dashboard.points.descRedeem');
            }
            return transaction.description;
          };
          const desc = getLocalizedDescription();
          return desc ? (
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('dashboard.points.notes')}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {desc}
                </p>
              </div>
            </div>
          ) : null;
        })()}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/dashboard/points"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Coins className="w-4 h-4" />
          {t('dashboard.points.viewAllPoints')}
        </Link>
      </div>
    </div>
  );
}
