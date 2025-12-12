'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowDownLeft, Wallet, Building2, Smartphone, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { FormatSaldo } from '@/components/format-saldo';
import { useBrowserFingerprint } from '@/hooks/use-browser-fingerprint';

interface SessionUser {
  id: number;
  email: string;
  name: string;
  saldo: string;
}

interface Withdrawal {
  id: number;
  withdrawalId: string;
  amount: string;
  fee: string;
  netAmount: string;
  method: string;
  bankCode: string | null;
  accountName: string;
  accountNumber: string;
  status: string;
  createdAt: string;
}

const BANKS = [
  { code: 'bca', name: 'BCA' },
  { code: 'mandiri', name: 'Mandiri' },
  { code: 'bni', name: 'BNI' },
  { code: 'bri', name: 'BRI' },
  { code: 'cimb', name: 'CIMB Niaga' },
  { code: 'permata', name: 'Permata' },
];

const EWALLETS = [
  { code: 'dana', name: 'DANA' },
  { code: 'ovo', name: 'OVO' },
  { code: 'gopay', name: 'GoPay' },
  { code: 'shopeepay', name: 'ShopeePay' },
];

export default function WithdrawContent({ user }: { user: SessionUser }) {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { t } = useLanguage();
  const { getFingerprintData } = useBrowserFingerprint();
  
  const [method, setMethod] = useState<'bank_transfer' | 'ewallet'>('bank_transfer');
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState(user.name);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [visibleItems, setVisibleItems] = useState(5);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((error || success) && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error, success]);

  const saldo = Number(user.saldo);
  const withdrawAmount = Number(amount) || 0;
  const minimumWithdraw = 50000;
  const FEE_THRESHOLD = 1000000;
  const WITHDRAWAL_FEE = 17000;
  
  const fee = withdrawAmount < FEE_THRESHOLD && withdrawAmount >= minimumWithdraw ? WITHDRAWAL_FEE : 0;
  const netAmount = withdrawAmount - fee;
  const remainingSaldo = saldo - withdrawAmount;

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/withdrawals');
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (withdrawAmount < minimumWithdraw) {
      setError(t('dashboardPages.withdraw.minimumError').replace('{amount}', minimumWithdraw.toLocaleString('id-ID')));
      return;
    }

    if (withdrawAmount > saldo) {
      setError(t('dashboardPages.withdraw.insufficientBalance'));
      return;
    }

    if (!accountName || !accountNumber) {
      setError(t('dashboardPages.withdraw.completeAccountData'));
      return;
    }

    if (!bankCode) {
      setError(method === 'bank_transfer' ? t('dashboardPages.withdraw.selectBankError') : t('dashboardPages.withdraw.selectEWalletError'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: withdrawAmount,
          method,
          bankCode,
          accountName,
          accountNumber,
          browserFingerprint: getFingerprintData(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('dashboardPages.withdraw.genericError'));
        return;
      }

      setSuccess(t('dashboardPages.withdraw.successMessage').replace('{id}', data.withdrawalId));
      setAmount('');
      setAccountNumber('');
      
      try {
        await refreshAuth();
        await fetchWithdrawals();
      } catch (refreshErr) {
        console.error('Failed to refresh data:', refreshErr);
      }
    } catch (err) {
      setError(t('dashboardPages.withdraw.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="w-3 h-3" /> {t('dashboardPages.withdraw.status.completed')}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 rounded-full">
            <Clock className="w-3 h-3" /> {t('dashboardPages.withdraw.status.processing')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30 rounded-full">
            <XCircle className="w-3 h-3" /> {t('dashboardPages.withdraw.status.rejected')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 rounded-full">
            <Clock className="w-3 h-3" /> {t('dashboardPages.withdraw.status.pending')}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('dashboardPages.withdraw.backToDashboard')}
        </Link>

        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboardPages.withdraw.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Saldo: <FormatSaldo amount={saldo} className="font-semibold text-gray-900 dark:text-white" />
              </p>
            </div>
          </div>

          {error && (
            <div ref={messageRef} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div ref={messageRef} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('dashboardPages.withdraw.withdrawMethod')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setMethod('bank_transfer'); setBankCode(''); }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm transition-colors ${
                    method === 'bank_transfer'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{t('dashboardPages.withdraw.bankTransfer')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('ewallet'); setBankCode(''); }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm transition-colors ${
                    method === 'ewallet'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span className="font-medium">{t('dashboardPages.withdraw.eWallet')}</span>
                </button>
              </div>
            </div>

            {method === 'bank_transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('dashboardPages.withdraw.selectBank')}
                </label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                >
                  <option value="">{t('dashboardPages.withdraw.selectBankPlaceholder')}</option>
                  {BANKS.map((bank) => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>
            )}

            {method === 'ewallet' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('dashboardPages.withdraw.selectEWallet')}
                </label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                >
                  <option value="">{t('dashboardPages.withdraw.selectEWalletPlaceholder')}</option>
                  {EWALLETS.map((ew) => (
                    <option key={ew.code} value={ew.code}>{ew.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('dashboardPages.withdraw.accountHolderName')}
              </label>
              <input
                type="text"
                value={accountName}
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed text-base"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {t('dashboardPages.withdraw.accountNameLockedNote')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {method === 'bank_transfer' ? t('dashboardPages.withdraw.accountNumber') : t('dashboardPages.withdraw.eWalletNumber')}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={method === 'bank_transfer' ? t('dashboardPages.withdraw.accountNumberPlaceholder') : t('dashboardPages.withdraw.eWalletNumberPlaceholder')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('dashboardPages.withdraw.withdrawAmountLabel')}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('dashboardPages.withdraw.minimumPlaceholder')}
                min={minimumWithdraw}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('dashboardPages.withdraw.feeNote')}
              </p>
            </div>

            {withdrawAmount >= minimumWithdraw && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.withdraw.withdrawAmount')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">Rp {withdrawAmount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.withdraw.adminFee')}</span>
                  <span className={`font-medium ${fee > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                    {fee > 0 ? `-Rp ${fee.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : t('dashboardPages.withdraw.free')}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between">
                  <span className="text-gray-900 dark:text-white font-semibold">{t('dashboardPages.withdraw.amountReceived')}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Rp {netAmount.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className={`flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-600 ${remainingSaldo >= 0 ? '' : 'text-red-500'}`}>
                  <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.withdraw.remainingBalance')}</span>
                  <span className={`font-medium ${remainingSaldo >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                    Rp {remainingSaldo.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || withdrawAmount < minimumWithdraw || withdrawAmount > saldo}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? t('dashboardPages.withdraw.processing') : t('dashboardPages.withdraw.submitWithdraw')}
            </button>
          </form>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('dashboardPages.withdraw.history')}</h2>
          
          {loadingHistory ? (
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="-mx-2 px-2 py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-48 animate-pulse" />
                  </div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">{t('dashboardPages.withdraw.noHistory')}</p>
            </div>
          ) : (<>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {withdrawals.slice(0, visibleItems).map((w) => {
                const methodLabel = w.bankCode?.toUpperCase() || (w.method === 'bank_transfer' ? t('dashboardPages.withdraw.bankTransfer') : t('dashboardPages.withdraw.eWallet'));
                const statusConfig: Record<string, { text: string; color: string }> = {
                  completed: { text: t('dashboardPages.withdraw.status.completed'), color: 'text-green-600 dark:text-green-400' },
                  pending: { text: t('dashboardPages.withdraw.status.pending'), color: 'text-yellow-600 dark:text-yellow-400' },
                  rejected: { text: t('dashboardPages.withdraw.status.rejected'), color: 'text-red-600 dark:text-red-400' },
                };
                const status = statusConfig[w.status] || statusConfig.pending;
                
                return (
                  <Link 
                    key={w.id} 
                    href={`/dashboard/withdrawals/${w.withdrawalId}`}
                    className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/20">
                        <ArrowDownLeft className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t('dashboardPages.withdraw.title')}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className={status.color}>{status.text}</span>
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                          <span>{methodLabel} - {w.accountNumber}</span>
                          <span className="text-gray-300 dark:text-gray-600">-</span>
                          <span>{new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        -Rp {Number(w.amount).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            {visibleItems < withdrawals.length && (
              <div className="pt-6 text-center">
                <button
                  onClick={() => setVisibleItems(prev => prev + 5)}
                  className="px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {t('dashboardPages.orders.loadMore')} ({withdrawals.length - visibleItems} {t('dashboardPages.orders.remaining')})
                </button>
              </div>
            )}
          </>)}
        </div>
      </div>
    </div>
  );
}
