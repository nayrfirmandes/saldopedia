'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  RefreshCcw, 
  AlertCircle,
  Save,
  Check,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  CreditCard,
  Wallet
} from 'lucide-react';

interface RateTier {
  min: number;
  max: number;
  rate: number;
}

interface RateSettingValue {
  value: string;
  description: string;
  updatedAt: string | null;
  isDefault: boolean;
}

interface RateSettings {
  [key: string]: RateSettingValue;
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

type TabType = 'crypto' | 'paypal' | 'skrill';

export default function AdminRatesPage() {
  const [settings, setSettings] = useState<RateSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('crypto');
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/rates');
      if (!response.ok) {
        throw new Error('Failed to fetch rates data');
      }
      const data = await response.json();
      setSettings(data.settings || null);
      
      const initialValues: Record<string, string> = {};
      for (const [key, val] of Object.entries(data.settings || {})) {
        initialValues[key] = (val as RateSettingValue).value;
      }
      setEditValues(initialValues);
      setError('');
    } catch (err) {
      setError('Gagal memuat data. Pastikan Anda memiliki akses admin.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSave = async (settingKey: string) => {
    setSaving(settingKey);
    setSuccessMessage('');
    try {
      const response = await fetch('/api/admin/rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settingKey,
          settingValue: editValues[settingKey],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(`${settingKey} berhasil disimpan`);
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.error || 'Gagal menyimpan');
      }
    } catch (err) {
      alert('Terjadi error. Coba lagi.');
    } finally {
      setSaving(null);
    }
  };

  const handleTierChange = (settingKey: string, tierIndex: number, field: 'min' | 'max' | 'rate', value: number) => {
    try {
      const currentTiers: RateTier[] = JSON.parse(editValues[settingKey] || '[]');
      currentTiers[tierIndex] = { ...currentTiers[tierIndex], [field]: value };
      setEditValues(prev => ({ ...prev, [settingKey]: JSON.stringify(currentTiers) }));
    } catch (e) {
      console.error('Error updating tier:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Memuat pengaturan rate...</p>
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

  const renderCryptoSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-500" />
          Crypto Margin
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Margin diterapkan ke harga pasar dari CoinGecko. Contoh: 0.95 = -5% (jual), 1.05 = +5% (beli)
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <TrendingDown className="w-4 h-4 inline mr-1 text-red-500" />
              Margin Jual (convert)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={editValues['crypto_margin_sell'] || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, crypto_margin_sell: e.target.value }))}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSave('crypto_margin_sell')}
                disabled={saving === 'crypto_margin_sell'}
                className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                {saving === 'crypto_margin_sell' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </button>
            </div>
            {settings?.crypto_margin_sell?.updatedAt && (
              <p className="text-xs text-gray-400">Terakhir: {formatDate(settings.crypto_margin_sell.updatedAt)}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <TrendingUp className="w-4 h-4 inline mr-1 text-green-500" />
              Margin Beli (topup)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={editValues['crypto_margin_buy'] || ''}
                onChange={(e) => setEditValues(prev => ({ ...prev, crypto_margin_buy: e.target.value }))}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSave('crypto_margin_buy')}
                disabled={saving === 'crypto_margin_buy'}
                className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                {saving === 'crypto_margin_buy' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </button>
            </div>
            {settings?.crypto_margin_buy?.updatedAt && (
              <p className="text-xs text-gray-400">Terakhir: {formatDate(settings.crypto_margin_buy.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          Stablecoin Rates (Fixed IDR)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Rate tetap untuk USDT dan USDC dalam Rupiah
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">USDT (Tether)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Rate Jual</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                    <input
                      type="number"
                      value={editValues['stablecoin_usdt_sell'] || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, stablecoin_usdt_sell: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-600 border-0 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => handleSave('stablecoin_usdt_sell')}
                    disabled={saving === 'stablecoin_usdt_sell'}
                    className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {saving === 'stablecoin_usdt_sell' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Rate Beli</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                    <input
                      type="number"
                      value={editValues['stablecoin_usdt_buy'] || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, stablecoin_usdt_buy: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-600 border-0 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => handleSave('stablecoin_usdt_buy')}
                    disabled={saving === 'stablecoin_usdt_buy'}
                    className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {saving === 'stablecoin_usdt_buy' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">USDC (USD Coin)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Rate Jual</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                    <input
                      type="number"
                      value={editValues['stablecoin_usdc_sell'] || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, stablecoin_usdc_sell: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-600 border-0 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => handleSave('stablecoin_usdc_sell')}
                    disabled={saving === 'stablecoin_usdc_sell'}
                    className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {saving === 'stablecoin_usdc_sell' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">Rate Beli</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                    <input
                      type="number"
                      value={editValues['stablecoin_usdc_buy'] || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, stablecoin_usdc_buy: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-600 border-0 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => handleSave('stablecoin_usdc_buy')}
                    disabled={saving === 'stablecoin_usdc_buy'}
                    className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {saving === 'stablecoin_usdc_buy' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTierSettings = (service: 'paypal' | 'skrill') => {
    const sellKey = `${service}_sell_tiers`;
    const buyKey = `${service}_buy_tiers`;
    
    let sellTiers: RateTier[] = [];
    let buyTiers: RateTier[] = [];
    
    try {
      sellTiers = JSON.parse(editValues[sellKey] || '[]');
      buyTiers = JSON.parse(editValues[buyKey] || '[]');
    } catch (e) {
      console.error('Error parsing tiers:', e);
    }

    const ServiceIcon = service === 'paypal' ? CreditCard : Wallet;
    const serviceColor = service === 'paypal' ? 'text-blue-500' : 'text-purple-500';
    const serviceName = service === 'paypal' ? 'PayPal' : 'Skrill';

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ServiceIcon className={`w-5 h-5 ${serviceColor}`} />
            {serviceName} Rate Tiers
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Rate berdasarkan jumlah USD. Semakin besar jumlah, rate semakin menguntungkan.
          </p>

          <div className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  Rate Jual (Convert)
                </h4>
                <button
                  onClick={() => handleSave(sellKey)}
                  disabled={saving === sellKey}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  {saving === sellKey ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="px-3 sm:px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium text-xs sm:text-sm">Min USD</th>
                      <th className="px-3 sm:px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium text-xs sm:text-sm">Max USD</th>
                      <th className="px-3 sm:px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium text-xs sm:text-sm">Rate (IDR/USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellTiers.map((tier, idx) => (
                      <tr key={idx} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-3 sm:px-4 py-2">
                          <input
                            type="number"
                            value={tier.min}
                            onChange={(e) => handleTierChange(sellKey, idx, 'min', Number(e.target.value))}
                            className="w-full px-2 sm:px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 sm:px-4 py-2">
                          <input
                            type="number"
                            value={tier.max}
                            onChange={(e) => handleTierChange(sellKey, idx, 'max', Number(e.target.value))}
                            className="w-full px-2 sm:px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 sm:px-4 py-2">
                          <div className="relative">
                            <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm">Rp</span>
                            <input
                              type="number"
                              value={tier.rate}
                              onChange={(e) => handleTierChange(sellKey, idx, 'rate', Number(e.target.value))}
                              className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Rate Beli (Topup)
                </h4>
                <button
                  onClick={() => handleSave(buyKey)}
                  disabled={saving === buyKey}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  {saving === buyKey ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="px-3 sm:px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium text-xs sm:text-sm">Min USD</th>
                      <th className="px-3 sm:px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium text-xs sm:text-sm">Max USD</th>
                      <th className="px-3 sm:px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium text-xs sm:text-sm">Rate (IDR/USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyTiers.map((tier, idx) => (
                      <tr key={idx} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-3 sm:px-4 py-2">
                          <input
                            type="number"
                            value={tier.min}
                            onChange={(e) => handleTierChange(buyKey, idx, 'min', Number(e.target.value))}
                            className="w-full px-2 sm:px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 sm:px-4 py-2">
                          <input
                            type="number"
                            value={tier.max}
                            onChange={(e) => handleTierChange(buyKey, idx, 'max', Number(e.target.value))}
                            className="w-full px-2 sm:px-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 sm:px-4 py-2">
                          <div className="relative">
                            <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm">Rp</span>
                            <input
                              type="number"
                              value={tier.rate}
                              onChange={(e) => handleTierChange(buyKey, idx, 'rate', Number(e.target.value))}
                              className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              <span className="text-sm font-medium text-gray-900 dark:text-white">Rate</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pengaturan Rate</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Atur margin dan rate untuk semua layanan
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-2 text-green-700 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'crypto'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Coins className="w-4 h-4 inline mr-2" />
            Cryptocurrency
          </button>
          <button
            onClick={() => setActiveTab('paypal')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'paypal'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            PayPal
          </button>
          <button
            onClick={() => setActiveTab('skrill')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'skrill'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Wallet className="w-4 h-4 inline mr-2" />
            Skrill
          </button>
        </div>

        {activeTab === 'crypto' && renderCryptoSettings()}
        {activeTab === 'paypal' && renderTierSettings('paypal')}
        {activeTab === 'skrill' && renderTierSettings('skrill')}
      </div>
    </div>
  );
}
