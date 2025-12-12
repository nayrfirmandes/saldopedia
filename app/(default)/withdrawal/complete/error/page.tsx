import Link from "next/link";
import { XCircle } from "lucide-react";

const errorMessages: Record<string, { title: string; message: string }> = {
  invalid_token: {
    title: "Link Tidak Valid",
    message: "Link konfirmasi tidak valid atau sudah kedaluwarsa. Silakan hubungi admin.",
  },
  not_found: {
    title: "Penarikan Tidak Ditemukan",
    message: "Data penarikan tidak ditemukan dalam sistem.",
  },
  rejected: {
    title: "Penarikan Ditolak",
    message: "Penarikan ini telah ditolak sebelumnya.",
  },
  user_not_found: {
    title: "User Tidak Ditemukan",
    message: "User pemilik penarikan ini tidak ditemukan.",
  },
  server_error: {
    title: "Terjadi Kesalahan",
    message: "Terjadi kesalahan saat memproses penarikan. Silakan coba lagi.",
  },
};

export default async function WithdrawalCompleteErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason || 'server_error';
  const error = errorMessages[reason] || errorMessages.server_error;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {error.title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message}
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-center"
          >
            Kembali ke Beranda
          </Link>
          
          <a
            href="https://wa.me/628119666620?text=Halo%20Saldopedia%2C%20saya%20butuh%20bantuan%20terkait%20penarikan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md text-center"
          >
            Hubungi Admin
          </a>
        </div>
      </div>
    </div>
  );
}
