'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

function AdminResultContent() {
  const searchParams = useSearchParams();
  
  const type = searchParams.get('type') || '';
  const action = searchParams.get('action') || '';
  const status = searchParams.get('status') || '';
  const id = searchParams.get('id') || '';

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Penarikan';
      case 'order': return 'Order';
      default: return 'Transaksi';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'confirm': return 'dikonfirmasi';
      case 'complete': return 'diselesaikan';
      case 'reject': return 'ditolak';
      default: return 'diproses';
    }
  };

  const getStatusInfo = (status: string, action: string) => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: 'Berhasil!',
          message: `${getTypeLabel(type)} #${id} berhasil ${getActionLabel(action)}.`,
          color: 'green'
        };
      case 'already_completed':
        return {
          icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
          title: 'Sudah Diproses',
          message: `${getTypeLabel(type)} #${id} sudah diselesaikan sebelumnya.`,
          color: 'yellow'
        };
      case 'already_rejected':
        return {
          icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
          title: 'Sudah Ditolak',
          message: `${getTypeLabel(type)} #${id} sudah ditolak sebelumnya.`,
          color: 'yellow'
        };
      case 'already_expired':
        return {
          icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
          title: 'Sudah Expired',
          message: `${getTypeLabel(type)} #${id} sudah kadaluarsa.`,
          color: 'yellow'
        };
      case 'already_cancelled':
        return {
          icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
          title: 'Sudah Dibatalkan',
          message: `${getTypeLabel(type)} #${id} sudah dibatalkan.`,
          color: 'yellow'
        };
      case 'already_processed':
        return {
          icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
          title: 'Sudah Diproses',
          message: `${getTypeLabel(type)} #${id} sudah diproses sebelumnya.`,
          color: 'yellow'
        };
      default:
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Error',
          message: `Terjadi kesalahan saat memproses ${getTypeLabel(type).toLowerCase()} #${id}.`,
          color: 'red'
        };
    }
  };

  const statusInfo = getStatusInfo(status, action);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          {statusInfo.icon}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {statusInfo.title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {statusInfo.message}
        </p>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">ID Transaksi</div>
          <div className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
            {id || '-'}
          </div>
        </div>

        <Link
          href="/admin/transactions"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Admin Panel
        </Link>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function AdminResultPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminResultContent />
    </Suspense>
  );
}
