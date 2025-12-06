import { notFound, redirect } from "next/navigation";
import { getCachedOrderById } from "@/lib/orders";
import { getSessionUser } from "@/lib/auth/session";
import Link from "next/link";
import { adminPaymentConfig } from "@/lib/payment-config";
import OrderCountdown from "@/components/order-countdown";
import { CopyableAddress, CopyableEmail, CopyButtonInline } from "./instructions-content";
import {
  Send,
  Wallet,
  MessageCircle,
  Home,
  CheckCircle2,
  Clock,
  CreditCard,
} from "lucide-react";

export const revalidate = 10;

export default async function InstructionsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const order = await getCachedOrderById(orderId);

  if (!order) {
    notFound();
  }

  const user = await getSessionUser();
  
  if (!user) {
    redirect(`/login?redirect=/order/instructions/${orderId}`);
  }

  if (order.user_id !== user.id && order.customer_email !== user.email) {
    notFound();
  }

  if (order.status === 'expired') {
    redirect(`/order/expired?orderId=${orderId}`);
  }

  if (order.expires_at && new Date(order.expires_at) < new Date()) {
    redirect(`/order/expired?orderId=${orderId}`);
  }

  const formatIDR = (amount: string) => {
    return `Rp ${Math.round(parseFloat(amount)).toLocaleString("id-ID")}`;
  };

  const formatUSD = (amount: string) => {
    return `$${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatCryptoAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (num >= 1) {
      return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
    } else if (num >= 0.01) {
      return num.toLocaleString('id-ID', { minimumFractionDigits: 4, maximumFractionDigits: 8 });
    } else {
      return num.toLocaleString('id-ID', { minimumFractionDigits: 6, maximumFractionDigits: 8 });
    }
  };

  const isBuy = order.transaction_type === "buy";
  const isPayPal = order.service_type === "paypal";
  const isSkrill = order.service_type === "skrill";
  const isCrypto = order.service_type === "cryptocurrency";

  const serviceLabel = isPayPal ? "PayPal" : isSkrill ? "Skrill" : "Cryptocurrency";
  const transactionLabel = isBuy ? "Beli" : "Jual";

  const adminEmail = isPayPal
    ? adminPaymentConfig.paypal.email
    : isSkrill
    ? adminPaymentConfig.skrill.email
    : "";

  return (
    <section className="relative bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
        
        {order.expires_at && (
          <div className="mb-6">
            <OrderCountdown 
              orderId={order.order_id} 
              expiresAt={order.expires_at + 'Z'}
              status={order.status}
            />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {isBuy ? "Order Sedang Diproses" : "Instruksi Pembayaran"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Order ID: <span className="font-mono font-semibold">{order.order_id}</span>
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                order.status === "pending"
                  ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
                  : order.status === "confirmed"
                  ? "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  : order.status === "completed"
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              }`}
            >
              {order.status === "pending" ? (
                <>
                  <Clock className="w-4 h-4" />
                  Menunggu Pembayaran
                </>
              ) : order.status === "confirmed" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saldo Terpotong
                </>
              ) : order.status === "completed" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Selesai
                </>
              ) : (
                order.status
              )}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Layanan</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {serviceLabel} {isCrypto && order.crypto_symbol ? `(${order.crypto_symbol})` : ""}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaksi</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {transactionLabel}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jumlah</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {isCrypto
                    ? (() => {
                        const cryptoAmount = isBuy
                          ? parseFloat(order.amount_idr) / parseFloat(order.rate)
                          : parseFloat(order.amount_input);
                        return `${formatCryptoAmount(cryptoAmount)} ${order.crypto_symbol}`;
                      })()
                    : formatUSD(order.amount_input)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatIDR(order.amount_idr)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== BUY ORDERS - Saldo sudah dipotong, proses otomatis ========== */}
        {isBuy && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Pembayaran Berhasil
                </h2>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                  Saldo Anda sudah dipotong sebesar {formatIDR(order.amount_idr)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Order sedang diproses otomatis (5-15 menit)
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300 text-sm">
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <span>Dibayar menggunakan saldo akun Saldopedia</span>
              </div>
            </div>

            {/* What user will receive */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-base">-</span>
                Yang Akan Anda Terima
              </h3>
              
              {isCrypto && order.wallet_address && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Crypto</span>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {formatCryptoAmount(parseFloat(order.amount_idr) / parseFloat(order.rate))} {order.crypto_symbol}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Network</span>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{order.crypto_network}</span>
                  </div>
                  <CopyableAddress 
                    address={order.wallet_address} 
                    label="Dikirim ke Wallet"
                    className="py-2"
                  />
                  {order.xrp_tag && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Destination Tag</span>
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{order.xrp_tag}</span>
                    </div>
                  )}
                </div>
              )}

              {(isPayPal || isSkrill) && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Saldo {serviceLabel}</span>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {formatUSD(order.amount_input)}
                    </span>
                  </div>
                  <CopyableEmail 
                    email={(isPayPal ? order.paypal_email : order.skrill_email) || ''}
                    label={`Dikirim ke Email ${serviceLabel}`}
                    className="py-2"
                  />
                </div>
              )}
            </div>

            <div className="border-l-2 border-blue-500 pl-4 py-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tidak ada yang perlu Anda lakukan:</div>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <li>Order diproses otomatis dalam 5-15 menit</li>
                <li>Anda akan menerima email notifikasi saat selesai</li>
                <li>{isCrypto ? `${order.crypto_symbol} akan dikirim ke wallet Anda` : `Saldo ${serviceLabel} akan dikirim ke akun Anda`}</li>
              </ol>
            </div>
          </div>
        )}

        {/* ========== SELL Crypto - Kirim crypto ke admin ========== */}
        {!isBuy && isCrypto && order.deposit_address && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Instruksi Pengiriman Crypto
              </h2>
              <p className="text-sm text-green-600 dark:text-green-400">
                Jual {order.crypto_symbol} via {order.crypto_network}
              </p>
            </div>

            <div className="text-center mb-8">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Kirim sebesar:</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {formatCryptoAmount(parseFloat(order.amount_input))} {order.crypto_symbol}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Kirim tepat sesuai nominal</div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Alamat Deposit (Kirim ke sini)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Network</div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{order.crypto_network}</div>
                </div>
                <CopyableAddress 
                  address={order.deposit_address} 
                  label="Deposit Address"
                  className="py-2"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2 text-blue-800 dark:text-blue-300 text-sm">
                <CreditCard className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Pembayaran via Saldo Akun</p>
                  <p className="text-blue-700 dark:text-blue-400 text-xs">
                    Setelah transaksi selesai, saldo sebesar {formatIDR(order.amount_idr)} akan otomatis dikreditkan ke akun Saldopedia Anda
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-2 border-green-500 pl-4 py-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Langkah Selanjutnya:</div>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <li>Kirim {order.crypto_symbol} ke alamat deposit di atas</li>
                <li>Pastikan network yang digunakan: <span className="font-semibold text-gray-900 dark:text-white">{order.crypto_network}</span></li>
                <li>Tunggu konfirmasi blockchain</li>
                <li>Saldo {formatIDR(order.amount_idr)} akan dikreditkan ke akun Anda</li>
              </ol>
            </div>
          </div>
        )}

        {/* ========== SELL PayPal/Skrill - Kirim saldo ke admin ========== */}
        {!isBuy && (isPayPal || isSkrill) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Instruksi Penjualan
              </h2>
              <p className="text-sm text-green-600 dark:text-green-400">
                Jual saldo {serviceLabel}
              </p>
            </div>

            <div className="text-center mb-8">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Kirim sebesar:</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {formatUSD(order.amount_input)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Kirim tepat sesuai nominal</div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Email {serviceLabel} Tujuan
              </h3>
              <div className="space-y-2">
                <CopyableEmail 
                  email={adminEmail}
                  label="Kirim ke email"
                  className="py-2 border-b border-gray-200 dark:border-gray-700"
                />
                <div className="flex justify-between items-baseline py-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Atas Nama</div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {isPayPal ? adminPaymentConfig.paypal.name : adminPaymentConfig.skrill.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2 text-blue-800 dark:text-blue-300 text-sm">
                <CreditCard className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Pembayaran via Saldo Akun</p>
                  <p className="text-blue-700 dark:text-blue-400 text-xs">
                    Setelah transaksi selesai, saldo sebesar {formatIDR(order.amount_idr)} akan otomatis dikreditkan ke akun Saldopedia Anda
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-2 border-green-500 pl-4 py-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Langkah Selanjutnya:</div>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <li>Login ke akun {serviceLabel} ({isPayPal ? order.paypal_email : order.skrill_email})</li>
                <li>Kirim {formatUSD(order.amount_input)} ke: <span className="font-mono text-blue-600 dark:text-blue-400">{adminEmail}</span></li>
                <li>Screenshot bukti transfer</li>
                <li>Kirim via WhatsApp ke {adminPaymentConfig.whatsapp} dengan Order ID: <span className="font-mono font-semibold text-gray-900 dark:text-white">{order.order_id}</span></li>
                <li>Saldo {formatIDR(order.amount_idr)} akan dikreditkan ke akun Anda</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Butuh bantuan? <a href={`https://wa.me/${adminPaymentConfig.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 font-medium hover:underline inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        </div>
        </div>
      </div>
    </section>
  );
}
