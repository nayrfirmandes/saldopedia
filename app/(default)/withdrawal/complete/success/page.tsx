import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function WithdrawalCompleteSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ withdrawalId?: string; already_completed?: string }>;
}) {
  const params = await searchParams;
  const withdrawalId = params.withdrawalId;
  const alreadyCompleted = params.already_completed === 'true';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {alreadyCompleted ? 'Sudah Selesai' : 'Penarikan Berhasil'}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {alreadyCompleted 
            ? 'Penarikan ini sudah diproses sebelumnya.'
            : 'Penarikan telah berhasil diproses. Email konfirmasi telah dikirim ke user.'}
        </p>

        {withdrawalId && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ID Penarikan</p>
            <p className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
              {withdrawalId}
            </p>
          </div>
        )}

        <Link
          href="/"
          className="inline-block py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
