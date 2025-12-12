'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  RefreshCcw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  ShoppingCart,
  Copy,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Wallet,
  CreditCard,
  Building2,
  Mail,
  ExternalLink,
  Coins,
  TrendingUp
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

interface Deposit {
  deposit_id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  amount: string;
  fee: string;
  total_amount: string;
  method: string;
  bank_code: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  confirmUrl: string | null;
  rejectUrl: string | null;
}

interface Withdrawal {
  withdrawal_id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  amount: string;
  fee: string;
  net_amount: string;
  method: string;
  bank_code: string;
  account_name: string;
  account_number: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  completeUrl: string | null;
  rejectUrl: string | null;
}

interface Order {
  order_id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  service_type: string;
  crypto_symbol: string | null;
  transaction_type: string;
  amount_input: string;
  amount_idr: string;
  wallet_address: string | null;
  paypal_email: string | null;
  skrill_email: string | null;
  status: string;
  created_at: string;
  completeUrl: string | null;
  rejectUrl: string | null;
}

interface Transfer {
  transfer_id: string;
  sender_id: number;
  receiver_id: number;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  amount: string;
  notes: string | null;
  created_at: string;
}

type TransactionType = 'deposit' | 'withdrawal' | 'order' | 'transfer';
type StatusFilter = 'all' | 'pending' | 'completed' | 'rejected' | 'expired';

interface UnifiedTransaction {
  id: string;
  type: TransactionType;
  userName: string;
  userEmail: string;
  amount: string;
  status: string;
  createdAt: string;
  details: string;
  confirmUrl: string | null;
  rejectUrl: string | null;
  raw: Deposit | Withdrawal | Order | Transfer;
}

function formatIDR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
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

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  'pending': { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Pending' },
  'pending_proof': { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', label: 'Bukti' },
  'confirmed': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', label: 'Confirmed' },
  'processing': { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', label: 'Processing' },
  'completed': { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Selesai' },
  'cancelled': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Batal' },
  'rejected': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Ditolak' },
  'expired': { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400', label: 'Expired' },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}

function TypeBadge({ type }: { type: TransactionType }) {
  const config = {
    deposit: { icon: ArrowDownCircle, color: 'text-emerald-600 dark:text-emerald-400', label: 'Deposit' },
    withdrawal: { icon: ArrowUpCircle, color: 'text-red-600 dark:text-red-400', label: 'Withdraw' },
    order: { icon: ShoppingCart, color: 'text-blue-600 dark:text-blue-400', label: 'Order' },
    transfer: { icon: ArrowRightLeft, color: 'text-purple-600 dark:text-purple-400', label: 'Transfer' },
  };
  const { icon: Icon, color, label } = config[type];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function DetailItem({ label, value, copyable = false }: { label: string; value: string | null | undefined; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-900 dark:text-white font-medium break-all">{value}</span>
        {copyable && (
          <button onClick={handleCopy} className="p-0.5 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0">
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}

function DepositDetail({ deposit }: { deposit: Deposit }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <DetailItem label="ID Deposit" value={deposit.deposit_id} copyable />
      <DetailItem label="Metode" value={deposit.method === 'bank_transfer' ? 'Transfer Bank' : 'E-Wallet'} />
      <DetailItem label="Bank/E-Wallet" value={deposit.bank_code.toUpperCase()} />
      <DetailItem label="Jumlah Deposit" value={formatIDR(deposit.amount)} />
      <DetailItem label="Biaya Admin" value={formatIDR(deposit.fee)} />
      <DetailItem label="Total Bayar" value={formatIDR(deposit.total_amount)} />
      <DetailItem label="Status" value={deposit.status.toUpperCase()} />
      <DetailItem label="Waktu Dibuat" value={formatDateFull(deposit.created_at)} />
      <div className="col-span-2 md:col-span-4 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Aksi Admin:</strong> Verifikasi pembayaran user telah masuk ke rekening Saldopedia, lalu klik Konfirmasi untuk menambah saldo user.
        </p>
      </div>
    </div>
  );
}

function WithdrawalDetail({ withdrawal }: { withdrawal: Withdrawal }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <DetailItem label="ID Withdrawal" value={withdrawal.withdrawal_id} copyable />
      <DetailItem label="Metode" value={withdrawal.method === 'bank_transfer' ? 'Transfer Bank' : 'E-Wallet'} />
      <DetailItem label="Bank/E-Wallet" value={withdrawal.bank_code.toUpperCase()} />
      <DetailItem label="Jumlah Tarik" value={formatIDR(withdrawal.amount)} />
      <DetailItem label="Biaya Admin" value={formatIDR(withdrawal.fee)} />
      <DetailItem label="Jumlah Diterima" value={formatIDR(withdrawal.net_amount)} />
      <div className="col-span-2 md:col-span-4 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">REKENING TUJUAN</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Nama Pemilik" value={withdrawal.account_name} copyable />
          <DetailItem label="Nomor Rekening" value={withdrawal.account_number} copyable />
        </div>
      </div>
      <div className="col-span-2 md:col-span-4 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Aksi Admin:</strong> Transfer {formatIDR(withdrawal.net_amount)} ke rekening {withdrawal.bank_code.toUpperCase()} atas nama {withdrawal.account_name} ({withdrawal.account_number}), lalu klik Konfirmasi.
        </p>
      </div>
    </div>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const isBuy = order.transaction_type === 'buy';
  const service = order.service_type === 'cryptocurrency' ? order.crypto_symbol?.toUpperCase() : order.service_type.toUpperCase();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <DetailItem label="ID Order" value={order.order_id} copyable />
      <DetailItem label="Tipe Transaksi" value={isBuy ? 'BELI (User beli dari Saldopedia)' : 'JUAL (User jual ke Saldopedia)'} />
      <DetailItem label="Layanan" value={service || '-'} />
      <DetailItem label="Jumlah" value={`${order.amount_input} ${service}`} />
      <DetailItem label="Nilai IDR" value={formatIDR(order.amount_idr)} />
      <DetailItem label="Status" value={order.status.toUpperCase()} />
      
      {order.service_type === 'cryptocurrency' && order.wallet_address && (
        <div className="col-span-2 md:col-span-4 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">WALLET ADDRESS USER</p>
          <DetailItem label="Alamat Wallet" value={order.wallet_address} copyable />
        </div>
      )}
      
      {order.service_type === 'paypal' && order.paypal_email && (
        <div className="col-span-2 md:col-span-4 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">AKUN PAYPAL USER</p>
          <DetailItem label="Email PayPal" value={order.paypal_email} copyable />
        </div>
      )}
      
      {order.service_type === 'skrill' && order.skrill_email && (
        <div className="col-span-2 md:col-span-4 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">AKUN SKRILL USER</p>
          <DetailItem label="Email Skrill" value={order.skrill_email} copyable />
        </div>
      )}
      
      <div className="col-span-2 md:col-span-4 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {isBuy ? (
            <>
              <strong>Aksi Admin (BELI):</strong> User sudah bayar dengan saldo. Kirim {order.amount_input} {service} ke {order.wallet_address || order.paypal_email || order.skrill_email}, lalu klik Konfirmasi.
            </>
          ) : (
            <>
              <strong>Aksi Admin (JUAL):</strong> Verifikasi user telah mengirim {order.amount_input} {service}. Jika sudah diterima, klik Konfirmasi untuk menambah saldo user.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function TransferDetail({ transfer }: { transfer: Transfer }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <DetailItem label="ID Transfer" value={transfer.transfer_id} copyable />
      <DetailItem label="Jumlah" value={formatIDR(transfer.amount)} />
      <DetailItem label="Waktu" value={formatDateFull(transfer.created_at)} />
      <DetailItem label="Status" value="COMPLETED" />
      
      <div className="col-span-2 md:col-span-4 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">PENGIRIM</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Nama" value={transfer.sender_name} />
          <DetailItem label="Email" value={transfer.sender_email} copyable />
        </div>
      </div>
      
      <div className="col-span-2 md:col-span-4 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">PENERIMA</p>
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Nama" value={transfer.receiver_name} />
          <DetailItem label="Email" value={transfer.receiver_email} copyable />
        </div>
      </div>
      
      {transfer.notes && (
        <div className="col-span-2 md:col-span-4 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
          <DetailItem label="Catatan" value={transfer.notes} />
        </div>
      )}
      
      <div className="col-span-2 md:col-span-4 mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <p className="text-sm text-purple-800 dark:text-purple-200">
          <strong>Info:</strong> Transfer saldo antar pengguna. Transaksi ini sudah selesai secara otomatis dan tidak memerlukan aksi admin.
        </p>
      </div>
    </div>
  );
}

export default function AdminTransactionsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
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

  const unifiedTransactions = useMemo((): UnifiedTransaction[] => {
    const all: UnifiedTransaction[] = [];

    deposits.forEach(d => {
      all.push({
        id: d.deposit_id,
        type: 'deposit',
        userName: d.user_name,
        userEmail: d.user_email,
        amount: formatIDR(d.amount),
        status: d.status,
        createdAt: d.created_at,
        details: `${d.method === 'bank_transfer' ? 'Bank' : 'E-Wallet'} ${d.bank_code.toUpperCase()}`,
        confirmUrl: d.confirmUrl,
        rejectUrl: d.rejectUrl,
        raw: d,
      });
    });

    withdrawals.forEach(w => {
      all.push({
        id: w.withdrawal_id,
        type: 'withdrawal',
        userName: w.user_name,
        userEmail: w.user_email,
        amount: formatIDR(w.net_amount),
        status: w.status,
        createdAt: w.created_at,
        details: `${w.account_number} (${w.account_name})`,
        confirmUrl: w.completeUrl,
        rejectUrl: w.rejectUrl,
        raw: w,
      });
    });

    orders.forEach(o => {
      const service = o.service_type === 'cryptocurrency' ? o.crypto_symbol : o.service_type;
      const txType = o.transaction_type === 'buy' ? 'Beli' : 'Jual';
      all.push({
        id: o.order_id,
        type: 'order',
        userName: o.user_name,
        userEmail: o.user_email,
        amount: formatIDR(o.amount_idr),
        status: o.status,
        createdAt: o.created_at,
        details: `${txType} ${o.amount_input} ${service?.toUpperCase()}`,
        confirmUrl: o.completeUrl,
        rejectUrl: o.rejectUrl,
        raw: o,
      });
    });

    transfers.forEach(t => {
      all.push({
        id: t.transfer_id,
        type: 'transfer',
        userName: t.sender_name,
        userEmail: t.sender_email,
        amount: formatIDR(t.amount),
        status: 'completed',
        createdAt: t.created_at,
        details: `${t.sender_name} -> ${t.receiver_name}`,
        confirmUrl: null,
        rejectUrl: null,
        raw: t,
      });
    });

    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [deposits, withdrawals, orders, transfers]);

  const filteredTransactions = useMemo(() => {
    let result = unifiedTransactions;

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        result = result.filter(t => ['pending', 'pending_proof', 'confirmed', 'processing'].includes(t.status));
      } else if (statusFilter === 'completed') {
        result = result.filter(t => t.status === 'completed');
      } else if (statusFilter === 'rejected') {
        result = result.filter(t => ['rejected', 'cancelled'].includes(t.status));
      } else if (statusFilter === 'expired') {
        result = result.filter(t => t.status === 'expired');
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.id.toLowerCase().includes(query) ||
        t.userName.toLowerCase().includes(query) ||
        t.userEmail.toLowerCase().includes(query) ||
        t.details.toLowerCase().includes(query)
      );
    }

    return result;
  }, [unifiedTransactions, typeFilter, statusFilter, searchQuery]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const pending = unifiedTransactions.filter(t => ['pending', 'pending_proof', 'confirmed', 'processing'].includes(t.status)).length;
    const completed = unifiedTransactions.filter(t => t.status === 'completed').length;
    const rejected = unifiedTransactions.filter(t => ['rejected', 'cancelled'].includes(t.status)).length;
    return { total: unifiedTransactions.length, pending, completed, rejected };
  }, [unifiedTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, statusFilter]);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/pending-transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setDeposits(data.deposits || []);
      setWithdrawals(data.withdrawals || []);
      setOrders(data.orders || []);
      setTransfers(data.transfers || []);
      setError('');
    } catch (err) {
      setError('Gagal memuat data. Pastikan Anda memiliki akses admin.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Memuat transaksi...</p>
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transaksi</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Kelola semua transaksi dari semua pengguna
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/points"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              <Coins className="w-4 h-4" />
              Kelola Poin
            </Link>
            <Link
              href="/admin/rates"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Kelola Rate
            </Link>
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Selesai</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ditolak</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari ID, nama, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                  className="pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdraw</option>
                  <option value="order">Order</option>
                  <option value="transfer">Transfer</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Selesai</option>
                  <option value="rejected">Ditolak</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
            {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Filter className="w-4 h-4" />
                <span>{filteredTransactions.length} hasil</span>
                <button
                  onClick={() => { setSearchQuery(''); setTypeFilter('all'); setStatusFilter('all'); }}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detail</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Waktu</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedTransactions.map((tx) => {
                  const isExpanded = expandedRows.has(`${tx.type}-${tx.id}`);
                  const rowKey = `${tx.type}-${tx.id}`;
                  return (
                    <React.Fragment key={rowKey}>
                      <tr 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(rowKey)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            <span className="font-mono text-xs text-gray-900 dark:text-white">{tx.id.slice(0, 12)}...</span>
                            <CopyButton text={tx.id} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <TypeBadge type={tx.type} />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{tx.userName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{tx.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[180px]" title={tx.details}>
                            {tx.details}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-medium ${
                            tx.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' :
                            tx.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' :
                            tx.type === 'transfer' ? 'text-purple-600 dark:text-purple-400' :
                            'text-gray-900 dark:text-white'
                          }`}>
                            {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}{tx.amount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(tx.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {tx.confirmUrl || tx.rejectUrl ? (
                            <div className="flex items-center justify-end gap-1">
                              {tx.confirmUrl && (
                                <a
                                  href={tx.confirmUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"
                                  title="Konfirmasi"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </a>
                              )}
                              {tx.rejectUrl && (
                                <a
                                  href={tx.rejectUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                  title="Tolak"
                                >
                                  <XCircle className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="px-4 py-4 bg-white dark:bg-gray-800">
                            {tx.type === 'deposit' && <DepositDetail deposit={tx.raw as Deposit} />}
                            {tx.type === 'withdrawal' && <WithdrawalDetail withdrawal={tx.raw as Withdrawal} />}
                            {tx.type === 'order' && <OrderDetail order={tx.raw as Order} />}
                            {tx.type === 'transfer' && <TransferDetail transfer={tx.raw as Transfer} />}
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
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? (
                <>
                  <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada hasil yang cocok</p>
                </>
              ) : (
                <>
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada transaksi</p>
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

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          Auto-refresh setiap 30 detik
        </p>
      </div>
    </div>
  );
}
