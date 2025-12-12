'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle, 
  CheckCircle, 
  User,
  Loader2,
  X,
  Star,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
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

interface Transfer {
  id: number;
  transferId: string;
  senderId: number;
  receiverId: number;
  amount: string;
  notes: string | null;
  createdAt: string;
  type: 'sent' | 'received';
  senderName: string;
  senderEmail: string;
  senderPhotoUrl: string | null;
  receiverName: string;
  receiverEmail: string;
  receiverPhotoUrl: string | null;
}

interface RecipientInfo {
  id: number;
  name: string;
  email: string;
  photoUrl?: string | null;
}

interface SavedRecipient {
  id: number;
  recipientId: number;
  label: string | null;
  usedCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhotoUrl: string | null;
}

type Step = 1 | 2 | 3;

export default function TransferContent({ user }: { user: SessionUser }) {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { t } = useLanguage();
  const { getFingerprintData } = useBrowserFingerprint();
  
  const [step, setStep] = useState<Step>(1);
  const [stepTransitioning, setStepTransitioning] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingRecipient, setVerifyingRecipient] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transferResult, setTransferResult] = useState<{transferId: string; recipientName: string} | null>(null);
  
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [visibleItems, setVisibleItems] = useState(5);
  
  const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([]);
  const [loadingSavedRecipients, setLoadingSavedRecipients] = useState(true);
  const [showSavedRecipients, setShowSavedRecipients] = useState(false);
  const [saveThisRecipient, setSaveThisRecipient] = useState(false);
  const [recipientLabel, setRecipientLabel] = useState('');
  
  const messageRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const saldo = Number(user.saldo);
  const transferAmount = Number(amount) || 0;
  const remainingSaldo = saldo - transferAmount;
  const minimumTransfer = 10000;

  const PRESET_AMOUNTS = [50000, 100000, 250000, 500000];

  const goToStep = (newStep: Step) => {
    setStepTransitioning(true);
    setTimeout(() => {
      setStep(newStep);
      setStepTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    fetchTransfers();
    fetchSavedRecipients();
  }, []);

  const fetchSavedRecipients = async () => {
    try {
      const res = await fetch('/api/saved-recipients');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSavedRecipients(data.recipients);
        }
      }
    } catch (err) {
      console.error('Failed to fetch saved recipients:', err);
    } finally {
      setLoadingSavedRecipients(false);
    }
  };

  const getRecentRecipients = (): RecipientInfo[] => {
    const sentTransfers = transfers.filter(tx => tx.type === 'sent');
    const uniqueRecipients = new Map<number, RecipientInfo>();
    
    for (const tx of sentTransfers) {
      if (!uniqueRecipients.has(tx.receiverId)) {
        uniqueRecipients.set(tx.receiverId, {
          id: tx.receiverId,
          name: tx.receiverName,
          email: tx.receiverEmail,
          photoUrl: tx.receiverPhotoUrl,
        });
      }
      if (uniqueRecipients.size >= 5) break;
    }
    
    return Array.from(uniqueRecipients.values());
  };

  const UserAvatar = ({ name, photoUrl, size = 'md' }: { name: string; photoUrl?: string | null; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };
    
    if (photoUrl) {
      return (
        <img 
          src={photoUrl} 
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      );
    }
    
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} bg-blue-600 text-white rounded-full font-semibold`}>
        {getInitials(name)}
      </div>
    );
  };

  const handleSelectSavedRecipient = (recipient: SavedRecipient) => {
    setRecipientEmail(recipient.recipientEmail);
    setRecipientInfo({
      id: recipient.recipientId,
      name: recipient.recipientName,
      email: recipient.recipientEmail,
      photoUrl: recipient.recipientPhotoUrl,
    });
    setShowSavedRecipients(false);
    goToStep(2);
    
    fetch(`/api/saved-recipients/${recipient.id}`, { method: 'POST' }).catch(() => {});
  };

  const handleSelectRecentRecipient = (recipient: RecipientInfo) => {
    setRecipientEmail(recipient.email);
    setRecipientInfo(recipient);
    setShowSavedRecipients(false);
    goToStep(2);
  };

  const isRecipientAlreadySaved = (recipientId: number) => {
    return savedRecipients.some(r => r.recipientId === recipientId);
  };

  useEffect(() => {
    if ((error || success) && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error, success]);

  useEffect(() => {
    if (step === 2 && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [step]);

  const fetchTransfers = async () => {
    try {
      const res = await fetch('/api/transfers');
      if (res.ok) {
        const data = await res.json();
        setTransfers(data.transfers);
      }
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatIDR = (num: number) => `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const verifyRecipient = async () => {
    if (!recipientEmail) {
      setError(t('dashboardPages.transfer.errorEnterEmail'));
      return;
    }

    if (recipientEmail.toLowerCase() === user.email.toLowerCase()) {
      setError(t('dashboardPages.transfer.errorSelfTransfer'));
      return;
    }

    setError('');
    setVerifyingRecipient(true);

    try {
      const res = await fetch(`/api/user/profile?email=${encodeURIComponent(recipientEmail)}`);
      const data = await res.json();

      if (!res.ok || !data.user) {
        setError(t('dashboardPages.transfer.errorUserNotFound'));
        return;
      }

      setRecipientInfo({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        photoUrl: data.user.photoUrl
      });
      goToStep(2);
    } catch (err) {
      setError(t('dashboardPages.transfer.errorNetwork'));
    } finally {
      setVerifyingRecipient(false);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (transferAmount < minimumTransfer) {
      setError(t('dashboardPages.transfer.errorMinimum').replace('{amount}', minimumTransfer.toLocaleString('id-ID')));
      return;
    }
    if (transferAmount > saldo) {
      setError(t('dashboardPages.transfer.errorInsufficientBalance'));
      return;
    }
    goToStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          amount: transferAmount,
          notes: notes || null,
          browserFingerprint: getFingerprintData(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('dashboardPages.transfer.errorGeneral'));
        return;
      }

      setTransferResult({
        transferId: data.transferId,
        recipientName: data.recipientName
      });
      setSuccess(t('dashboardPages.transfer.successMessage').replace('{name}', data.recipientName));
      
      if (saveThisRecipient && recipientInfo && !isRecipientAlreadySaved(recipientInfo.id)) {
        try {
          await fetch('/api/saved-recipients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientId: recipientInfo.id,
              label: recipientLabel.trim() || null,
            }),
          });
          await fetchSavedRecipients();
        } catch (saveErr) {
          console.error('Failed to save recipient:', saveErr);
        }
      }
      
      try {
        await refreshAuth();
        await fetchTransfers();
      } catch (refreshErr) {
        console.error('Failed to refresh data:', refreshErr);
      }
    } catch (err) {
      setError(t('dashboardPages.transfer.errorNetwork'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    goToStep(1);
    setRecipientEmail('');
    setRecipientInfo(null);
    setAmount('');
    setNotes('');
    setError('');
    setSuccess('');
    setTransferResult(null);
    setSaveThisRecipient(false);
    setRecipientLabel('');
    setShowSavedRecipients(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {stepTransitioning && (
        <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-900/80 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('dashboardPages.transfer.processing')}</p>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('dashboardPages.transfer.backToDashboard')}
        </Link>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboardPages.transfer.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('dashboard.balance')}: <FormatSaldo amount={saldo} className="font-semibold text-gray-900 dark:text-white" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}>{step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}</div>
              <span className="text-sm font-medium hidden sm:inline">{t('dashboardPages.transfer.stepRecipient')}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}>{step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}</div>
              <span className="text-sm font-medium hidden sm:inline">{t('dashboardPages.transfer.stepAmount')}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}>3</div>
              <span className="text-sm font-medium hidden sm:inline">{t('dashboardPages.transfer.stepReview')}</span>
            </div>
          </div>

          {error && (
            <div ref={messageRef} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && transferResult && (
            <div ref={messageRef} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">{t('dashboardPages.transfer.successTitle')}</p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">{success}</p>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                    {t('dashboardPages.transfer.transferId')}: <span className="font-mono font-bold">{transferResult.transferId}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {t('dashboardPages.transfer.sendAnother')}
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 py-2 px-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors text-center"
                >
                  {t('dashboardPages.transfer.backToDashboard')}
                </Link>
              </div>
            </div>
          )}

          {!success && step === 1 && (
            <div className="space-y-4">
              {(savedRecipients.length > 0 || getRecentRecipients().length > 0) && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowSavedRecipients(!showSavedRecipients)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('dashboardPages.transfer.savedRecipients')}
                      </span>
                      {savedRecipients.length > 0 && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          {savedRecipients.length}
                        </span>
                      )}
                    </div>
                    {showSavedRecipients ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {showSavedRecipients && (
                    <div className="space-y-4 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                      {savedRecipients.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                            <Star className="w-3 h-3" />
                            {t('dashboardPages.transfer.favoriteLabel')}
                          </p>
                          <div className="space-y-1">
                            {savedRecipients.slice(0, 5).map((recipient) => (
                              <button
                                key={recipient.id}
                                type="button"
                                onClick={() => handleSelectSavedRecipient(recipient)}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors text-left"
                              >
                                <UserAvatar name={recipient.recipientName} photoUrl={recipient.recipientPhotoUrl} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {recipient.label || recipient.recipientName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {recipient.recipientEmail}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {getRecentRecipients().length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {t('dashboardPages.transfer.recentLabel')}
                          </p>
                          <div className="space-y-1">
                            {getRecentRecipients().map((recipient) => (
                              <button
                                key={recipient.id}
                                type="button"
                                onClick={() => handleSelectRecentRecipient(recipient)}
                                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors text-left"
                              >
                                <UserAvatar name={recipient.name} photoUrl={recipient.photoUrl} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {recipient.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {recipient.email}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('dashboardPages.transfer.recipientEmail')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && verifyRecipient()}
                    placeholder={t('dashboardPages.transfer.recipientEmailPlaceholder')}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    autoFocus
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('dashboardPages.transfer.recipientHint')}
                </p>
              </div>

              <button
                onClick={verifyRecipient}
                disabled={verifyingRecipient || !recipientEmail}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {verifyingRecipient ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('dashboardPages.transfer.verifying')}
                  </>
                ) : (
                  t('dashboardPages.transfer.continue')
                )}
              </button>
            </div>
          )}

          {!success && step === 2 && recipientInfo && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <UserAvatar name={recipientInfo.name} photoUrl={recipientInfo.photoUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{recipientInfo.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{recipientInfo.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { goToStep(1); setRecipientInfo(null); setError(''); }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('dashboardPages.transfer.amount')} (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    ref={amountInputRef}
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError(''); }}
                    placeholder={t('dashboardPages.transfer.amountPlaceholder')}
                    min={minimumTransfer}
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('dashboardPages.transfer.minimumNote').replace('{amount}', minimumTransfer.toLocaleString('id-ID'))}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => { setAmount(preset.toString()); setError(''); }}
                    disabled={preset > saldo}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      Number(amount) === preset
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : preset > saldo
                          ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {preset >= 1000000 ? `${preset / 1000000}jt` : `${preset / 1000}rb`}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('dashboardPages.transfer.notes')} <span className="text-gray-400 font-normal">({t('dashboardPages.transfer.optional')})</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('dashboardPages.transfer.notesPlaceholder')}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

              {transferAmount >= minimumTransfer && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.transfer.amount')}</span>
                    <span className="text-gray-900 dark:text-white font-medium"><FormatSaldo amount={transferAmount} /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.transfer.fee')}</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">{t('dashboardPages.transfer.free')}</span>
                  </div>
                  <div className={`border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between text-sm ${remainingSaldo >= 0 ? '' : 'text-red-500'}`}>
                    <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.transfer.remainingBalance')}</span>
                    <span className={`font-medium ${remainingSaldo >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                      <FormatSaldo amount={remainingSaldo} />
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { goToStep(1); setError(''); }}
                  className="flex-1 py-2.5 px-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                >
                  {t('dashboardPages.transfer.back')}
                </button>
                <button
                  type="submit"
                  disabled={transferAmount < minimumTransfer || transferAmount > saldo}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
                >
                  {t('dashboardPages.transfer.reviewTransfer')}
                </button>
              </div>
            </form>
          )}

          {!success && step === 3 && recipientInfo && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">{t('dashboardPages.transfer.reviewDetails')}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.transfer.from')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.transfer.to')}</span>
                    <div className="flex items-center gap-2">
                      <UserAvatar name={recipientInfo.name} photoUrl={recipientInfo.photoUrl} size="sm" />
                      <span className="font-medium text-gray-900 dark:text-white">{recipientInfo.name}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.transfer.amount')}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg"><FormatSaldo amount={transferAmount} /></span>
                  </div>
                  {notes && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.transfer.notes')}</span>
                      <span className="font-medium text-gray-900 dark:text-white text-right max-w-[180px] truncate">{notes}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('dashboardPages.transfer.fee')}</span>
                    <span className="font-medium text-green-600">{t('dashboardPages.transfer.free')}</span>
                  </div>
                  <div className="border-t border-blue-200 dark:border-blue-700 pt-3 flex justify-between">
                    <span className="text-gray-900 dark:text-white font-semibold">{t('dashboardPages.transfer.remainingBalance')}</span>
                    <span className="font-bold text-gray-900 dark:text-white"><FormatSaldo amount={remainingSaldo} /></span>
                  </div>
                </div>
              </div>

              {recipientInfo && !isRecipientAlreadySaved(recipientInfo.id) && (
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveThisRecipient}
                      onChange={(e) => setSaveThisRecipient(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('dashboardPages.transfer.saveRecipientCheckbox') || 'Simpan penerima ini untuk transfer berikutnya'}
                    </span>
                  </label>
                  
                  {saveThisRecipient && (
                    <input
                      type="text"
                      value={recipientLabel}
                      onChange={(e) => setRecipientLabel(e.target.value)}
                      placeholder={t('dashboardPages.transfer.recipientLabelPlaceholder') || 'Label (contoh: Ibu, Adik, Teman)'}
                      maxLength={50}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { goToStep(2); setError(''); }}
                  className="flex-1 py-2.5 px-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                >
                  {t('dashboardPages.transfer.back')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('dashboardPages.transfer.processing')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('dashboardPages.transfer.sendNow')}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('dashboardPages.transfer.historyTitle')}</h2>
          
          {loadingHistory ? (
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="-mx-2 px-2 py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-48 animate-pulse" />
                  </div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>
          ) : transfers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">{t('dashboardPages.transfer.noHistory')}</p>
            </div>
          ) : (<>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {transfers.slice(0, visibleItems).map((tx) => {
                const isSent = tx.type === 'sent';
                const personName = isSent ? tx.receiverName : tx.senderName;
                
                return (
                  <Link 
                    key={tx.id} 
                    href={`/dashboard/transfers/${tx.transferId}`}
                    className="block -mx-2 px-2 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                      }`}>
                        <Send className={`h-5 w-5 ${
                          isSent ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {isSent ? t('dashboardPages.transfer.sentLabel') : t('dashboardPages.transfer.receivedLabel')}
                          </p>
                          <span className="text-xs text-green-600 dark:text-green-400">{t('dashboardPages.transfer.statusSuccess')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{isSent ? t('dashboardPages.transfer.to') : t('dashboardPages.transfer.from')}: {personName}</span>
                          <span>-</span>
                          <span>{new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <p className={`text-sm font-semibold ${
                        isSent ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {isSent ? '-' : '+'}Rp {Number(tx.amount).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
            {visibleItems < transfers.length && (
              <div className="pt-6 text-center">
                <button
                  onClick={() => setVisibleItems(prev => prev + 5)}
                  className="px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {t('dashboardPages.orders.loadMore')} ({transfers.length - visibleItems} {t('dashboardPages.orders.remaining')})
                </button>
              </div>
            )}
          </>)}
        </div>
      </div>
    </div>
  );
}
