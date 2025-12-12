'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  RefreshCcw, 
  Clock, 
  AlertCircle,
  Coins,
  Copy,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Plus,
  Minus,
  Gift,
  UserPlus,
  ArrowRightLeft,
  TrendingUp,
  Users,
  X
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

interface PointTransaction {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  type: 'referral_bonus' | 'referred_bonus' | 'redeem' | 'expired' | 'adjustment';
  amount: number;
  description: string | null;
  referralId: number | null;
  createdAt: string;
}

interface PointStats {
  totalCirculating: number;
  totalEarned: number;
  totalRedeemed: number;
  referralBonusCount: number;
  referredBonusCount: number;
  redeemCount: number;
  adjustmentCount: number;
}

interface TopUser {
  id: number;
  name: string;
  email: string;
  points: number;
}

interface SearchUser {
  id: number;
  name: string;
  email: string;
  points: number;
}

function formatNumber(num: number): string {
  return num.toLocaleString('id-ID');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
      title="Salin"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

const typeConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  'referral_bonus': { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', icon: Gift, label: 'Bonus Referral' },
  'referred_bonus': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', icon: UserPlus, label: 'Bonus Undangan' },
  'redeem': { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', icon: ArrowRightLeft, label: 'Penukaran' },
  'expired': { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: Clock, label: 'Kadaluarsa' },
  'adjustment': { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', icon: Plus, label: 'Adjustment' },
};

function TypeBadge({ type }: { type: string }) {
  const config = typeConfig[type] || typeConfig['adjustment'];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function AdjustmentModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  loading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (userId: number, amount: number, description: string) => void;
  loading: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [amount, setAmount] = useState('');
  const [isAddition, setIsAddition] = useState(true);
  const [description, setDescription] = useState('');
  const [searching, setSearching] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount || !description) return;
    
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    onSubmit(selectedUser.id, isAddition ? numAmount : -numAmount, description);
  };

  const resetForm = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setAmount('');
    setIsAddition(true);
    setDescription('');
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adjustment Poin</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {!selectedUser ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Cari User
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ketik nama atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-xl max-h-48 overflow-y-auto">
                  {searchResults.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-xl last:rounded-b-xl transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email} - {formatNumber(user.points)} poin</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{selectedUser.name}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">{selectedUser.email}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Saldo: {formatNumber(selectedUser.points)} poin</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tipe Adjustment
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddition(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isAddition 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Plus className="w-4 h-4" />
                Tambah
              </button>
              <button
                type="button"
                onClick={() => setIsAddition(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  !isAddition 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-2 ring-red-500' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Minus className="w-4 h-4" />
                Kurangi
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Jumlah Poin
            </label>
            <input
              type="number"
              placeholder="Contoh: 10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Alasan/Deskripsi
            </label>
            <textarea
              placeholder="Contoh: Kompensasi error sistem, Bonus event, dll"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedUser || !amount || !description || loading}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? 'Memproses...' : `${isAddition ? 'Tambah' : 'Kurangi'} Poin`}
          </button>
        </form>
      </div>
    </div>
  );
}

function PointTransactionDetail({ tx }: { tx: PointTransaction }) {
  const typeLabels: Record<string, string> = {
    'referral_bonus': 'Bonus karena mengajak teman mendaftar',
    'referred_bonus': 'Bonus karena mendaftar dengan kode referral',
    'redeem': 'Penukaran poin menjadi saldo',
    'adjustment': 'Penyesuaian manual oleh admin',
    'expired': 'Poin kadaluarsa',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">ID Transaksi</span>
        <span className="text-sm text-gray-900 dark:text-white font-medium">#{tx.id}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">User ID</span>
        <span className="text-sm text-gray-900 dark:text-white font-medium">{tx.userId}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">Nama</span>
        <span className="text-sm text-gray-900 dark:text-white font-medium">{tx.userName}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">Email</span>
        <span className="text-sm text-gray-900 dark:text-white font-medium break-all">{tx.userEmail}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">Tipe Transaksi</span>
        <span className="text-sm text-gray-900 dark:text-white font-medium">{typeLabels[tx.type] || tx.type}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">Jumlah Poin</span>
        <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {tx.amount > 0 ? '+' : ''}{formatNumber(tx.amount)} poin
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">Nilai IDR</span>
        <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {tx.amount > 0 ? '+' : '-'}Rp {formatNumber(Math.abs(tx.amount) * 0.5)}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">Waktu</span>
        <span className="text-sm text-gray-900 dark:text-white font-medium">{formatDateFull(tx.createdAt)}</span>
      </div>
      {tx.description && (
        <div className="col-span-2 md:col-span-4 flex flex-col gap-0.5 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">Keterangan</span>
          <span className="text-sm text-gray-900 dark:text-white font-medium">{tx.description}</span>
        </div>
      )}
      {tx.referralId && (
        <div className="col-span-2 md:col-span-4 flex flex-col gap-0.5 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">ID Referral</span>
          <span className="text-sm text-gray-900 dark:text-white font-medium">#{tx.referralId}</span>
        </div>
      )}
    </div>
  );
}

export default function AdminPointsPage() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [stats, setStats] = useState<PointStats | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.userName.toLowerCase().includes(query) ||
        t.userEmail.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [transactions, typeFilter, searchQuery]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter]);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/points');
      if (!response.ok) {
        throw new Error('Failed to fetch points data');
      }
      const data = await response.json();
      setTransactions(data.transactions || []);
      setStats(data.stats || null);
      setTopUsers(data.topUsers || []);
      setError('');
    } catch (err) {
      setError('Gagal memuat data. Pastikan Anda memiliki akses admin.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleAdjust = async (userId: number, amount: number, description: string) => {
    setAdjusting(true);
    try {
      const response = await fetch('/api/admin/points/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, description }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowAdjustModal(false);
        fetchData();
      } else {
        alert(data.error || 'Gagal melakukan adjustment');
      }
    } catch (err) {
      alert('Terjadi error. Coba lagi.');
    } finally {
      setAdjusting(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Memuat data poin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Akses Ditolak</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin/transactions" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500">
                Transaksi
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Poin</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manajemen Poin</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Kelola poin semua pengguna
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdjustModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adjustment
            </button>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Beredar</p>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalCirculating)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Diberikan</p>
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(stats.totalEarned)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Ditukar</p>
              </div>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatNumber(stats.totalRedeemed)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Transaksi Referral</p>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(stats.referralBonusCount + stats.referredBonusCount)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="order-2 lg:order-1 lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama, email, deskripsi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="referral_bonus">Bonus Referral</option>
                    <option value="referred_bonus">Bonus Undangan</option>
                    <option value="redeem">Penukaran</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="expired">Kadaluarsa</option>
                  </select>
                </div>
                {(searchQuery || typeFilter !== 'all') && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <Filter className="w-4 h-4" />
                    <span>{filteredTransactions.length} hasil</span>
                    <button
                      onClick={() => { setSearchQuery(''); setTypeFilter('all'); }}
                      className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8"></th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipe</th>
                      <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Poin</th>
                      <th className="hidden sm:table-cell px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Keterangan</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {paginatedTransactions.map((tx) => {
                      const isExpanded = expandedRows.has(tx.id);
                      return (
                        <React.Fragment key={tx.id}>
                          <tr 
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                            onClick={() => toggleExpand(tx.id)}
                          >
                            <td className="px-3 sm:px-4 py-3">
                              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px] sm:max-w-[150px]">{tx.userName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px] sm:max-w-[150px]">{tx.userEmail}</p>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                              <TypeBadge type={tx.type} />
                            </td>
                            <td className="px-3 sm:px-4 py-3 text-right">
                              <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {tx.amount > 0 ? '+' : ''}{formatNumber(tx.amount)}
                              </span>
                            </td>
                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3">
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                                {tx.description || '-'}
                              </p>
                            </td>
                            <td className="px-3 sm:px-4 py-3">
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(tx.createdAt)}
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="px-3 sm:px-4 py-4 bg-white dark:bg-gray-800">
                                <PointTransactionDetail tx={tx} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredTransactions.length === 0 && (
                <div className="py-16 text-center">
                  {searchQuery || typeFilter !== 'all' ? (
                    <>
                      <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada hasil yang cocok</p>
                    </>
                  ) : (
                    <>
                      <Coins className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada transaksi poin</p>
                    </>
                  )}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} dari {filteredTransactions.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Top 10 Poin Tertinggi
              </h3>
              <div className="space-y-2">
                {topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                        index === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                        index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]">{user.name}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatNumber(user.points)}</span>
                  </div>
                ))}
                {topUsers.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Belum ada data</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          Auto-refresh setiap 60 detik
        </p>
      </div>

      <AdjustmentModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        onSubmit={handleAdjust}
        loading={adjusting}
      />
    </div>
  );
}
