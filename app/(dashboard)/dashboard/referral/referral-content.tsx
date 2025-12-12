'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { Copy, Check, Share2, Users, Gift, MessageCircle, ArrowLeft } from 'lucide-react';
import { ReferralStats } from '@/lib/referral-stats';

interface User {
  id: number;
  name: string;
  email: string;
}

interface ReferralContentProps {
  user: User;
  stats: ReferralStats;
}

export default function ReferralContent({ user, stats }: ReferralContentProps) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = stats.referralCode || '';
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `https://saldopedia.com/register?ref=${referralCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const message = t('dashboard.referral.whatsappShareMessage')
      .replace('{code}', referralCode)
      .replace('{link}', referralLink);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
          {t('dashboard.referral.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('dashboard.referral.subtitle')}
        </p>
      </div>

      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {t('dashboard.referral.yourCode')}
        </p>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-6 py-3">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              {referralCode || '-'}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title={t('dashboard.referral.copyCode')}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copiedLink ? t('dashboard.referral.copied') : t('dashboard.referral.copyLink')}
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t('dashboard.referral.shareWhatsApp')}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">{t('dashboard.referral.bonusInfo')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('dashboard.referral.yourBonus')}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">17.000</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.referral.perReferral')}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">{t('dashboard.referral.friendBonus')}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">27.000</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.referral.whenSignUp')}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalReferrals}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.referral.totalReferrals')}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatNumber(stats.totalPointsEarned)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.referral.totalEarned')}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
          {t('dashboard.referral.referralHistory')}
        </h2>
        
        {stats.referrals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('dashboard.referral.noReferrals')}</p>
            <p className="text-sm mt-1">{t('dashboard.referral.shareToStart')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.referrals.map((referral) => (
              <div 
                key={referral.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{referral.referredName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(referral.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    +{formatNumber(referral.pointsAwarded)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
