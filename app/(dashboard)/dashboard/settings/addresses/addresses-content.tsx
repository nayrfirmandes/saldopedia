'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, Users, Mail, Pencil, Trash2, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface SavedWallet {
  id: number;
  label: string;
  cryptoSymbol: string;
  network: string | null;
  walletAddress: string;
  xrpTag: string | null;
  usedCount: number;
  lastUsedAt: string | null;
  createdAt: string;
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
}

interface SavedEmail {
  id: number;
  label: string;
  serviceType: 'paypal' | 'skrill';
  email: string;
  usedCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

type ActiveTab = 'wallets' | 'recipients' | 'emails';

export default function AddressesContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>('wallets');
  
  const [wallets, setWallets] = useState<SavedWallet[]>([]);
  const [recipients, setRecipients] = useState<SavedRecipient[]>([]);
  const [emails, setEmails] = useState<SavedEmail[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [loadingEmails, setLoadingEmails] = useState(true);
  
  const [editingWallet, setEditingWallet] = useState<SavedWallet | null>(null);
  const [editingRecipient, setEditingRecipient] = useState<SavedRecipient | null>(null);
  const [editingEmail, setEditingEmail] = useState<SavedEmail | null>(null);
  
  const [walletForm, setWalletForm] = useState({ label: '', cryptoSymbol: '', network: '', walletAddress: '', xrpTag: '' });
  const [recipientForm, setRecipientForm] = useState({ label: '' });
  const [emailForm, setEmailForm] = useState({ label: '', serviceType: 'paypal' as 'paypal' | 'skrill', email: '' });
  
  const [savingWallet, setSavingWallet] = useState(false);
  const [savingRecipient, setSavingRecipient] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchWallets();
    fetchRecipients();
    fetchEmails();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchWallets = async () => {
    try {
      const res = await fetch('/api/saved-wallets');
      const data = await res.json();
      if (data.success) {
        setWallets(data.wallets);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoadingWallets(false);
    }
  };

  const fetchRecipients = async () => {
    try {
      const res = await fetch('/api/saved-recipients');
      const data = await res.json();
      if (data.success) {
        setRecipients(data.recipients);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/saved-emails');
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleEditWallet = (wallet: SavedWallet) => {
    setEditingWallet(wallet);
    setWalletForm({
      label: wallet.label,
      cryptoSymbol: wallet.cryptoSymbol,
      network: wallet.network || '',
      walletAddress: wallet.walletAddress,
      xrpTag: wallet.xrpTag || '',
    });
  };

  const handleSaveWallet = async () => {
    if (!editingWallet) return;
    
    setSavingWallet(true);
    try {
      const res = await fetch(`/api/saved-wallets/${editingWallet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walletForm),
      });
      const data = await res.json();
      
      if (data.success) {
        setWallets(wallets.map(w => w.id === editingWallet.id ? data.wallet : w));
        setEditingWallet(null);
        setMessage({ type: 'success', text: t('dashboardPages.settings.addresses.walletUpdated') });
      } else {
        setMessage({ type: 'error', text: data.error || t('dashboardPages.settings.addresses.updateFailed') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('dashboardPages.settings.addresses.errorOccurred') });
    } finally {
      setSavingWallet(false);
    }
  };

  const handleDeleteWallet = async (id: number) => {
    if (!confirm(t('dashboardPages.settings.addresses.deleteWalletConfirm'))) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/saved-wallets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setWallets(wallets.filter(w => w.id !== id));
        setMessage({ type: 'success', text: t('dashboardPages.settings.addresses.walletDeleted') });
      } else {
        setMessage({ type: 'error', text: data.error || t('dashboardPages.settings.addresses.deleteFailed') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('dashboardPages.settings.addresses.errorOccurred') });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditRecipient = (recipient: SavedRecipient) => {
    setEditingRecipient(recipient);
    setRecipientForm({ label: recipient.label || '' });
  };

  const handleSaveRecipient = async () => {
    if (!editingRecipient) return;
    
    setSavingRecipient(true);
    try {
      const res = await fetch(`/api/saved-recipients/${editingRecipient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipientForm),
      });
      const data = await res.json();
      
      if (data.success) {
        setRecipients(recipients.map(r => r.id === editingRecipient.id ? { ...r, label: recipientForm.label || null } : r));
        setEditingRecipient(null);
        setMessage({ type: 'success', text: t('dashboardPages.settings.addresses.recipientUpdated') });
      } else {
        setMessage({ type: 'error', text: data.error || t('dashboardPages.settings.addresses.updateFailed') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('dashboardPages.settings.addresses.errorOccurred') });
    } finally {
      setSavingRecipient(false);
    }
  };

  const handleDeleteRecipient = async (id: number) => {
    if (!confirm(t('dashboardPages.settings.addresses.deleteRecipientConfirm'))) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/saved-recipients/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setRecipients(recipients.filter(r => r.id !== id));
        setMessage({ type: 'success', text: t('dashboardPages.settings.addresses.recipientDeleted') });
      } else {
        setMessage({ type: 'error', text: data.error || t('dashboardPages.settings.addresses.deleteFailed') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('dashboardPages.settings.addresses.errorOccurred') });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditEmail = (email: SavedEmail) => {
    setEditingEmail(email);
    setEmailForm({
      label: email.label,
      serviceType: email.serviceType,
      email: email.email,
    });
  };

  const handleSaveEmail = async () => {
    if (!editingEmail) return;
    
    setSavingEmail(true);
    try {
      const res = await fetch(`/api/saved-emails/${editingEmail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });
      const data = await res.json();
      
      if (data.success) {
        setEmails(emails.map(e => e.id === editingEmail.id ? data.email : e));
        setEditingEmail(null);
        setMessage({ type: 'success', text: t('dashboardPages.settings.addresses.emailUpdated') });
      } else {
        setMessage({ type: 'error', text: data.error || t('dashboardPages.settings.addresses.updateFailed') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('dashboardPages.settings.addresses.errorOccurred') });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleDeleteEmail = async (id: number) => {
    if (!confirm(t('dashboardPages.settings.addresses.deleteEmailConfirm'))) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/saved-emails/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setEmails(emails.filter(e => e.id !== id));
        setMessage({ type: 'success', text: t('dashboardPages.settings.addresses.emailDeleted') });
      } else {
        setMessage({ type: 'error', text: data.error || t('dashboardPages.settings.addresses.deleteFailed') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('dashboardPages.settings.addresses.errorOccurred') });
    } finally {
      setDeletingId(null);
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('dashboardPages.settings.addresses.backToSettings')}
      </Link>
      
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {t('dashboardPages.settings.addresses.title')}
      </h1>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('wallets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'wallets'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Wallet className="h-4 w-4" />
          {t('dashboardPages.settings.addresses.tabWallets')}
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
            {wallets.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'emails'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Mail className="h-4 w-4" />
          {t('dashboardPages.settings.addresses.tabEmails')}
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
            {emails.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('recipients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'recipients'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          {t('dashboardPages.settings.addresses.tabRecipients')}
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
            {recipients.length}
          </span>
        </button>
      </div>

      {activeTab === 'wallets' && (
        <div className="space-y-3">
          {loadingWallets ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('dashboardPages.settings.addresses.noWallets')}</p>
              <p className="text-sm mt-1">
                {t('dashboardPages.settings.addresses.noWalletsDesc')}
              </p>
            </div>
          ) : (
            wallets.map(wallet => (
              <div key={wallet.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {editingWallet?.id === wallet.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('dashboardPages.settings.addresses.label')}
                      </label>
                      <input
                        type="text"
                        value={walletForm.label}
                        onChange={(e) => setWalletForm({ ...walletForm, label: e.target.value })}
                        className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t('dashboardPages.settings.addresses.crypto')}
                        </label>
                        <input
                          type="text"
                          value={walletForm.cryptoSymbol}
                          onChange={(e) => setWalletForm({ ...walletForm, cryptoSymbol: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t('dashboardPages.settings.addresses.network')}
                        </label>
                        <input
                          type="text"
                          value={walletForm.network}
                          onChange={(e) => setWalletForm({ ...walletForm, network: e.target.value })}
                          className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t('dashboardPages.settings.addresses.optional')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('dashboardPages.settings.addresses.walletAddress')}
                      </label>
                      <input
                        type="text"
                        value={walletForm.walletAddress}
                        onChange={(e) => setWalletForm({ ...walletForm, walletAddress: e.target.value })}
                        className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      />
                    </div>
                    {(walletForm.cryptoSymbol === 'XRP' || wallet.xrpTag) && (
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t('dashboardPages.settings.addresses.destinationTag')}
                        </label>
                        <input
                          type="text"
                          value={walletForm.xrpTag}
                          onChange={(e) => setWalletForm({ ...walletForm, xrpTag: e.target.value })}
                          className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={t('dashboardPages.settings.addresses.optional')}
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingWallet(null)}
                        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        {t('dashboardPages.settings.addresses.cancel')}
                      </button>
                      <button
                        onClick={handleSaveWallet}
                        disabled={savingWallet || !walletForm.label || !walletForm.cryptoSymbol || !walletForm.walletAddress}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {savingWallet ? (
                          <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {t('dashboardPages.settings.addresses.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{wallet.label}</span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                          {wallet.cryptoSymbol}
                        </span>
                        {wallet.network && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {wallet.network}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate" title={wallet.walletAddress}>
                        {truncateAddress(wallet.walletAddress)}
                      </p>
                      {wallet.xrpTag && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Tag: {wallet.xrpTag}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {t('dashboardPages.settings.addresses.used')} {wallet.usedCount}x
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleEditWallet(wallet)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title={t('dashboardPages.settings.addresses.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWallet(wallet.id)}
                        disabled={deletingId === wallet.id}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title={t('dashboardPages.settings.addresses.delete')}
                      >
                        {deletingId === wallet.id ? (
                          <span className="inline-block h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {wallets.length > 0 && wallets.length < 20 && (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2">
              {wallets.length}/20 {t('dashboardPages.settings.addresses.walletsCount')}
            </p>
          )}
        </div>
      )}

      {activeTab === 'emails' && (
        <div className="space-y-3">
          {loadingEmails ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('dashboardPages.settings.addresses.noEmails')}</p>
              <p className="text-sm mt-1">
                {t('dashboardPages.settings.addresses.noEmailsDesc')}
              </p>
            </div>
          ) : (
            emails.map(email => (
              <div key={email.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {editingEmail?.id === email.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('dashboardPages.settings.addresses.label')}
                      </label>
                      <input
                        type="text"
                        value={emailForm.label}
                        onChange={(e) => setEmailForm({ ...emailForm, label: e.target.value })}
                        className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('dashboardPages.settings.addresses.serviceType')}
                      </label>
                      <select
                        value={emailForm.serviceType}
                        onChange={(e) => setEmailForm({ ...emailForm, serviceType: e.target.value as 'paypal' | 'skrill' })}
                        className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="paypal">PayPal</option>
                        <option value="skrill">Skrill</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={emailForm.email}
                        onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                        className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingEmail(null)}
                        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        {t('dashboardPages.settings.addresses.cancel')}
                      </button>
                      <button
                        onClick={handleSaveEmail}
                        disabled={savingEmail || !emailForm.label || !emailForm.email}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {savingEmail ? (
                          <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {t('dashboardPages.settings.addresses.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{email.label}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          email.serviceType === 'paypal' 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        }`}>
                          {email.serviceType === 'paypal' ? 'PayPal' : 'Skrill'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {email.email}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {t('dashboardPages.settings.addresses.used')} {email.usedCount}x
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleEditEmail(email)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title={t('dashboardPages.settings.addresses.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmail(email.id)}
                        disabled={deletingId === email.id}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title={t('dashboardPages.settings.addresses.delete')}
                      >
                        {deletingId === email.id ? (
                          <span className="inline-block h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {emails.length > 0 && emails.length < 20 && (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2">
              {emails.length}/20 {t('dashboardPages.settings.addresses.emailsCount')}
            </p>
          )}
        </div>
      )}

      {activeTab === 'recipients' && (
        <div className="space-y-3">
          {loadingRecipients ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recipients.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('dashboardPages.settings.addresses.noRecipients')}</p>
              <p className="text-sm mt-1">
                {t('dashboardPages.settings.addresses.noRecipientsDesc')}
              </p>
            </div>
          ) : (
            recipients.map(recipient => (
              <div key={recipient.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {editingRecipient?.id === recipient.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('dashboardPages.settings.addresses.label')} ({t('dashboardPages.settings.addresses.optional')})
                      </label>
                      <input
                        type="text"
                        value={recipientForm.label}
                        onChange={(e) => setRecipientForm({ label: e.target.value })}
                        className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('dashboardPages.settings.addresses.labelPlaceholder')}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingRecipient(null)}
                        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        {t('dashboardPages.settings.addresses.cancel')}
                      </button>
                      <button
                        onClick={handleSaveRecipient}
                        disabled={savingRecipient}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {savingRecipient ? (
                          <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {t('dashboardPages.settings.addresses.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {recipient.label || recipient.recipientName}
                        </span>
                        {recipient.label && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({recipient.recipientName})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {recipient.recipientEmail}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {t('dashboardPages.settings.addresses.used')} {recipient.usedCount}x
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleEditRecipient(recipient)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title={t('dashboardPages.settings.addresses.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecipient(recipient.id)}
                        disabled={deletingId === recipient.id}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title={t('dashboardPages.settings.addresses.delete')}
                      >
                        {deletingId === recipient.id ? (
                          <span className="inline-block h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {recipients.length > 0 && recipients.length < 20 && (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2">
              {recipients.length}/20 {t('dashboardPages.settings.addresses.recipientsCount')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
