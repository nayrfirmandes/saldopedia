'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { Coins, ArrowRight, Gift, TrendingUp, TrendingDown, RefreshCw, ArrowLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { PointsHistory } from '@/lib/points';

interface User {
  id: number;
  name: string;
  email: string;
}

interface PointsContentProps {
  user: User;
  history: PointsHistory;
  emailVerified: boolean;
  phoneVerified: boolean;
}

const MIN_REDEEM_POINTS = 100000;
const POINTS_TO_IDR_RATE = 0.5;

export default function PointsContent({ user, history, emailVerified, phoneVerified }: PointsContentProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPoints, setCurrentPoints] = useState(history.currentBalance);

  const isVerified = emailVerified && phoneVerified;
  const canRedeem = currentPoints >= MIN_REDEEM_POINTS && isVerified;
  const redeemableAmount = Math.floor(currentPoints / 10000) * 10000;
  const idrEquivalent = redeemableAmount * POINTS_TO_IDR_RATE;

  const handleRedeem = async () => {
    if (!canRedeem) {
      setError(t('dashboard.points.insufficientPoints'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/points/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: redeemableAmount }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(t('dashboard.points.redeemSuccess'));
        setCurrentPoints(data.newBalance);
        setTimeout(() => router.refresh(), 1500);
      } else {
        setError(data.error || t('dashboard.points.redeemFailed'));
      }
    } catch (err) {
      setError(t('dashboard.points.genericError'));
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      referral_bonus: t('dashboard.points.typeReferralBonus'),
      referred_bonus: t('dashboard.points.typeReferredBonus'),
      redeem: t('dashboard.points.typeRedeem'),
      expired: t('dashboard.points.typeExpired'),
      adjustment: t('dashboard.points.typeAdjustment'),
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('dashboardPages.orders.backToDashboard')}
      </Link>
      
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {t('dashboard.points.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('dashboard.points.subtitle')}
        </p>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Coins className="w-4 h-4 text-amber-500" />
          <span>{t('dashboard.points.currentBalance')}</span>
        </div>
        <p className="text-4xl font-bold text-gray-900 dark:text-white">
          {formatNumber(currentPoints)} <span className="text-lg font-normal text-gray-500">{t('dashboard.points.pointsUnit')}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t('dashboard.points.exchangeRate')}: {t('dashboard.points.exchangeRateValue')}
        </p>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-2 text-center">
          {t('dashboard.points.redeemTitle')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          {t('dashboard.points.redeemDescription')}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {!isVerified && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {language === 'id' ? 'Verifikasi Diperlukan' : 'Verification Required'}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {language === 'id' 
                    ? 'Untuk menukarkan poin, Anda harus memverifikasi email dan nomor HP terlebih dahulu.'
                    : 'To redeem points, you must verify your email and phone number first.'}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {!emailVerified && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                      {language === 'id' ? 'Email belum terverifikasi' : 'Email not verified'}
                    </span>
                  )}
                  {!phoneVerified && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                      {language === 'id' ? 'HP belum terverifikasi' : 'Phone not verified'}
                    </span>
                  )}
                </div>
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mt-2"
                >
                  {language === 'id' ? 'Verifikasi di Pengaturan' : 'Verify in Settings'}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {canRedeem ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 py-3">
              <p className="font-medium text-gray-900 dark:text-white">
                {formatNumber(redeemableAmount)} {t('dashboard.points.pointsUnit')}
              </p>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <p className="font-semibold text-green-600 dark:text-green-400">
                Rp {formatNumber(idrEquivalent)}
              </p>
            </div>

            <button
              onClick={handleRedeem}
              disabled={loading}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t('dashboard.points.redeeming')}
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5" />
                  {t('dashboard.points.redeemButton')}
                </>
              )}
            </button>
          </div>
        ) : currentPoints >= MIN_REDEEM_POINTS && !isVerified ? (
          <div className="py-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'id' 
                ? 'Poin Anda cukup untuk ditukarkan, silakan verifikasi akun terlebih dahulu.'
                : 'You have enough points to redeem, please verify your account first.'}
            </p>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t('dashboard.points.insufficientPoints')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {formatNumber(currentPoints)} / {formatNumber(MIN_REDEEM_POINTS)} {t('dashboard.points.pointsUnit')}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
          {t('dashboard.points.pointsHistory')}
        </h2>
        
        {history.transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('dashboard.points.noHistory')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {history.transactions.map((tx) => {
              const getDescription = () => {
                if (tx.type === 'redeem') {
                  const pointsAbs = Math.abs(tx.amount);
                  const idrAmount = pointsAbs * 0.5;
                  return t('dashboard.points.redeemDesc')
                    .replace('{points}', formatNumber(pointsAbs))
                    .replace('{idr}', formatNumber(idrAmount));
                }
                if (tx.type === 'referral_bonus') {
                  return t('dashboard.points.descReferralBonus');
                }
                if (tx.type === 'referred_bonus') {
                  return t('dashboard.points.descReferredBonus');
                }
                if (tx.type === 'expired') {
                  return t('dashboard.points.descExpired');
                }
                if (tx.type === 'adjustment') {
                  return tx.description || t('dashboard.points.descAdjustment');
                }
                return tx.description;
              };

              const description = getDescription();

              return (
                <Link 
                  key={tx.id}
                  href={`/dashboard/points/${tx.id}`}
                  className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(tx.type, tx.amount)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{getTypeLabel(tx.type)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(tx.createdAt)}</p>
                      {description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatNumber(tx.amount)}
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
