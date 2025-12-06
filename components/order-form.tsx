"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/language-context";
import PageIllustration from "@/components/page-illustration";
import {
  calculatePayPalSkrill,
  calculateCryptoFromIDR,
  calculateCryptoFromCoin,
  formatIDR,
  formatUSD,
  formatCrypto,
  getTierInfo,
  type ServiceType,
  type ModeType,
} from "@/lib/calculator";
import { SUPPORTED_CRYPTOS, SYMBOL_TO_ID } from "@/lib/rates";

const CRYPTOS_ARRAY = Object.values(SUPPORTED_CRYPTOS);

// Network options for each cryptocurrency
const CRYPTO_NETWORKS: { [key: string]: string[] } = {
  BTC: ['Bitcoin'],
  ETH: ['Ethereum (ERC-20)'],
  BNB: ['BSC (BEP-20)', 'Ethereum (ERC-20)'],
  SOL: ['Solana'],
  TRX: ['Tron (TRC-20)'],
  TON: ['TON Network'],
  XRP: ['XRP Ledger'],
  TKO: ['BSC (BEP-20)'],
  MATIC: ['Polygon', 'Ethereum (ERC-20)'],
  ADA: ['Cardano'],
  SHIB: ['Ethereum (ERC-20)', 'BSC (BEP-20)'],
  BABYDOGE: ['BSC (BEP-20)'],
  CAKE: ['BSC (BEP-20)'],
  FLOKI: ['Ethereum (ERC-20)', 'BSC (BEP-20)'],
  DOGS: ['TON Network'],
  NOTCOIN: ['TON Network'],
  DOGE: ['Dogecoin'],
  USDT: ['TRC-20 (Tron)', 'BSC (BEP-20)', 'Ethereum (ERC-20)', 'Solana'],
  USDC: ['Ethereum (ERC-20)', 'BSC (BEP-20)', 'Solana', 'Polygon']
};

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: ServiceType;
  cryptoSymbol: string;
  cryptoNetwork: string;
  transactionType: "buy" | "sell";
  amountInput: string;
  paymentMethod: string;
  paymentAccountName: string;
  paymentAccountNumber: string;
  walletAddress: string;
  xrpTag: string;
  paypalEmail: string;
  skrillEmail: string;
  notes: string;
}

export default function OrderForm() {
  const { t, language } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceType: "cryptocurrency",
    cryptoSymbol: "BTC",
    cryptoNetwork: "Bitcoin",
    transactionType: "buy",
    amountInput: "",
    paymentMethod: "",
    paymentAccountName: "",
    paymentAccountNumber: "",
    walletAddress: "",
    xrpTag: "",
    paypalEmail: "",
    skrillEmail: "",
    notes: "",
  });

  const [cryptoPrices, setCryptoPrices] = useState<{ [key: string]: { idr: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // User state
  const [userSaldo, setUserSaldo] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Dynamic minimum amounts from NOWPayments
  const [cryptoMinimum, setCryptoMinimum] = useState<{
    minAmount: number;
    minAmountIDR: number;
  } | null>(null);
  const [loadingMinimum, setLoadingMinimum] = useState(false);

  // Fetch logged-in user info and auto-fill form
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const result = await response.json();
        if (result.success && result.user) {
          setFormData(prev => ({
            ...prev,
            customerName: result.user.name || "",
            customerEmail: result.user.email || "",
            customerPhone: result.user.phone || "",
          }));
          setUserSaldo(parseFloat(result.user.saldo?.toString() || "0"));
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setUserSaldo(0);
        }
      } catch (error) {
        // User not logged in
        setIsLoggedIn(false);
        setUserSaldo(0);
      } finally {
        setCheckingAuth(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch crypto prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/crypto-rates");
        const result = await response.json();
        if (result.success && result.prices) {
          setCryptoPrices(result.prices);
        }
      } catch (error) {
        console.error("Failed to fetch crypto prices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, []);

  // Fetch dynamic minimum amount for selected crypto
  useEffect(() => {
    const fetchMinimum = async () => {
      if (formData.serviceType !== "cryptocurrency" || !formData.cryptoSymbol) {
        setCryptoMinimum(null);
        return;
      }

      const coinId = SYMBOL_TO_ID[formData.cryptoSymbol];
      const priceIDR = cryptoPrices?.[coinId]?.idr || 0;
      
      if (!priceIDR) {
        setCryptoMinimum(null);
        return;
      }

      setLoadingMinimum(true);
      try {
        const priceUSD = priceIDR / 16000;
        const response = await fetch(`/api/crypto/minimums?symbol=${formData.cryptoSymbol}&price=${priceUSD}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setCryptoMinimum({
            minAmount: result.data.minAmount,
            minAmountIDR: result.data.minAmountIDR
          });
        } else {
          setCryptoMinimum(null);
        }
      } catch (error) {
        console.error("Failed to fetch minimum amount:", error);
        setCryptoMinimum(null);
      } finally {
        setLoadingMinimum(false);
      }
    };

    fetchMinimum();
  }, [formData.cryptoSymbol, formData.serviceType, cryptoPrices]);

  // Calculate total
  const getCalculation = () => {
    const numAmount = parseFloat(formData.amountInput);
    if (!formData.amountInput || isNaN(numAmount) || numAmount <= 0) {
      return null;
    }

    if (formData.serviceType === "cryptocurrency") {
      const coinId = SYMBOL_TO_ID[formData.cryptoSymbol];
      const marketPrice = cryptoPrices?.[coinId]?.idr || 0;
      
      if (!marketPrice) {
        return null;
      }

      const mode: ModeType = formData.transactionType === "sell" ? "convert" : "topup";

      // For crypto buy (topup), input is IDR
      if (formData.transactionType === "buy") {
        return calculateCryptoFromIDR(formData.cryptoSymbol, numAmount, marketPrice, mode);
      }
      
      // For crypto sell (convert), input is crypto amount
      return calculateCryptoFromCoin(formData.cryptoSymbol, numAmount, marketPrice, mode);
    }

    // PayPal/Skrill
    const mode: ModeType = formData.transactionType === "sell" ? "convert" : "topup";
    return calculatePayPalSkrill(numAmount, mode);
  };

  const calculation = getCalculation();
  const tierInfo = formData.serviceType !== "cryptocurrency" && formData.amountInput 
    ? getTierInfo(parseFloat(formData.amountInput), formData.transactionType === "sell" ? "convert" : "topup") 
    : null;

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle crypto symbol change (auto-set network to first option)
  const handleCryptoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const symbol = e.target.value;
    const networks = CRYPTO_NETWORKS[symbol] || [];
    setFormData(prev => ({ 
      ...prev, 
      cryptoSymbol: symbol,
      cryptoNetwork: networks[0] || "",
      xrpTag: "" // Reset XRP tag when crypto changes
    }));
    if (errors.cryptoSymbol || errors.cryptoNetwork) {
      setErrors(prev => ({ ...prev, cryptoSymbol: "", cryptoNetwork: "" }));
    }
  };

  // Handle service type change with comprehensive field reset
  const handleServiceTypeChange = (newServiceType: ServiceType) => {
    setFormData(prev => {
      // Always clear ALL service-specific fields regardless of target service
      const baseReset = {
        ...prev,
        serviceType: newServiceType,
        // Clear crypto fields
        cryptoSymbol: "",
        cryptoNetwork: "",
        walletAddress: "",
        xrpTag: "",
        // Clear PayPal/Skrill email fields
        paypalEmail: "",
        skrillEmail: "",
        // Reset amount when switching services
        amountInput: "",
      };

      // Set appropriate defaults for new service type
      if (newServiceType === "cryptocurrency") {
        return {
          ...baseReset,
          cryptoSymbol: "BTC",
          cryptoNetwork: "Bitcoin",
        };
      }
      
      return baseReset;
    });
    // Clear all errors when switching service
    setErrors({});
  };

  // Validate form with auto-scroll to first error
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = t('order.errors.nameRequired');
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = t('order.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = t('order.errors.emailInvalid');
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = t('order.errors.phoneRequired');
    } else if (!/^[0-9]{10,15}$/.test(formData.customerPhone.replace(/[^0-9]/g, ""))) {
      newErrors.customerPhone = t('order.errors.phoneInvalid');
    }

    if (!formData.amountInput || parseFloat(formData.amountInput) <= 0) {
      newErrors.amountInput = t('order.errors.amountRequired');
    }

    // Service-specific validation
    if (formData.serviceType === "cryptocurrency") {
      if (!formData.cryptoNetwork.trim()) {
        newErrors.cryptoNetwork = t('order.errors.networkRequired');
      }
      if (formData.transactionType === "buy") {
        // BUY: Check both static minimum (Rp 25,000) and dynamic minimum from NOWPayments
        const amountIdr = parseFloat(formData.amountInput);
        const staticMin = 25000;
        const dynamicMin = cryptoMinimum?.minAmountIDR || 0;
        const effectiveMin = Math.max(staticMin, dynamicMin);
        
        if (amountIdr < effectiveMin) {
          newErrors.amountInput = language === 'id'
            ? `Minimum pembelian ${formData.cryptoSymbol}: Rp ${effectiveMin.toLocaleString('id-ID')}`
            : `Minimum purchase ${formData.cryptoSymbol}: Rp ${effectiveMin.toLocaleString('id-ID')}`;
        }
        if (!formData.walletAddress.trim()) {
          newErrors.walletAddress = t('order.errors.walletRequired');
        }
        // Validate saldo is sufficient for BUY
        if (!newErrors.amountInput && userSaldo < amountIdr) {
          newErrors.amountInput = language === 'id'
            ? `Saldo tidak cukup. Saldo Anda: Rp ${userSaldo.toLocaleString('id-ID')}`
            : `Insufficient balance. Your balance: Rp ${userSaldo.toLocaleString('id-ID')}`;
        }
      } else if (formData.transactionType === "sell") {
        // SELL: Check both static minimum and dynamic minimum from NOWPayments
        const cryptoAmount = parseFloat(formData.amountInput);
        const coinId = SYMBOL_TO_ID[formData.cryptoSymbol];
        const priceIDR = cryptoPrices?.[coinId]?.idr || 0;
        const staticMinIDR = 50000;
        const dynamicMinIDR = cryptoMinimum?.minAmountIDR || 0;
        const effectiveMinIDR = Math.max(staticMinIDR, dynamicMinIDR);
        const dynamicMinCrypto = cryptoMinimum?.minAmount || 0;
        
        if (priceIDR > 0) {
          const minCryptoFromIDR = effectiveMinIDR / priceIDR;
          const effectiveMinCrypto = Math.max(minCryptoFromIDR, dynamicMinCrypto);
          
          if (cryptoAmount < effectiveMinCrypto) {
            newErrors.amountInput = language === 'id' 
              ? `Minimum jual ${formData.cryptoSymbol}: ${formatCrypto(effectiveMinCrypto, formData.cryptoSymbol)} ${formData.cryptoSymbol} (Rp ${effectiveMinIDR.toLocaleString('id-ID')})`
              : `Minimum sell ${formData.cryptoSymbol}: ${formatCrypto(effectiveMinCrypto, formData.cryptoSymbol)} ${formData.cryptoSymbol} (Rp ${effectiveMinIDR.toLocaleString('id-ID')})`;
          }
        }
      }
    } else {
      // PayPal/Skrill validation
      if (formData.transactionType === "buy") {
        // BUY: Validate email where saldo will be sent
        const email = formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail;
        if (!email.trim()) {
          const field = formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail";
          newErrors[field] = language === 'id' 
            ? `Email ${formData.serviceType === "paypal" ? "PayPal" : "Skrill"} wajib diisi`
            : `${formData.serviceType === "paypal" ? "PayPal" : "Skrill"} email is required`;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          const field = formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail";
          newErrors[field] = t('order.errors.emailInvalid');
        }
        // Validate saldo is sufficient for BUY
        const amountUSD = parseFloat(formData.amountInput);
        if (calculation && (calculation as any).totalIDR) {
          const totalIDR = (calculation as any).totalIDR;
          if (userSaldo < totalIDR) {
            newErrors.amountInput = language === 'id'
              ? `Saldo tidak cukup. Saldo Anda: Rp ${userSaldo.toLocaleString('id-ID')}`
              : `Insufficient balance. Your balance: Rp ${userSaldo.toLocaleString('id-ID')}`;
          }
        }
      } else {
        // SELL: Validate email where user will send from
        const email = formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail;
        if (!email.trim()) {
          const field = formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail";
          newErrors[field] = language === 'id' 
            ? `Email ${formData.serviceType === "paypal" ? "PayPal" : "Skrill"} wajib diisi`
            : `${formData.serviceType === "paypal" ? "PayPal" : "Skrill"} email is required`;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          const field = formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail";
          newErrors[field] = t('order.errors.emailInvalid');
        }
      }
    }

    setErrors(newErrors);
    
    // Auto-scroll to first error
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      setTimeout(() => {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      }, 100);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!calculation || !calculation.valid) {
      setSubmitError(language === 'id' 
        ? "Perhitungan tidak valid. Silakan periksa kembali input Anda."
        : "Invalid calculation. Please check your input.");
      return;
    }

    // For BUY orders, validate saldo is sufficient
    if (formData.transactionType === "buy") {
      let checkAmountIdr: number;
      if (formData.serviceType === "cryptocurrency") {
        checkAmountIdr = parseFloat(formData.amountInput);
      } else {
        const calc = calculation as { rate: number; totalIDR: number; valid: boolean };
        checkAmountIdr = calc.totalIDR;
      }
      
      if (userSaldo < checkAmountIdr) {
        setSubmitError(language === 'id'
          ? `Saldo tidak cukup. Saldo Anda: Rp ${userSaldo.toLocaleString('id-ID')}, Total: Rp ${checkAmountIdr.toLocaleString('id-ID')}`
          : `Insufficient balance. Your balance: Rp ${userSaldo.toLocaleString('id-ID')}, Total: Rp ${checkAmountIdr.toLocaleString('id-ID')}`);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare order data with correct amount_input
      let finalAmountInput = formData.amountInput;
      let finalAmountIdr: number;

      if (formData.serviceType === "cryptocurrency") {
        if (formData.transactionType === "buy") {
          // BUY crypto: user input is IDR, calculate crypto amount
          const calc = calculation as { rate: number; cryptoAmount: number; valid: boolean };
          finalAmountInput = calc.cryptoAmount.toString();
          finalAmountIdr = parseFloat(formData.amountInput);
        } else {
          // SELL crypto: user input is crypto amount, calculate IDR
          const calc = calculation as { rate: number; totalIDR: number; valid: boolean };
          finalAmountInput = formData.amountInput; // already crypto amount
          finalAmountIdr = calc.totalIDR;
        }
      } else {
        // PayPal/Skrill: amountInput is USD
        const calc = calculation as { rate: number; totalIDR: number; valid: boolean };
        finalAmountInput = formData.amountInput;
        finalAmountIdr = calc.totalIDR;
      }

      // BUY orders always pay with saldo, SELL orders credit to saldo
      const coinId = formData.serviceType === "cryptocurrency" ? SYMBOL_TO_ID[formData.cryptoSymbol] : null;
      const cryptoPrice = coinId ? (cryptoPrices?.[coinId]?.idr || 0) / 16000 : 0;
      
      const orderData = {
        ...formData,
        amountInput: finalAmountInput,
        amountIdr: finalAmountIdr,
        rate: calculation.rate,
        paidWithSaldo: formData.transactionType === "buy", // BUY always uses saldo
        cryptoPrice: cryptoPrice, // USD price for NOWPayments validation
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          serviceType: "cryptocurrency",
          cryptoSymbol: "BTC",
          cryptoNetwork: "Bitcoin",
          transactionType: "buy",
          amountInput: "",
          paymentMethod: "",
          paymentAccountName: "",
          paymentAccountNumber: "",
          walletAddress: "",
          xrpTag: "",
          paypalEmail: "",
          skrillEmail: "",
          notes: "",
        });
        
        // Refresh user saldo after order (for BUY orders, saldo was deducted)
        if (formData.transactionType === "buy") {
          try {
            const profileRes = await fetch("/api/user/profile");
            const profileResult = await profileRes.json();
            if (profileResult.success && profileResult.user) {
              setUserSaldo(parseFloat(profileResult.user.saldo?.toString() || "0"));
            }
          } catch (error) {
            // Silent fail
          }
        }
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError(result.error || t('order.errorMessage'));
      }
    } catch (error) {
      console.error("Order submission error:", error);
      setSubmitError(t('order.errorMessage'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative">
      <PageIllustration />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          {/* Header */}
          <div className="pb-12 text-center md:pb-16">
            <h1 className="mb-4 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1] md:text-5xl dark:text-gray-100">
              {t('order.title')}
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="text-base text-gray-600 md:text-lg dark:text-gray-300">
                {t('order.subtitle')}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('order.whatsappNotice')}</span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="mx-auto max-w-3xl mb-8">
              <div className="rounded-lg bg-green-50 border border-green-200 p-6 dark:bg-green-900/20 dark:border-green-800">
                <div className="flex items-start gap-4">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                      {t('order.successTitle')}
                    </h3>
                    <p className="text-green-800 dark:text-green-200">
                      {t('order.successMessage')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="mx-auto max-w-3xl mb-8">
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
                  </div>
                  <button
                    onClick={() => setSubmitError(null)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="mx-auto max-w-3xl">
            {/* Loading State */}
            {checkingAuth ? (
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg md:p-8 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="h-10 w-10 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {language === 'id' ? 'Memuat...' : 'Loading...'}
                  </p>
                </div>
              </div>
            ) : !isLoggedIn ? (
              /* Login Required Message */
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg md:p-8 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-5 rounded-full bg-blue-100 p-3.5 dark:bg-blue-900/30">
                    <svg className="h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {language === 'id' ? 'Login Diperlukan' : 'Login Required'}
                  </h2>
                  <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
                    {language === 'id' 
                      ? 'Untuk melakukan transaksi, Anda harus login terlebih dahulu. Semua pembayaran dilakukan menggunakan saldo akun Anda.'
                      : 'To make a transaction, you must log in first. All payments are made using your account balance.'}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href="/login"
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
                    >
                      {language === 'id' ? 'Masuk' : 'Login'}
                    </a>
                    <a
                      href="/register"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md transition-all"
                    >
                      {language === 'id' ? 'Daftar Akun Baru' : 'Register'}
                    </a>
                  </div>
                  <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
                    {language === 'id' 
                      ? 'Belum punya saldo? Setelah login, Anda dapat melakukan deposit saldo terlebih dahulu.'
                      : "Don't have balance yet? After login, you can deposit funds first."}
                  </p>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg md:p-8 dark:border-gray-700 dark:bg-gray-800">
              {/* Saldo Info Banner */}
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {language === 'id' ? 'Saldo Akun Anda' : 'Your Account Balance'}
                      </p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        Rp {userSaldo.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <a 
                    href="/dashboard/deposit" 
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:shadow-md transition-all"
                  >
                    {language === 'id' ? 'Deposit' : 'Top Up'}
                  </a>
                </div>
              </div>

              <>
                  {/* Customer Information */}
                  <div className="mb-8">
                    <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
                      {t('order.customerInfo')}
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {t('order.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleChange}
                          className={`w-full rounded-lg border ${errors.customerName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500`}
                          placeholder={language === 'id' ? 'Masukkan nama lengkap Anda' : 'Enter your full name'}
                        />
                        {errors.customerName && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customerName}</p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {t('order.email')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="customerEmail"
                          value={formData.customerEmail}
                          onChange={handleChange}
                          className={`w-full rounded-lg border ${errors.customerEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500`}
                          placeholder="[email protected]"
                        />
                        {errors.customerEmail && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customerEmail}</p>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {t('order.phone')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="customerPhone"
                          value={formData.customerPhone}
                          onChange={handleChange}
                          className={`w-full rounded-lg border ${errors.customerPhone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500`}
                          placeholder="08xxxxxxxxxx"
                        />
                        {errors.customerPhone && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customerPhone}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {language === 'id' ? 'Nomor yang akan kami hubungi untuk konfirmasi order' : 'Number we will contact for order confirmation'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="mb-8">
                    <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
                      {t('order.transactionDetails')}
                    </h2>

                    {/* Service Type */}
                    <div className="mb-6">
                      <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t('order.service')} <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                        <button
                          type="button"
                          onClick={() => handleServiceTypeChange("cryptocurrency")}
                          className={`rounded-md px-3 py-2.5 text-xs font-semibold transition-all duration-200 md:px-4 md:text-sm ${
                            formData.serviceType === "cryptocurrency"
                              ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                              : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                          }`}
                        >
                          {t('order.cryptocurrency')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleServiceTypeChange("paypal")}
                          className={`rounded-md px-3 py-2.5 text-xs font-semibold transition-all duration-200 md:px-4 md:text-sm ${
                            formData.serviceType === "paypal"
                              ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                              : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                          }`}
                        >
                          {t('order.paypal')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleServiceTypeChange("skrill")}
                          className={`rounded-md px-3 py-2.5 text-xs font-semibold transition-all duration-200 md:px-4 md:text-sm ${
                            formData.serviceType === "skrill"
                              ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-gray-100"
                              : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                          }`}
                        >
                          {t('order.skrill')}
                        </button>
                      </div>
                    </div>

                    {/* Transaction Type */}
                    <div className="mb-6">
                      <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t('order.transactionType')} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex rounded-lg bg-gray-200 p-1 dark:bg-gray-700">
                        <span
                          className="pointer-events-none absolute inset-y-1 w-1/2 rounded-md bg-white shadow transition-transform duration-200 ease-in-out dark:bg-gray-600"
                          style={{ transform: formData.transactionType === "sell" ? "translateX(0)" : "translateX(100%)" }}
                        ></span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, transactionType: "sell" }))}
                          className="relative z-10 flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition text-gray-900 dark:text-gray-100"
                        >
                          <div className="flex items-center justify-center gap-1.5 md:gap-2">
                            <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>{t('order.sell')}</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, transactionType: "buy" }))}
                          className="relative z-10 flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition text-gray-900 dark:text-gray-100"
                        >
                          <div className="flex items-center justify-center gap-1.5 md:gap-2">
                            <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>{t('order.buy')}</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Crypto Selection (only for crypto) */}
                    {formData.serviceType === "cryptocurrency" && (
                      <>
                        <div className="mb-6">
                          <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {t('order.crypto')} <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="cryptoSymbol"
                            value={formData.cryptoSymbol}
                            onChange={handleCryptoChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                          >
                            {CRYPTOS_ARRAY.map((crypto) => (
                              <option key={crypto.symbol} value={crypto.symbol}>
                                {crypto.name} ({crypto.symbol})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-6">
                          <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {t('order.network')} <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="cryptoNetwork"
                            value={formData.cryptoNetwork}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                          >
                            {(CRYPTO_NETWORKS[formData.cryptoSymbol] || []).map((network) => (
                              <option key={network} value={network}>
                                {network}
                              </option>
                            ))}
                          </select>
                          {errors.cryptoNetwork && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.cryptoNetwork}</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Amount Input */}
                    <div className="mb-6">
                      <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {formData.serviceType === "cryptocurrency"
                          ? formData.transactionType === "buy"
                            ? t('order.amountIDR')
                            : `${t('order.amount')} (${formData.cryptoSymbol})`
                          : t('order.amountUSD')}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="amountInput"
                        value={formData.amountInput}
                        onChange={handleChange}
                        step={formData.serviceType === "cryptocurrency" && formData.transactionType === "sell" ? "0.00000001" : "1"}
                        className={`w-full rounded-lg border ${errors.amountInput ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500`}
                        placeholder={
                          formData.serviceType === "cryptocurrency"
                            ? formData.transactionType === "buy"
                              ? (() => {
                                  const staticMin = 25000;
                                  const dynamicMin = cryptoMinimum?.minAmountIDR || 0;
                                  const effectiveMin = Math.max(staticMin, dynamicMin);
                                  return `Min ${effectiveMin.toLocaleString('id-ID')}`;
                                })()
                              : (() => {
                                  const coinId = SYMBOL_TO_ID[formData.cryptoSymbol];
                                  const priceIDR = cryptoPrices?.[coinId]?.idr || 0;
                                  if (priceIDR > 0) {
                                    const staticMinIDR = 50000;
                                    const dynamicMinIDR = cryptoMinimum?.minAmountIDR || 0;
                                    const effectiveMinIDR = Math.max(staticMinIDR, dynamicMinIDR);
                                    const dynamicMinCrypto = cryptoMinimum?.minAmount || 0;
                                    const minFromIDR = effectiveMinIDR / priceIDR;
                                    const effectiveMinCrypto = Math.max(minFromIDR, dynamicMinCrypto);
                                    return `Min ${formatCrypto(effectiveMinCrypto, formData.cryptoSymbol)}`;
                                  }
                                  return language === 'id' ? 'Masukkan jumlah coin' : 'Enter coin amount';
                                })()
                            : "Minimal 20"
                        }
                      />
                      
                      {/* Minimum Amount Helper Text for Crypto SELL */}
                      {formData.serviceType === "cryptocurrency" && formData.transactionType === "sell" && cryptoPrices && !errors.amountInput && (
                        (() => {
                          const coinId = SYMBOL_TO_ID[formData.cryptoSymbol];
                          const priceIDR = cryptoPrices[coinId]?.idr || 0;
                          if (priceIDR > 0) {
                            const staticMinIDR = 50000;
                            const dynamicMinIDR = cryptoMinimum?.minAmountIDR || 0;
                            const effectiveMinIDR = Math.max(staticMinIDR, dynamicMinIDR);
                            const dynamicMinCrypto = cryptoMinimum?.minAmount || 0;
                            const minFromIDR = effectiveMinIDR / priceIDR;
                            const effectiveMinCrypto = Math.max(minFromIDR, dynamicMinCrypto);
                            return (
                              <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                                {language === 'id' ? 'Minimum' : 'Minimum'}: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCrypto(effectiveMinCrypto, formData.cryptoSymbol)} {formData.cryptoSymbol}</span> (Rp {effectiveMinIDR.toLocaleString('id-ID')})
                                {loadingMinimum && <span className="ml-1 animate-pulse">...</span>}
                              </p>
                            );
                          }
                          return null;
                        })()
                      )}
                      
                      {/* Minimum Amount Helper Text for Crypto BUY */}
                      {formData.serviceType === "cryptocurrency" && formData.transactionType === "buy" && !errors.amountInput && (
                        (() => {
                          const staticMin = 25000;
                          const dynamicMin = cryptoMinimum?.minAmountIDR || 0;
                          const effectiveMin = Math.max(staticMin, dynamicMin);
                          return (
                            <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                              {language === 'id' ? 'Minimum' : 'Minimum'}: <span className="font-semibold text-gray-900 dark:text-gray-100">Rp {effectiveMin.toLocaleString('id-ID')}</span>
                              {loadingMinimum && <span className="ml-1 animate-pulse">...</span>}
                            </p>
                          );
                        })()
                      )}
                      
                      {/* Minimum Amount Helper Text for PayPal/Skrill */}
                      {formData.serviceType !== "cryptocurrency" && !errors.amountInput && (
                        <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                          {language === 'id' ? 'Minimum' : 'Minimum'}: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatUSD(20)}</span>
                        </p>
                      )}
                      
                      {errors.amountInput && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.amountInput}</p>
                      )}
                      
                      {/* Calculation Result */}
                      {calculation && calculation.valid && (
                        <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-blue-900 uppercase dark:text-blue-300">
                                {t('order.calculationResults')}
                              </p>
                              <div className="mt-2">
                                {formData.serviceType === "cryptocurrency" ? (
                                  <>
                                    {formData.transactionType === "buy" ? (
                                      <>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                          {formatCrypto((calculation as any).cryptoAmount, formData.cryptoSymbol)}
                                        </p>
                                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                          {t('order.rate')}: {formatIDR(calculation.rate)} per {formData.cryptoSymbol}
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                          {formatIDR((calculation as any).totalIDR)}
                                        </p>
                                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                          {t('order.rate')}: {formatIDR(calculation.rate)} per {formData.cryptoSymbol}
                                        </p>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                      {formatIDR((calculation as any).totalIDR)}
                                    </p>
                                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                      {t('order.rate')}: {formatIDR(calculation.rate)}
                                    </p>
                                    {tierInfo && (
                                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                        {t('order.tier')}: {tierInfo.tierName.toUpperCase()} ({tierInfo.tierLabel})
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Service-specific fields */}
                    {formData.serviceType === "cryptocurrency" ? (
                      <>
                        {formData.transactionType === "buy" ? (
                          <>
                            <div className="mb-6">
                              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {t('order.walletAddress')} {formData.cryptoSymbol} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="walletAddress"
                                value={formData.walletAddress}
                                onChange={handleChange}
                                className={`w-full rounded-lg border ${errors.walletAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 font-mono text-sm`}
                                placeholder={language === 'id' ? 'Paste alamat wallet Anda di sini' : 'Paste your wallet address here'}
                              />
                              {errors.walletAddress && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.walletAddress}</p>
                              )}
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {language === 'id' ? 'Cryptocurrency akan dikirim ke alamat ini' : 'Cryptocurrency will be sent to this address'}
                              </p>
                            </div>

                            {/* Payment Info - BUY orders use saldo */}
                            <div className="mb-6">
                              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                <div className="flex items-center gap-3">
                                  <svg className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                      {language === 'id' ? 'Pembayaran menggunakan saldo akun' : 'Payment using account balance'}
                                    </p>
                                    <p className="text-xs text-green-700 dark:text-green-300">
                                      {language === 'id' 
                                        ? 'Saldo Anda akan dipotong otomatis saat order dibuat'
                                        : 'Your balance will be deducted automatically when order is created'}
                                    </p>
                                  </div>
                                </div>
                                {formData.amountInput && (
                                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                                    {(() => {
                                      const totalIDR = parseFloat(formData.amountInput) || 0;
                                      const sufficient = userSaldo >= totalIDR;
                                      const remaining = userSaldo - totalIDR;
                                      return (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-green-700 dark:text-green-300">
                                            {language === 'id' ? 'Sisa saldo setelah transaksi:' : 'Balance after transaction:'}
                                          </span>
                                          <span className={`font-semibold ${sufficient ? 'text-green-800 dark:text-green-200' : 'text-red-600 dark:text-red-400'}`}>
                                            Rp {remaining.toLocaleString('id-ID')}
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        ) : null}

                        {/* XRP Tag Field (only for XRP) */}
                        {formData.transactionType === "buy" && formData.cryptoSymbol === "XRP" && (
                          <div className="mb-6">
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                              {t('order.xrpTag')} <span className="text-gray-400 text-xs">({t('order.optional')})</span>
                            </label>
                            <input
                              type="text"
                              name="xrpTag"
                              value={formData.xrpTag}
                              onChange={handleChange}
                              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 font-mono text-sm"
                              placeholder={language === 'id' ? 'Masukkan Tag/Memo jika diperlukan' : 'Enter Tag/Memo if required'}
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {language === 'id' ? 'Beberapa exchange memerlukan Tag/Memo untuk deposit XRP. Biarkan kosong jika tidak diperlukan.' : 'Some exchanges require Tag/Memo for XRP deposits. Leave empty if not required.'}
                            </p>
                          </div>
                        )}

                        {formData.transactionType === "sell" && (
                          <>
                            {/* Saldo Credit Info - SELL orders credit to saldo */}
                            <div className="mb-6">
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                <div className="flex items-center gap-3">
                                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                      {language === 'id' ? 'Pembayaran masuk ke saldo akun' : 'Payment credited to account balance'}
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                      {language === 'id' 
                                        ? 'Saldo Anda akan bertambah setelah admin memverifikasi transaksi'
                                        : 'Your balance will increase after admin verifies the transaction'}
                                    </p>
                                  </div>
                                </div>
                                {calculation && calculation.valid && (
                                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-blue-700 dark:text-blue-300">
                                        {language === 'id' ? 'Saldo setelah transaksi selesai:' : 'Balance after transaction completes:'}
                                      </span>
                                      <span className="font-semibold text-blue-800 dark:text-blue-200">
                                        Rp {(userSaldo + (calculation as any).totalIDR).toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {formData.transactionType === "buy" ? (
                          <>
                            <div className="mb-6">
                              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {t('order.emailService')} {formData.serviceType === "paypal" ? "PayPal" : "Skrill"} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                name={formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail"}
                                value={formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail}
                                onChange={handleChange}
                                className={`w-full rounded-lg border ${errors[formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail"] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500`}
                                placeholder={language === 'id' ? `Email akun ${formData.serviceType === "paypal" ? "PayPal" : "Skrill"} Anda` : `Your ${formData.serviceType === "paypal" ? "PayPal" : "Skrill"} account email`}
                              />
                              {errors[formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail"] && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                  {errors[formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail"]}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {language === 'id' ? 'Saldo akan ditransfer ke email ini' : 'Balance will be transferred to this email'}
                              </p>
                            </div>

                            {/* Payment Info - BUY orders use saldo */}
                            <div className="mb-6">
                              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                <div className="flex items-center gap-3">
                                  <svg className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                      {language === 'id' ? 'Pembayaran menggunakan saldo akun' : 'Payment using account balance'}
                                    </p>
                                    <p className="text-xs text-green-700 dark:text-green-300">
                                      {language === 'id' 
                                        ? 'Saldo Anda akan dipotong otomatis saat order dibuat'
                                        : 'Your balance will be deducted automatically when order is created'}
                                    </p>
                                  </div>
                                </div>
                                {calculation && (
                                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                                    {(() => {
                                      const totalIDR = (calculation as any).totalIDR || 0;
                                      const sufficient = userSaldo >= totalIDR;
                                      const remaining = userSaldo - totalIDR;
                                      return (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-green-700 dark:text-green-300">
                                            {language === 'id' ? 'Sisa saldo setelah transaksi:' : 'Balance after transaction:'}
                                          </span>
                                          <span className={`font-semibold ${sufficient ? 'text-green-800 dark:text-green-200' : 'text-red-600 dark:text-red-400'}`}>
                                            Rp {remaining.toLocaleString('id-ID')}
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mb-6">
                              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {t('order.emailService')} {formData.serviceType === "paypal" ? "PayPal" : "Skrill"} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                name={formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail"}
                                value={formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail}
                                onChange={handleChange}
                                className={`w-full rounded-lg border ${errors[formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail"] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500`}
                                placeholder={language === 'id' ? `Email akun ${formData.serviceType === "paypal" ? "PayPal" : "Skrill"} yang akan transfer` : `Your ${formData.serviceType === "paypal" ? "PayPal" : "Skrill"} account email`}
                              />
                              {errors[formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail"] && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                  {errors[formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail"]}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {language === 'id' ? 'Email akun yang akan Anda gunakan untuk transfer' : 'Email account you will use to transfer'}
                              </p>
                            </div>

                            {/* Saldo Credit Info - SELL orders credit to saldo */}
                            <div className="mb-6">
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                <div className="flex items-center gap-3">
                                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                      {language === 'id' ? 'Pembayaran masuk ke saldo akun' : 'Payment credited to account balance'}
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                      {language === 'id' 
                                        ? 'Saldo Anda akan bertambah setelah admin memverifikasi transaksi'
                                        : 'Your balance will increase after admin verifies the transaction'}
                                    </p>
                                  </div>
                                </div>
                                {calculation && calculation.valid && (
                                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-blue-700 dark:text-blue-300">
                                        {language === 'id' ? 'Saldo setelah transaksi selesai:' : 'Balance after transaction completes:'}
                                      </span>
                                      <span className="font-semibold text-blue-800 dark:text-blue-200">
                                        Rp {(userSaldo + (calculation as any).totalIDR).toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Notes */}
                    <div className="mb-6">
                      <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t('order.notes')}
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                        placeholder={t('order.notesPlaceholder')}
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col gap-4">
                    <button
                      type="submit"
                      disabled={submitting || !calculation || !calculation.valid}
                      className={`relative w-full rounded-lg bg-gradient-to-t from-blue-600 to-blue-500 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 ${
                        submitting 
                          ? 'cursor-not-allowed opacity-90' 
                          : !calculation || !calculation.valid
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <span className={`flex items-center justify-center gap-2 ${submitting ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
                        {t('order.submitButton')}
                      </span>
                      {submitting && (
                        <span className="absolute inset-0 flex items-center justify-center gap-2">
                          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{t('order.submitting')}</span>
                        </span>
                      )}
                    </button>
                    
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                      <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t('order.securityNotice')}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
            </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
