"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import PageIllustration from "@/components/page-illustration";
import {
  calculatePayPalSkrill,
  calculateCryptoFromIDR,
  calculateCryptoFromCoin,
  formatIDR,
  formatUSD,
  formatCrypto,
  formatRate,
  getTierInfo,
  getMinimumCoinAmount,
  type ServiceType,
  type ModeType,
  type DynamicRatesConfig,
} from "@/lib/calculator";
import { SUPPORTED_CRYPTOS, SYMBOL_TO_ID } from "@/lib/rates";

export default function RateCalculator() {
  const { t } = useLanguage();
  const [service, setService] = useState<ServiceType>("cryptocurrency");
  const [mode, setMode] = useState<ModeType>("convert");
  const [amount, setAmount] = useState<string>("");
  const [selectedCrypto, setSelectedCrypto] = useState<string>("BTC");
  const [cryptoPrices, setCryptoPrices] = useState<{ [key: string]: { idr: number } } | null>(null);
  const [dynamicRates, setDynamicRates] = useState<DynamicRatesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [networkFeeIDR, setNetworkFeeIDR] = useState<number>(0);

  // Default networks for each crypto (for fee calculation)
  const CRYPTO_DEFAULT_NETWORKS: { [key: string]: string } = {
    BTC: 'Bitcoin', ETH: 'Ethereum (ERC-20)', BNB: 'BSC (BEP-20)', SOL: 'Solana',
    TRX: 'Tron (TRC-20)', TON: 'TON Network', XRP: 'XRP Ledger', TKO: 'BSC (BEP-20)',
    MATIC: 'Polygon', ADA: 'Cardano', SHIB: 'Ethereum (ERC-20)', BABYDOGE: 'BSC (BEP-20)',
    CAKE: 'BSC (BEP-20)', FLOKI: 'BSC (BEP-20)', DOGS: 'TON Network', NOTCOIN: 'TON Network',
    DOGE: 'Dogecoin', USDT: 'TRC-20 (Tron)', USDC: 'Solana'
  };

  // Fetch cryptocurrency prices and dynamic rates on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricesRes, ratesRes] = await Promise.all([
          fetch("/api/crypto-rates"),
          fetch("/api/rates")
        ]);
        
        const pricesData = await pricesRes.json();
        const ratesData = await ratesRes.json();
        
        if (pricesData.success && pricesData.prices) {
          setCryptoPrices(pricesData.prices);
          setLastUpdated(pricesData.timestamp);
        }
        
        if (ratesData.success) {
          setDynamicRates({
            cryptoConfig: ratesData.cryptoConfig,
            paypalRates: ratesData.paypalRates,
            skrillRates: ratesData.skrillRates,
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error instanceof Error ? error.message : error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, []);

  // Reset input and result when service or mode changes
  useEffect(() => {
    setAmount("");
    setShowResult(false);
  }, [service, mode, selectedCrypto]);

  // Fetch network fee when selected crypto changes
  useEffect(() => {
    const fetchNetworkFee = async () => {
      if (service !== "cryptocurrency" || !selectedCrypto) {
        setNetworkFeeIDR(0);
        return;
      }

      const network = CRYPTO_DEFAULT_NETWORKS[selectedCrypto] || '';
      if (!network) {
        setNetworkFeeIDR(0);
        return;
      }

      try {
        const response = await fetch(`/api/crypto/network-fees?symbol=${selectedCrypto}&network=${encodeURIComponent(network)}`);
        const result = await response.json();
        
        if (result.success && result.data?.feeIDR) {
          setNetworkFeeIDR(result.data.feeIDR);
        } else {
          setNetworkFeeIDR(0);
        }
      } catch (error) {
        console.error("Failed to fetch network fee:", error);
        setNetworkFeeIDR(0);
      }
    };

    fetchNetworkFee();
  }, [selectedCrypto, service]);

  // Auto-hide result when user starts typing
  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (showResult) {
      setShowResult(false);
    }
  };

  // Calculate result
  const getCalculation = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return null;
    }

    if (service === "cryptocurrency") {
      const coinId = SYMBOL_TO_ID[selectedCrypto];
      const marketPrice = cryptoPrices?.[coinId]?.idr || 0;
      
      if (!marketPrice) {
        return null;
      }

      if (mode === "convert") {
        return calculateCryptoFromCoin(selectedCrypto, numAmount, marketPrice, mode, dynamicRates || undefined);
      }
      
      return calculateCryptoFromIDR(selectedCrypto, numAmount, marketPrice, mode, dynamicRates || undefined);
    }

    return calculatePayPalSkrill(numAmount, mode, service as 'paypal' | 'skrill', dynamicRates || undefined);
  };

  const result = getCalculation();
  const tierInfo = service !== "cryptocurrency" && amount ? getTierInfo(parseFloat(amount), mode, service as 'paypal' | 'skrill', dynamicRates || undefined) : null;

  // Calculate minimum coin amount for cryptocurrency convert mode
  const getMinCoinAmount = () => {
    if (service !== "cryptocurrency" || mode !== "convert" || !cryptoPrices) return null;
    
    const coinId = SYMBOL_TO_ID[selectedCrypto];
    const marketPrice = cryptoPrices[coinId]?.idr || 0;
    
    if (!marketPrice) return null;
    
    return getMinimumCoinAmount(selectedCrypto, marketPrice, mode, dynamicRates || undefined);
  };

  const minCoinAmount = getMinCoinAmount();

  const handleCalculate = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      setShowResult(true);
      setIsCalculating(false);
    }, 400);
  };

  // Format last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return "";
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Jakarta",
    }) + " WIB";
  };

  return (
    <section className="relative">
      <PageIllustration />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          <div className="pb-12 text-center md:pb-16">
            <h1 className="mb-4 py-2 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,--theme(--color-slate-300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
              {t("calculator.hero.title")}
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="text-base text-gray-600 md:text-lg dark:text-gray-300">
                {t("calculator.hero.subtitle")}
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg md:p-8 dark:border-gray-700 dark:bg-gray-800">
              <>
              <div className="mb-6 md:mb-8">
                <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t("calculator.form.selectService")}
                </label>
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                  <button
                    onClick={() => setService("cryptocurrency")}
                    className={`rounded-md px-3 py-2.5 text-xs font-semibold transition md:px-4 md:text-sm ${
                      service === "cryptocurrency"
                        ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                    }`}
                  >
                    {t("business.crypto.title")}
                  </button>
                  <button
                    onClick={() => setService("paypal")}
                    className={`rounded-md px-3 py-2.5 text-xs font-semibold transition md:px-4 md:text-sm ${
                      service === "paypal"
                        ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                    }`}
                  >
                    {t("business.paypal.title")}
                  </button>
                  <button
                    onClick={() => setService("skrill")}
                    className={`rounded-md px-3 py-2.5 text-xs font-semibold transition md:px-4 md:text-sm ${
                      service === "skrill"
                        ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                    }`}
                  >
                    {t("business.skrill.title")}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t("calculator.form.transactionType")}
                </label>
                <div className="relative flex rounded-lg bg-gray-200 p-1 dark:bg-gray-700">
                  <span
                    className="pointer-events-none absolute inset-y-1 w-1/2 rounded-md bg-white shadow transition-transform duration-200 ease-in-out dark:bg-gray-600"
                    style={{ transform: mode === "convert" ? "translateX(0)" : "translateX(100%)" }}
                  ></span>
                  <button
                    onClick={() => setMode("convert")}
                    className={`relative z-10 flex-1 py-2.5 text-xs font-semibold transition md:text-sm ${
                      mode === "convert" ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 md:gap-2">
                      <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>{t("calculator.form.sell")}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setMode("topup")}
                    className={`relative z-10 flex-1 py-2.5 text-xs font-semibold transition md:text-sm ${
                      mode === "topup" ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 md:gap-2">
                      <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>{t("calculator.form.buy")}</span>
                    </div>
                  </button>
                </div>
              </div>

              {service === "cryptocurrency" && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {t("calculator.form.selectCrypto")}
                  </label>
                  <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    {Object.entries(SUPPORTED_CRYPTOS).map(([id, { symbol, name }]) => (
                      <option key={symbol} value={symbol}>
                        {symbol} - {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {service === "cryptocurrency" && (
                <div className="mb-6 rounded-lg bg-orange-50 border border-orange-200 p-3.5 md:p-4 dark:bg-orange-900/20 dark:border-orange-800/30">
                  <div className="flex items-start gap-2.5">
                    <svg className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-orange-800 leading-relaxed dark:text-orange-200">
                      {mode === "convert" ? (
                        <p>
                          <strong>{t("calculator.info.sellCryptoLabel")}</strong> {t("calculator.info.cryptoSell")} <strong>{t("calculator.info.cryptoSellDiscount")}</strong>{t("calculator.info.cryptoSellMin")} <strong>Rp 25.000</strong>{t("calculator.info.cryptoSellStablecoin")}
                        </p>
                      ) : (
                        <p>
                          <strong>{t("calculator.info.buyCryptoLabel")}</strong> {t("calculator.info.cryptoBuy")} <strong>{t("calculator.info.cryptoBuyMarkup")}</strong>{t("calculator.info.cryptoBuyMin")} <strong>Rp 25.000</strong>{t("calculator.info.cryptoBuyStablecoin")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {service !== "cryptocurrency" && (
                <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-3.5 md:p-4 dark:bg-blue-900/20 dark:border-blue-800/30">
                  <div className="flex items-start gap-2.5">
                    <svg className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800 leading-relaxed dark:text-blue-200">
                      <p>
                        <strong>{t("calculator.info.tipLabel")}</strong> {t("calculator.info.paypalSkrill")} <strong>$20</strong>{t("calculator.info.paypalSkrillMax")} <strong>$5.000</strong>{t("calculator.info.paypalSkrillTier")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {service === "cryptocurrency"
                    ? mode === "convert"
                      ? `${t("calculator.form.amountCoin")} ${selectedCrypto}`
                      : t("calculator.form.amountIDR")
                    : t("calculator.form.amountUSD")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={
                      service === "cryptocurrency" 
                        ? mode === "convert" 
                          ? minCoinAmount 
                            ? formatCrypto(minCoinAmount, selectedCrypto).replace(` ${selectedCrypto}`, '')
                            : "0.00"
                          : "25000"
                        : "20"
                    }
                    className={`w-full rounded-lg border px-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 md:text-lg ${
                      showResult && result?.valid === false
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    }`}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-sm font-medium text-gray-500 md:text-base dark:text-gray-400">
                      {service === "cryptocurrency"
                        ? mode === "convert"
                          ? selectedCrypto
                          : "IDR"
                        : "USD"}
                    </span>
                  </div>
                </div>
                {service === "cryptocurrency" && mode === "convert" && minCoinAmount && (
                  <p className="mt-2 text-xs text-gray-600 md:text-sm dark:text-gray-400">
                    {t("calculator.form.minimal")} {formatCrypto(minCoinAmount, selectedCrypto)}
                  </p>
                )}
                {showResult && result?.valid === false && result.error && (
                  <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{result.error}</p>
                )}
              </div>

              {service === "cryptocurrency" && lastUpdated && (
                <div className="mb-6 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                  <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t("calculator.form.lastUpdate")} {getLastUpdatedText()}</span>
                </div>
              )}

              {!showResult && (
                <button
                  onClick={handleCalculate}
                  disabled={!amount || parseFloat(amount) <= 0 || isCalculating}
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCalculating ? (
                    <span className="flex items-center justify-center">
                      <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t("calculator.form.calculating")}
                    </span>
                  ) : (
                    t("calculator.form.calculate")
                  )}
                </button>
              )}

              {showResult && (
                <div className="mt-8 animate-[fadeIn_0.4s_ease-out]">
                  <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>

                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900 dark:text-gray-100">
                      <svg className="mr-2 h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {t("calculator.result.title")}
                    </h3>

                    {!result ? (
                      <p className="text-gray-600 dark:text-gray-400">{t("calculator.result.emptyState")}</p>
                    ) : result.valid ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{t("calculator.result.rate")}</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {service === "cryptocurrency"
                              ? `Rp ${formatRate(result.rate)} / ${selectedCrypto}`
                              : `Rp ${formatRate(result.rate)} / USD`}
                          </span>
                        </div>

                        {tierInfo && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t("calculator.result.tier")}</span>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                tierInfo.tierName === 'gold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                                tierInfo.tierName === 'premium' ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white' :
                                tierInfo.tierName === 'pro' ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white' :
                                'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                              }`}>
                                {t(`tiers.${tierInfo.tierName}`)}
                              </span>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{tierInfo.tierLabel}</span>
                            </div>
                          </div>
                        )}

                        {/* Network fee info for cryptocurrency */}
                        {service === "cryptocurrency" && networkFeeIDR > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t("order.networkFee")}</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {formatIDR(networkFeeIDR)}
                            </span>
                          </div>
                        )}

                        <div className="mt-4 rounded-lg bg-white p-4 dark:bg-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {service === "cryptocurrency"
                                ? mode === "convert"
                                  ? t("calculator.result.totalReceive")
                                  : t("calculator.result.totalGet")
                                : mode === "convert"
                                ? t("calculator.result.totalReceive")
                                : t("calculator.result.totalPay")}
                            </span>
                          </div>
                          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {service === "cryptocurrency"
                              ? mode === "convert"
                                ? formatIDR("totalIDR" in result ? result.totalIDR : 0)
                                : formatCrypto("cryptoAmount" in result ? result.cryptoAmount : 0, selectedCrypto)
                              : formatIDR("totalIDR" in result ? result.totalIDR : 0)}
                          </div>
                          {/* For BUY (topup) mode, show total payment including network fee */}
                          {service === "cryptocurrency" && mode === "topup" && networkFeeIDR > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{t("order.cryptoPrice")}:</span>
                                <span className="text-gray-900 dark:text-gray-100">{formatIDR(parseFloat(amount))}</span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-600 dark:text-gray-400">{t("order.networkFee")}:</span>
                                <span className="text-gray-900 dark:text-gray-100">{formatIDR(networkFeeIDR)}</span>
                              </div>
                              <div className="flex justify-between text-sm font-semibold mt-1 pt-1 border-t border-gray-200 dark:border-gray-600">
                                <span className="text-gray-600 dark:text-gray-400">{t("order.totalPayment")}:</span>
                                <span className="text-gray-900 dark:text-gray-100">{formatIDR(parseFloat(amount) + networkFeeIDR)}</span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t("order.networkFeeInfo")}
                              </p>
                            </div>
                          )}
                          {/* For SELL (convert) mode, show network fee as informational */}
                          {service === "cryptocurrency" && mode === "convert" && networkFeeIDR > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {t("order.networkFee")}: ~{formatIDR(networkFeeIDR)} ({t("order.networkFeeInfo")})
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex items-center text-sm text-green-600 dark:text-green-400">
                          <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{t("calculator.result.validTransaction")}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 space-y-3 md:mt-8">
                    <Link
                      href={`/order?${new URLSearchParams({
                        service,
                        type: mode === "convert" ? "sell" : "buy",
                        ...(service === "cryptocurrency" ? { crypto: selectedCrypto } : {}),
                        amount,
                      }).toString()}`}
                      className="flex w-full items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all"
                    >
                      <span className="relative inline-flex items-center">
                        {t("calculator.result.telegramButton")}{" "}
                        <span className="ml-1 tracking-normal text-blue-300 transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setShowResult(false);
                        setAmount("");
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {t("calculator.result.recalculate")}
                    </button>
                  </div>

                  <div className="mt-6 rounded-lg bg-gray-50 p-3.5 md:p-4 dark:bg-gray-700/50">
                    <div className="flex items-start gap-2.5">
                      <svg className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs leading-relaxed text-gray-600 md:text-sm dark:text-gray-300">
                        <strong className="text-gray-900 dark:text-gray-100">{t("calculator.result.noteLabel")}</strong> {t("calculator.result.noteText")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
                </>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 md:mt-16">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100">{t("calculator.features.realtime.title")}</h3>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{t("calculator.features.realtime.desc")}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100">{t("calculator.features.transparent.title")}</h3>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{t("calculator.features.transparent.desc")}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100">{t("calculator.features.competitive.title")}</h3>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{t("calculator.features.competitive.desc")}</p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t("calculator.trust.noHiddenFees")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t("calculator.trust.autoUpdate")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t("calculator.trust.fastProcess")}</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
