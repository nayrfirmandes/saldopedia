import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default async function DepositSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ depositId?: string; already_completed?: string }>;
}) {
  const params = await searchParams;
  const depositId = params.depositId || '';
  const alreadyCompleted = params.already_completed === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {alreadyCompleted ? 'Deposit Sudah Dikonfirmasi' : 'Deposit Berhasil Dikonfirmasi'}
          </h1>
          
          {depositId && (
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              ID: <span className="font-mono font-medium">{depositId}</span>
            </p>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {alreadyCompleted 
              ? 'Deposit ini sudah pernah dikonfirmasi sebelumnya. Saldo user sudah diperbarui.'
              : 'Saldo user telah berhasil diperbarui. Email konfirmasi sudah dikirim ke user.'
            }
          </p>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Halaman ini untuk admin. Anda bisa menutup tab ini.
          </p>
        </div>
      </div>
    </div>
  );
}
