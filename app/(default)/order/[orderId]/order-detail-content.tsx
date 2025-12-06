'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertTriangle, Copy, Check, ExternalLink, Wallet, CreditCard, Mail, Phone, User, Hash, Globe, FileText } from 'lucide-react';

interface Order {
  order_id: string;
  user_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  transaction_type: string;
  crypto_symbol: string | null;
  crypto_network: string | null;
  amount_input: string;
  amount_idr: string;
  rate: string;
  status: string;
  payment_method: string | null;
  payment_account_name: string | null;
  payment_account_number: string | null;
  wallet_address: string | null;
  xrp_tag: string | null;
  paypal_email: string | null;
  skrill_email: string | null;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  expires_at: string | null;
  completed_at: string | null;
  nowpayments_payment_id: string | null;
  deposit_address: string | null;
  payment_status: string | null;
  actually_paid: string | null;
  payout_status: string | null;
  payout_hash: string | null;
  payout_error: string | null;
  paid_with_saldo: boolean;
  payment_note: string | null;
}

interface OrderDetailContentProps {
  order: Order;
}

export default function OrderDetailContent({ order }: OrderDetailContentProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatIDR = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
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

  const formatAmount = () => {
    if (order.service_type === 'cryptocurrency') {
      const cryptoAmount = order.transaction_type === 'buy'
        ? parseFloat(order.amount_idr) / parseFloat(order.rate)
        : parseFloat(order.amount_input);
      return `${formatCryptoAmount(cryptoAmount)} ${order.crypto_symbol}`;
    } else {
      return `$${parseFloat(order.amount_input).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatRate = () => {
    if (order.service_type === 'cryptocurrency') {
      return `${formatIDR(order.rate)} ${t('orderPages.detail.perUnit')} ${order.crypto_symbol}`;
    } else {
      return `${formatIDR(order.rate)} per $1`;
    }
  };

  const truncateAddress = (address: string, startChars: number = 10, endChars: number = 8) => {
    if (address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  const getExplorerUrl = (hash: string, symbol: string | null) => {
    const explorers: Record<string, string> = {
      'BTC': `https://blockchair.com/bitcoin/transaction/${hash}`,
      'ETH': `https://etherscan.io/tx/${hash}`,
      'BNB': `https://bscscan.com/tx/${hash}`,
      'USDT': `https://tronscan.org/#/transaction/${hash}`,
      'TRX': `https://tronscan.org/#/transaction/${hash}`,
      'SOL': `https://solscan.io/tx/${hash}`,
      'XRP': `https://xrpscan.com/tx/${hash}`,
      'DOGE': `https://blockchair.com/dogecoin/transaction/${hash}`,
      'LTC': `https://blockchair.com/litecoin/transaction/${hash}`,
      'TON': `https://tonscan.org/tx/${hash}`,
      'NOT': `https://tonscan.org/tx/${hash}`,
    };
    return explorers[symbol || ''] || `https://blockchair.com/search?q=${hash}`;
  };

  const serviceLabel = 
    order.service_type === 'cryptocurrency' ? order.crypto_symbol :
    order.service_type === 'paypal' ? 'PayPal' :
    'Skrill';

  const transactionLabel = t(`orderPages.detail.transactionType.${order.transaction_type}`);
  const isSell = order.transaction_type === 'sell';
  const isBuy = order.transaction_type === 'buy';
  const isCrypto = order.service_type === 'cryptocurrency';
  const isPayPal = order.service_type === 'paypal';
  const isSkrill = order.service_type === 'skrill';

  const statusConfig = {
    completed: { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20', text: t('orderPages.detail.status.completed'), icon: CheckCircle },
    pending: { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', text: t('orderPages.detail.status.pending'), icon: Clock },
    processing: { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/20', text: t('orderPages.detail.status.processing'), icon: Clock },
    expired: { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20', text: t('orderPages.detail.status.expired'), icon: XCircle },
    cancelled: { color: 'text-gray-500 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-700', text: t('orderPages.detail.status.cancelled'), icon: XCircle },
  };

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  const getPaymentNoteLabel = (note: string | null) => {
    if (!note) return null;
    const labels: Record<string, { text: string; color: string }> = {
      'exact': { text: t('orderPages.detail.paymentNote.exact'), color: 'text-green-600 dark:text-green-400' },
      'overpaid': { text: t('orderPages.detail.paymentNote.overpaid'), color: 'text-blue-600 dark:text-blue-400' },
      'underpaid': { text: t('orderPages.detail.paymentNote.underpaid'), color: 'text-orange-600 dark:text-orange-400' },
      'partial_expired': { text: t('orderPages.detail.paymentNote.partialExpired'), color: 'text-red-600 dark:text-red-400' },
    };
    return labels[note] || null;
  };

  const paymentNoteInfo = getPaymentNoteLabel(order.payment_note);

  return (
    <section className="relative">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          
          <div className="mb-6">
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('orderPages.detail.backToOrders')}
            </Link>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  order.status === 'expired' || order.status === 'cancelled' 
                    ? 'bg-gray-100 dark:bg-gray-700' 
                    : isSell 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-blue-100 dark:bg-blue-900/20'
                }`}>
                  {isCrypto ? (
                    <Wallet className={`h-6 w-6 ${
                      order.status === 'expired' || order.status === 'cancelled'
                        ? 'text-gray-400'
                        : isSell ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  ) : (
                    <CreditCard className={`h-6 w-6 ${
                      order.status === 'expired' || order.status === 'cancelled'
                        ? 'text-gray-400'
                        : isSell ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {transactionLabel} {serviceLabel}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    #{order.order_id}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bgColor} ${status.color}`}>
                <StatusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{status.text}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.totalIDR')}</p>
              {(() => {
                const isExpiredOrCancelled = order.status === 'expired' || order.status === 'cancelled';
                const amountColorClass = isExpiredOrCancelled 
                  ? 'text-gray-400 dark:text-gray-500 line-through' 
                  : isSell 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400';
                const amountSign = isExpiredOrCancelled ? '' : (isSell ? '+' : '-');
                return (
                  <p className={`text-4xl font-semibold tracking-tight ${amountColorClass}`}>
                    {amountSign}{formatIDR(order.amount_idr)}
                  </p>
                );
              })()}
              {paymentNoteInfo && order.status === 'completed' && (
                <p className={`text-sm ${paymentNoteInfo.color}`}>
                  {paymentNoteInfo.text}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('orderPages.detail.transactionDetails')}
              </h3>

              <div className="space-y-1">
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.amount')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatAmount()}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.rate')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatRate()}</span>
                </div>

                {isCrypto && order.crypto_network && (
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {t('orderPages.detail.network')}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{order.crypto_network}</span>
                  </div>
                )}

                {isCrypto && isSell && order.actually_paid && (
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.amountSent')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCryptoAmount(order.actually_paid)} {order.crypto_symbol}
                    </span>
                  </div>
                )}

                {order.payment_method && (
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.paymentMethod')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{order.payment_method}</span>
                  </div>
                )}

                {order.payment_account_name && (
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.accountName')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{order.payment_account_name}</span>
                  </div>
                )}
                {order.payment_account_number && (
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.accountNumber')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">{order.payment_account_number}</span>
                      <button
                        onClick={() => copyToClipboard(order.payment_account_number!, 'account')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        {copied === 'account' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(order.wallet_address || order.deposit_address || order.paypal_email || order.skrill_email) && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  {isCrypto ? <Wallet className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  {isCrypto ? t('orderPages.detail.walletInfo') : t('orderPages.detail.accountInfo')}
                </h3>

                <div className="space-y-1">
                  {isCrypto && isBuy && order.wallet_address && (
                    <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.destinationWallet')}</span>
                        <div className="flex items-center gap-2 max-w-[200px] sm:max-w-none">
                          <span className="text-sm font-medium text-gray-900 dark:text-white font-mono text-right break-all sm:break-normal">
                            <span className="hidden sm:inline">{order.wallet_address}</span>
                            <span className="sm:hidden">{truncateAddress(order.wallet_address)}</span>
                          </span>
                          <button
                            onClick={() => copyToClipboard(order.wallet_address!, 'wallet')}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                          >
                            {copied === 'wallet' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                      {order.xrp_tag && (
                        <div className="flex justify-between mt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.destinationTag')}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">{order.xrp_tag}</span>
                            <button
                              onClick={() => copyToClipboard(order.xrp_tag!, 'tag')}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              {copied === 'tag' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isCrypto && isSell && order.deposit_address && (
                    <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.depositAddress')}</span>
                        <div className="flex items-center gap-2 max-w-[200px] sm:max-w-none">
                          <span className="text-sm font-medium text-gray-900 dark:text-white font-mono text-right break-all sm:break-normal">
                            <span className="hidden sm:inline">{order.deposit_address}</span>
                            <span className="sm:hidden">{truncateAddress(order.deposit_address)}</span>
                          </span>
                          <button
                            onClick={() => copyToClipboard(order.deposit_address!, 'deposit')}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                          >
                            {copied === 'deposit' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isPayPal && order.paypal_email && (
                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.paypalEmail')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{order.paypal_email}</span>
                        <button
                          onClick={() => copyToClipboard(order.paypal_email!, 'paypal')}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {copied === 'paypal' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {isSkrill && order.skrill_email && (
                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.skrillEmail')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{order.skrill_email}</span>
                        <button
                          onClick={() => copyToClipboard(order.skrill_email!, 'skrill')}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {copied === 'skrill' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isCrypto && order.status === 'completed' && (order.payout_hash || order.nowpayments_payment_id) && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {t('orderPages.detail.blockchainInfo')}
                </h3>

                <div className="space-y-1">
                  {isBuy && order.payout_hash && (
                    <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.txHash')}</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={getExplorerUrl(order.payout_hash, order.crypto_symbol)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline font-mono flex items-center gap-1"
                          >
                            <span className="hidden sm:inline">{truncateAddress(order.payout_hash, 12, 10)}</span>
                            <span className="sm:hidden">{truncateAddress(order.payout_hash, 8, 6)}</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            onClick={() => copyToClipboard(order.payout_hash!, 'txhash')}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            {copied === 'txhash' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.nowpayments_payment_id && (
                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.paymentId')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">{order.nowpayments_payment_id}</span>
                        <button
                          onClick={() => copyToClipboard(order.nowpayments_payment_id!, 'paymentid')}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {copied === 'paymentid' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {(order.payment_status || order.payout_status) && (
                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {isSell ? t('orderPages.detail.paymentStatus') : t('orderPages.detail.sendingStatus')}
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400 capitalize">
                        {isSell ? order.payment_status : order.payout_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('orderPages.detail.customerInfo')}
              </h3>

              <div className="space-y-1">
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.name')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.email')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_email}</span>
                </div>
                {order.customer_phone && (
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.phone')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('orderPages.detail.timeInfo')}
              </h3>

              <div className="space-y-1">
                <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.created')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{order.created_at}</span>
                </div>
                {order.status === 'completed' && order.completed_at && (
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      {t('orderPages.detail.completedAt')}
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {order.completed_at}
                    </span>
                  </div>
                )}
                {order.status === 'expired' && order.expires_at && (
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      {t('orderPages.detail.expiredAt')}
                    </span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {order.expires_at}
                    </span>
                  </div>
                )}
                {(order.status === 'pending' || order.status === 'processing') && order.expires_at && (
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t('orderPages.detail.expires')}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.expires_at}
                    </span>
                  </div>
                )}

                {order.paid_with_saldo && (
                  <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('orderPages.detail.paymentMethodLabel')}</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('orderPages.detail.saldoPayment')}</span>
                  </div>
                )}
              </div>
            </div>

            {(order.notes || order.admin_notes || order.payout_error) && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-8 space-y-3">
                {order.notes && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('orderPages.detail.orderNotes')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.notes}</p>
                  </div>
                )}
                {order.admin_notes && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">{t('orderPages.detail.notes')}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{order.admin_notes}</p>
                  </div>
                )}
                {order.payout_error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">{t('orderPages.detail.error')}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{order.payout_error}</p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex justify-end gap-3">
              <Link
                href="/dashboard/orders"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t('orderPages.detail.back')}
              </Link>
              {order.status === 'pending' && (
                <Link
                  href={`/order/instructions/${order.order_id}`}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  {t('orderPages.detail.viewInstructions')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
