'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Loader2, CheckCircle, AlertCircle, Copy, Check, Building2, Smartphone, Wallet } from 'lucide-react';
import UnifiedCountdown from '@/components/unified-countdown';
import { useLanguage } from '@/contexts/language-context';
import { FormatSaldo } from '@/components/format-saldo';

type User = {
  name: string;
  email: string;
  saldo: string;
  phone: string | null;
};

interface BankAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
}

interface Ewallet {
  provider: string;
  phoneNumber: string;
  accountName: string;
}

interface PaymentConfig {
  bankAccounts: BankAccount[];
  ewallets: Ewallet[];
}

type DepositDetails = {
  depositId: string;
  amount: number;
  fee: number;
  uniqueCode: number;
  totalAmount: number;
  method: string;
  bankCode: string;
  targetAccount: {
    name: string;
    number: string;
  };
  expiresAt: string;
};

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];
const MIN_DEPOSIT = 25000;
const MAX_DEPOSIT = 5000000;
const DEPOSIT_FEE = 1500;
const UNIQUE_CODE_MIN = 100;
const UNIQUE_CODE_MAX = 300;

export default function DepositContent({ user, paymentConfig }: { user: User; paymentConfig: PaymentConfig }) {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [depositDetails, setDepositDetails] = useState<DepositDetails | null>(null);
  
  const [method, setMethod] = useState<'bank_transfer' | 'ewallet'>('bank_transfer');
  const [bankCode, setBankCode] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  useEffect(() => {
    if (!depositDetails?.expiresAt) return;

    const checkExpiry = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(depositDetails.expiresAt).getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setIsExpired(true);
      } else {
        setIsExpired(false);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);

    return () => clearInterval(interval);
  }, [depositDetails?.expiresAt]);

  const formatIDR = (num: number) => `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const selectedAmount = amount || customAmount;
  const selectedAmountNum = parseFloat(selectedAmount) || 0;

  const paymentOptions = method === 'bank_transfer' 
    ? paymentConfig.bankAccounts.map(acc => ({
        code: acc.bank,
        label: acc.bank,
        accountNumber: acc.accountNumber,
        accountName: acc.accountName,
      }))
    : paymentConfig.ewallets.map(ew => ({
        code: ew.provider,
        label: ew.provider,
        accountNumber: ew.phoneNumber,
        accountName: ew.accountName,
      }));

  const selectedPayment = paymentOptions.find(p => p.code === bankCode);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('dashboardPages.deposit.fileFormatError'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t('dashboardPages.deposit.fileSizeError'));
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bankCode) {
      setError(t('dashboardPages.deposit.selectBankError'));
      return;
    }

    if (selectedAmountNum < MIN_DEPOSIT) {
      setError(t('dashboardPages.deposit.minDepositError').replace('{amount}', formatIDR(MIN_DEPOSIT)));
      return;
    }

    if (selectedAmountNum > MAX_DEPOSIT) {
      setError(t('dashboardPages.deposit.maxDepositError').replace('{amount}', formatIDR(MAX_DEPOSIT)));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/deposits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmountNum,
          method,
          bankCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || t('dashboardPages.deposit.createDepositError'));
      }

      setDepositDetails({
        depositId: data.depositId,
        amount: data.amount,
        fee: data.fee,
        uniqueCode: data.uniqueCode,
        totalAmount: data.totalAmount,
        method: data.method,
        bankCode: data.bankCode,
        targetAccount: data.targetAccount,
        expiresAt: data.expiresAt,
      });
      setStep(2);

    } catch (err: any) {
      setError(err.message || t('dashboardPages.deposit.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!proofFile) {
      setError(t('dashboardPages.deposit.uploadProofRequired'));
      return;
    }

    if (!depositDetails) {
      setError(t('dashboardPages.deposit.depositNotFound'));
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('depositId', depositDetails.depositId);
      formData.append('proof', proofFile);

      const res = await fetch('/api/deposits/upload-proof', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || t('dashboardPages.deposit.uploadProofFailed'));
      }

      router.push(`/dashboard/deposits/${depositDetails.depositId}`);

    } catch (err: any) {
      setError(err.message || t('dashboardPages.deposit.genericError'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('dashboardPages.deposit.backToDashboard')}
      </Link>
      
      <div className="space-y-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboardPages.deposit.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.balance')}: <FormatSaldo amount={user.saldo} className="font-semibold text-gray-900 dark:text-white" />
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
          }`}>1</div>
          <span className="text-sm font-medium">{t('dashboardPages.deposit.selectMethod')}</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
          }`}>2</div>
          <span className="text-sm font-medium">{t('dashboardPages.deposit.transferAndUpload')}</span>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-8">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('dashboardPages.deposit.paymentMethod')}</h2>
            
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => { setMethod('bank_transfer'); setBankCode(''); }}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  method === 'bank_transfer'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Building2 className="h-4 w-4" />
                {t('dashboardPages.deposit.bankTransfer')}
              </button>
              <button
                type="button"
                onClick={() => { setMethod('ewallet'); setBankCode(''); }}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  method === 'ewallet'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                {t('dashboardPages.deposit.eWallet')}
              </button>
            </div>

            <div className="space-y-2">
              {paymentOptions.map((option) => (
                <label
                  key={option.code}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    bankCode === option.code
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="bankCode"
                      value={option.code}
                      checked={bankCode === option.code}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('dashboardPages.deposit.nominalDeposit')}</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setAmount(preset.toString()); setCustomAmount(''); }}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    amount === preset.toString()
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FormatSaldo amount={preset} />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('dashboardPages.deposit.enterCustomAmount')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(''); }}
                  placeholder={t('dashboardPages.deposit.amountPlaceholder')}
                  min={MIN_DEPOSIT}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Min <FormatSaldo amount={MIN_DEPOSIT} /> - Max <FormatSaldo amount={MAX_DEPOSIT} />
              </p>
            </div>
          </div>

          {selectedPayment && selectedAmountNum >= MIN_DEPOSIT && selectedAmountNum <= MAX_DEPOSIT && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('dashboardPages.deposit.estimateFee')}</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.deposit.nominalDeposit')}</span>
                  <span className="text-gray-900 dark:text-white font-medium"><FormatSaldo amount={selectedAmountNum} /></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.deposit.adminFee')}</span>
                  <span className="text-gray-900 dark:text-white font-medium"><FormatSaldo amount={DEPOSIT_FEE} /></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.deposit.uniqueCode')}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">+<FormatSaldo amount={UNIQUE_CODE_MIN} /> - <FormatSaldo amount={UNIQUE_CODE_MAX} /></span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="text-gray-900 dark:text-white font-semibold">{t('dashboardPages.deposit.estimateTotal')}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    <FormatSaldo amount={selectedAmountNum + DEPOSIT_FEE + UNIQUE_CODE_MIN} /> - <FormatSaldo amount={selectedAmountNum + DEPOSIT_FEE + UNIQUE_CODE_MAX} />
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {t('dashboardPages.deposit.uniqueCodeNote')}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div ref={errorRef} className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !bankCode || selectedAmountNum < MIN_DEPOSIT || selectedAmountNum > MAX_DEPOSIT}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('dashboardPages.deposit.processing')}
              </>
            ) : (
              t('dashboardPages.deposit.continue')
            )}
          </button>
        </form>
      )}

      {step === 2 && depositDetails && (
        <form onSubmit={handleStep2Submit} className="space-y-8">
          {isExpired ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
                {t('dashboardPages.deposit.depositExpired')}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-6">
                {t('dashboardPages.deposit.depositExpiredDesc')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setDepositDetails(null);
                  setProofFile(null);
                  setProofPreview(null);
                  setIsExpired(false);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {t('dashboardPages.deposit.createNewDeposit')}
              </button>
            </div>
          ) : (
            <>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">{t('dashboardPages.deposit.requestCreated')}</p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      ID: <span className="font-mono font-bold">{depositDetails.depositId}</span>
                    </p>
                  </div>
                </div>
              </div>

              <UnifiedCountdown
                id={depositDetails.depositId}
                expiresAt={depositDetails.expiresAt}
                status="pending_proof"
                type="deposit"
                validStatuses={['pending_proof']}
              />

          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('dashboardPages.deposit.transferToAccount')}</h2>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {depositDetails.method === 'bank_transfer' ? t('dashboardPages.deposit.bank') : t('dashboardPages.deposit.eWallet')}
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {depositDetails.bankCode}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboardPages.deposit.accountNumber')}</p>
                    <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">
                      {depositDetails.targetAccount.number}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(depositDetails.targetAccount.number, 'number')}
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboardPages.deposit.accountName')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {depositDetails.targetAccount.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">{t('dashboardPages.deposit.transferExactAmount')}</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                    <FormatSaldo amount={depositDetails.totalAmount} />
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(depositDetails.totalAmount.toString(), 'amount')}
                    className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
                  >
                    {copied === 'amount' ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-300 dark:border-amber-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-700 dark:text-amber-400">{t('dashboardPages.deposit.nominalDeposit')}</span>
                  <span className="text-amber-800 dark:text-amber-300"><FormatSaldo amount={depositDetails.amount} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700 dark:text-amber-400">{t('dashboardPages.deposit.adminFee')}</span>
                  <span className="text-amber-800 dark:text-amber-300"><FormatSaldo amount={depositDetails.fee} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700 dark:text-amber-400">{t('dashboardPages.deposit.uniqueCode')}</span>
                  <span className="font-bold text-amber-800 dark:text-amber-300">+<FormatSaldo amount={depositDetails.uniqueCode} /></span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('dashboardPages.deposit.uploadProof')}</h2>
            
            {!proofFile ? (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Klik untuk upload bukti transfer
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  JPG, PNG, WebP, atau PDF (max 10MB)
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
                  <div className="relative">
                    <img
                      src={proofPreview}
                      alt="Bukti transfer"
                      className="w-full max-h-64 object-contain rounded-lg bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
          </div>

          {error && (
            <div ref={errorRef} className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || !proofFile}
            className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                {t('dashboardPages.deposit.submitProof')}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition-all"
          >
            Kembali
          </button>
          </>
          )}
        </form>
      )}
    </div>
  );
}
