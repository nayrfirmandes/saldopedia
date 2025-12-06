import Link from 'next/link';
import { XCircle, Clock, ShieldX, AlertTriangle } from 'lucide-react';

const errorMessages: Record<string, { title: string; message: string; icon: React.ReactNode }> = {
  invalid_token: {
    title: 'Link Tidak Valid',
    message: 'Link konfirmasi deposit tidak valid atau sudah kadaluarsa. Silakan minta user untuk membuat deposit request baru.',
    icon: <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />,
  },
  not_found: {
    title: 'Deposit Tidak Ditemukan',
    message: 'Deposit request tidak ditemukan dalam sistem. Mungkin sudah dihapus atau ID tidak valid.',
    icon: <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />,
  },
  expired: {
    title: 'Deposit Kadaluarsa',
    message: 'Deposit request ini sudah melewati batas waktu (24 jam). User perlu membuat request baru.',
    icon: <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />,
  },
  rejected: {
    title: 'Deposit Ditolak',
    message: 'Deposit ini sebelumnya sudah ditolak.',
    icon: <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />,
  },
  server_error: {
    title: 'Terjadi Kesalahan',
    message: 'Terjadi kesalahan pada server. Silakan coba lagi atau hubungi tim teknis.',
    icon: <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />,
  },
};

export default async function DepositErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason || 'server_error';
  const errorInfo = errorMessages[reason] || errorMessages.server_error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            {errorInfo.icon}
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {errorInfo.title}
          </h1>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            {errorInfo.message}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
