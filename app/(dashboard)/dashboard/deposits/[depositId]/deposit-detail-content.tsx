'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertTriangle, ArrowUpRight, Upload, X, Loader2, Copy, Check } from 'lucide-react';
import { adminPaymentConfig } from '@/lib/payment-config';

interface Deposit {
  depositId: string;
  userId: number;
  amount: string;
  fee: string;
  uniqueCode: number;
  totalAmount: string;
  method: string;
  bankCode: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  expiresAt: string | null;
  completedAt: string | null;
}

interface DepositDetailContentProps {
  deposit: Deposit;
}

export default function DepositDetailContent({ deposit }: DepositDetailContentProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const getTargetAccount = () => {
    if (deposit.method === 'bank_transfer') {
      const bank = adminPaymentConfig.bankAccounts.find(b => b.bank === deposit.bankCode);
      if (bank) return { name: bank.accountName, number: bank.accountNumber };
    } else if (deposit.method === 'ewallet') {
      const wallet = adminPaymentConfig.ewallets.find(w => w.provider === deposit.bankCode);
      if (wallet) return { name: wallet.accountName, number: wallet.phoneNumber };
    }
    return { name: 'Saldopedia', number: deposit.bankCode || '' };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('dashboardPages.depositDetail.fileFormatError'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t('dashboardPages.depositDetail.fileSizeError'));
      return;
    }

    setProofFile(file);
    setError('');

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setProofPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const removeFile = () => {
    setProofFile(null);
    setProofPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadProof = async () => {
    if (!proofFile) {
      setError(t('dashboardPages.depositDetail.uploadProofError'));
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('depositId', deposit.depositId);
      formData.append('proof', proofFile);

      const res = await fetch('/api/deposits/upload-proof', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || t('dashboardPages.depositDetail.uploadError'));
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || t('dashboardPages.depositDetail.genericError'));
    } finally {
      setIsUploading(false);
    }
  };

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
    completed: { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20', text: t('dashboardPages.depositDetail.completed'), icon: CheckCircle },
    pending: { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', text: t('dashboardPages.depositDetail.pendingConfirmation'), icon: Clock },
    pending_proof: { color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/20', text: t('dashboardPages.depositDetail.pendingProof'), icon: Upload },
    expired: { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20', text: t('dashboardPages.depositDetail.expired'), icon: XCircle },
    rejected: { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20', text: t('dashboardPages.depositDetail.rejected'), icon: XCircle },
  };

  const targetAccount = getTargetAccount();

  const status = statusConfig[deposit.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('dashboardPages.depositDetail.backToHistory')}
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(() => {
            const isExpiredOrRejected = deposit.status === 'expired' || deposit.status === 'rejected';
            return (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isExpiredOrRejected ? 'bg-gray-100 dark:bg-gray-800' : 'bg-green-50 dark:bg-green-900/20'
              }`}>
                <ArrowUpRight className={`h-5 w-5 ${
                  isExpiredOrRejected ? 'text-gray-400 dark:text-gray-500' : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
            );
          })()}
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('dashboard.activityLabels.depositBalance')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              #{deposit.depositId}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bgColor} ${status.color}`}>
          <StatusIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{status.text}</span>
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboardPages.depositDetail.depositAmount')}</p>
        {(() => {
          const isExpiredOrRejected = deposit.status === 'expired' || deposit.status === 'rejected';
          const amountColorClass = isExpiredOrRejected 
            ? 'text-gray-400 dark:text-gray-500 line-through' 
            : 'text-green-600 dark:text-green-400';
          const amountSign = isExpiredOrRejected ? '' : '+';
          return (
            <p className={`text-4xl font-semibold tracking-tight ${amountColorClass}`}>
              {amountSign}{formatIDR(deposit.amount)}
            </p>
          );
        })()}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8 space-y-4">
        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.depositDetail.paymentMethod')}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {getMethodLabel(deposit.method, deposit.bankCode)}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.depositDetail.createdDate')}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{deposit.createdAt}</span>
        </div>
        {deposit.expiresAt && deposit.status !== 'completed' && (
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              {deposit.status === 'expired' && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
              {deposit.status === 'expired' ? t('dashboardPages.depositDetail.expired') : t('dashboardPages.depositDetail.deadline')}
            </span>
            <span className={`text-sm font-medium ${deposit.status === 'expired' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {deposit.expiresAt}
            </span>
          </div>
        )}
        {deposit.completedAt && (
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboardPages.depositDetail.completedDate')}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{deposit.completedAt}</span>
          </div>
        )}
        
        {deposit.adminNotes && (
          <div className="pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboardPages.depositDetail.adminNotes')}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{deposit.adminNotes}</p>
          </div>
        )}
      </div>

      {(deposit.status === 'pending_proof' || deposit.status === 'pending') && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <h2 className="font-medium text-gray-900 dark:text-white mb-6">{t('dashboardPages.depositDetail.transferDetails')}</h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {deposit.method === 'bank_transfer' ? t('dashboardPages.depositDetail.bank') : t('dashboardPages.depositDetail.eWallet')}
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {deposit.bankCode}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboardPages.depositDetail.accountNumber')}</p>
                  <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">
                    {targetAccount.number}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(targetAccount.number, 'number')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copied === 'number' ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboardPages.depositDetail.accountName')}</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {targetAccount.name}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dashboardPages.depositDetail.totalTransfer')}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatIDR(deposit.totalAmount)}
              </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('dashboardPages.depositDetail.nominalDeposit')}</span>
                <span className="text-gray-700 dark:text-gray-300">{formatIDR(deposit.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('dashboardPages.depositDetail.adminFee')}</span>
                <span className="text-gray-700 dark:text-gray-300">{formatIDR(deposit.fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t('dashboardPages.depositDetail.uniqueCode')}</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">+Rp {deposit.uniqueCode.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {deposit.status === 'pending_proof' && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <h2 className="font-medium text-gray-900 dark:text-white mb-6">{t('dashboardPages.depositDetail.uploadProof')}</h2>
          
          {!proofFile ? (
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {t('dashboardPages.depositDetail.clickToUpload')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('dashboardPages.depositDetail.fileFormats')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative">
              {proofPreview ? (
                <img
                  src={proofPreview}
                  alt="Bukti transfer"
                  className="w-full max-h-64 object-contain rounded-lg bg-gray-100 dark:bg-gray-800"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">PDF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {proofFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(proofFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 p-1.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={handleUploadProof}
            disabled={isUploading || !proofFile}
            className="mt-4 w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('dashboardPages.depositDetail.uploading')}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                {t('dashboardPages.depositDetail.submitProof')}
              </>
            )}
          </button>
        </div>
      )}

      {deposit.status === 'pending' && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{t('dashboardPages.depositDetail.waitingConfirmation')}</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                {t('dashboardPages.depositDetail.waitingConfirmationDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex justify-end">
        <Link
          href="/dashboard/orders"
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {t('dashboardPages.depositDetail.backToHistory')}
        </Link>
      </div>
    </div>
  );
}
