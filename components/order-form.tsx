"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  getTierInfo,
  type ServiceType,
  type ModeType,
  type DynamicRatesConfig,
} from "@/lib/calculator";
import { SUPPORTED_CRYPTOS, SYMBOL_TO_ID } from "@/lib/rates";

const CRYPTOS_ARRAY = Object.values(SUPPORTED_CRYPTOS);

// Network options for each cryptocurrency
const CRYPTO_NETWORKS: { [key: string]: string[] } = {
  BTC: ['Bitcoin'],
  ETH: ['Ethereum (ERC-20)'],
  BNB: ['BSC (BEP-20)'],
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  
  const getInitialFormData = (): FormData => {
    const serviceParam = searchParams.get('service');
    const typeParam = searchParams.get('type');
    const cryptoParam = searchParams.get('crypto');
    const amountParam = searchParams.get('amount');
    
    let serviceType: ServiceType = "cryptocurrency";
    if (serviceParam === "paypal") serviceType = "paypal";
    else if (serviceParam === "skrill") serviceType = "skrill";
    else if (serviceParam === "cryptocurrency") serviceType = "cryptocurrency";
    
    const cryptoSymbol = cryptoParam && Object.keys(CRYPTO_NETWORKS).includes(cryptoParam) 
      ? cryptoParam 
      : "BTC";
    
    return {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      serviceType,
      cryptoSymbol,
      cryptoNetwork: CRYPTO_NETWORKS[cryptoSymbol]?.[0] || "Bitcoin",
      transactionType: typeParam === "sell" ? "sell" : "buy",
      amountInput: amountParam || "",
      paymentMethod: "",
      paymentAccountName: "",
      paymentAccountNumber: "",
      walletAddress: "",
      xrpTag: "",
      paypalEmail: "",
      skrillEmail: "",
      notes: "",
    };
  };
  
  const [formData, setFormData] = useState<FormData>(getInitialFormData);

  const [cryptoPrices, setCryptoPrices] = useState<{ [key: string]: { idr: number } } | null>(null);
  const [dynamicRates, setDynamicRates] = useState<DynamicRatesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // User state
  const [userSaldo, setUserSaldo] = useState<number>(0);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Dynamic minimum amounts from NOWPayments
  const [cryptoMinimum, setCryptoMinimum] = useState<{
    minAmount: number;
    minAmountIDR: number;
  } | null>(null);
  const [loadingMinimum, setLoadingMinimum] = useState(false);
  
  // Network fee state
  const [networkFeeIDR, setNetworkFeeIDR] = useState<number>(0);
  
  // Saved wallets state
  const [savedWallets, setSavedWallets] = useState<Array<{
    id: number;
    label: string;
    cryptoSymbol: string;
    network: string | null;
    walletAddress: string;
    xrpTag: string | null;
  }>>([]);
  const [loadingSavedWallets, setLoadingSavedWallets] = useState(false);
  const [saveThisWallet, setSaveThisWallet] = useState(false);
  const [walletLabel, setWalletLabel] = useState("");
  
  // Saved emails state (for PayPal/Skrill)
  const [savedEmails, setSavedEmails] = useState<Array<{
    id: number;
    label: string;
    serviceType: string;
    email: string;
  }>>([]);
  const [loadingSavedEmails, setLoadingSavedEmails] = useState(false);
  const [saveThisEmail, setSaveThisEmail] = useState(false);
  const [emailLabel, setEmailLabel] = useState("");
  
  // Auth navigation loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

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
          setUserPhotoUrl(result.user.photoUrl || null);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setUserSaldo(0);
          setUserPhotoUrl(null);
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

  // Fetch crypto prices and dynamic rates
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
        }
        
        if (ratesData.success) {
          setDynamicRates({
            cryptoConfig: ratesData.cryptoConfig,
            paypalRates: ratesData.paypalRates,
            skrillRates: ratesData.skrillRates,
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 180000); // 3 minutes

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

  // Fetch network fee when crypto symbol or network changes
  useEffect(() => {
    const fetchNetworkFee = async () => {
      if (formData.serviceType !== "cryptocurrency" || !formData.cryptoSymbol || !formData.cryptoNetwork) {
        setNetworkFeeIDR(0);
        return;
      }

      try {
        const response = await fetch(`/api/crypto/network-fees?symbol=${formData.cryptoSymbol}&network=${encodeURIComponent(formData.cryptoNetwork)}`);
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
  }, [formData.cryptoSymbol, formData.cryptoNetwork, formData.serviceType]);

  // Fetch saved wallets when crypto symbol changes (only for logged in users on BUY)
  useEffect(() => {
    const fetchSavedWallets = async () => {
      if (!isLoggedIn || formData.serviceType !== "cryptocurrency" || formData.transactionType !== "buy") {
        setSavedWallets([]);
        return;
      }

      setLoadingSavedWallets(true);
      try {
        const response = await fetch(`/api/saved-wallets?crypto=${formData.cryptoSymbol}`);
        const result = await response.json();
        if (result.success && result.wallets) {
          setSavedWallets(result.wallets);
        } else {
          setSavedWallets([]);
        }
      } catch (error) {
        console.error("Failed to fetch saved wallets:", error);
        setSavedWallets([]);
      } finally {
        setLoadingSavedWallets(false);
      }
    };

    fetchSavedWallets();
  }, [formData.cryptoSymbol, formData.serviceType, formData.transactionType, isLoggedIn]);

  // Fetch saved emails when PayPal/Skrill is selected (only for logged in users)
  useEffect(() => {
    const fetchSavedEmails = async () => {
      if (!isLoggedIn || formData.serviceType === "cryptocurrency") {
        setSavedEmails([]);
        return;
      }

      setLoadingSavedEmails(true);
      try {
        const response = await fetch(`/api/saved-emails?service=${formData.serviceType}`);
        const result = await response.json();
        if (result.success && result.emails) {
          setSavedEmails(result.emails);
        } else {
          setSavedEmails([]);
        }
      } catch (error) {
        console.error("Failed to fetch saved emails:", error);
        setSavedEmails([]);
      } finally {
        setLoadingSavedEmails(false);
      }
    };

    fetchSavedEmails();
  }, [formData.serviceType, isLoggedIn]);

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
        return calculateCryptoFromIDR(formData.cryptoSymbol, numAmount, marketPrice, mode, dynamicRates || undefined);
      }
      
      // For crypto sell (convert), input is crypto amount
      return calculateCryptoFromCoin(formData.cryptoSymbol, numAmount, marketPrice, mode, dynamicRates || undefined);
    }

    // PayPal/Skrill
    const mode: ModeType = formData.transactionType === "sell" ? "convert" : "topup";
    return calculatePayPalSkrill(numAmount, mode, formData.serviceType as 'paypal' | 'skrill', dynamicRates || undefined);
  };

  const calculation = getCalculation();
  const tierInfo = formData.serviceType !== "cryptocurrency" && formData.amountInput 
    ? getTierInfo(parseFloat(formData.amountInput), formData.transactionType === "sell" ? "convert" : "topup", formData.serviceType as 'paypal' | 'skrill', dynamicRates || undefined) 
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
      xrpTag: "", // Reset XRP tag when crypto changes
      walletAddress: "" // Reset wallet when crypto changes
    }));
    // Reset save wallet checkbox
    setSaveThisWallet(false);
    setWalletLabel("");
    if (errors.cryptoSymbol || errors.cryptoNetwork) {
      setErrors(prev => ({ ...prev, cryptoSymbol: "", cryptoNetwork: "" }));
    }
  };

  // Handle selecting a saved wallet
  const handleSavedWalletSelect = (walletId: string) => {
    if (!walletId) {
      // User selected "Enter manually"
      return;
    }
    
    const wallet = savedWallets.find(w => w.id === parseInt(walletId));
    if (wallet) {
      setFormData(prev => ({
        ...prev,
        walletAddress: wallet.walletAddress,
        cryptoNetwork: wallet.network || prev.cryptoNetwork,
        xrpTag: wallet.xrpTag || ""
      }));
      // Don't enable save checkbox for already-saved wallet
      setSaveThisWallet(false);
      setWalletLabel("");
      if (errors.walletAddress) {
        setErrors(prev => ({ ...prev, walletAddress: "" }));
      }
    }
  };

  // Handle selecting a saved email (PayPal/Skrill)
  const handleSavedEmailSelect = (emailId: string) => {
    if (!emailId) {
      // User selected "Enter manually"
      return;
    }
    
    const savedEmail = savedEmails.find(e => e.id === parseInt(emailId));
    if (savedEmail) {
      const field = formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail";
      setFormData(prev => ({
        ...prev,
        [field]: savedEmail.email
      }));
      // Don't enable save checkbox for already-saved email
      setSaveThisEmail(false);
      setEmailLabel("");
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
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
    // Reset save email checkbox
    setSaveThisEmail(false);
    setEmailLabel("");
  };

  // Validate form with auto-scroll to first error
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

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
        // Validate saldo is sufficient for BUY (including network fee)
        const totalWithFee = amountIdr + networkFeeIDR;
        if (!newErrors.amountInput && userSaldo < totalWithFee) {
          newErrors.amountInput = language === 'id'
            ? `Saldo tidak cukup. Saldo Anda: Rp ${userSaldo.toLocaleString('id-ID')}, Total: Rp ${totalWithFee.toLocaleString('id-ID')}`
            : `Insufficient balance. Your balance: Rp ${userSaldo.toLocaleString('id-ID')}, Total: Rp ${totalWithFee.toLocaleString('id-ID')}`;
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

    // For BUY orders, validate saldo is sufficient (including network fee for crypto)
    if (formData.transactionType === "buy") {
      let checkAmountIdr: number;
      if (formData.serviceType === "cryptocurrency") {
        // Include network fee in total for crypto BUY orders
        checkAmountIdr = parseFloat(formData.amountInput) + networkFeeIDR;
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
          // Include network fee in total payment (crypto price + network fee)
          const calc = calculation as { rate: number; cryptoAmount: number; valid: boolean };
          finalAmountInput = calc.cryptoAmount.toString();
          finalAmountIdr = parseFloat(formData.amountInput) + networkFeeIDR;
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
      
      // Include network fee in order data for crypto BUY orders
      const orderNetworkFee = (formData.serviceType === "cryptocurrency" && formData.transactionType === "buy") 
        ? networkFeeIDR 
        : 0;
      
      const orderData = {
        ...formData,
        amountInput: finalAmountInput,
        amountIdr: finalAmountIdr,
        networkFee: orderNetworkFee,
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

      if (response.ok && result.success && result.orderId) {
        // Save wallet if checkbox was checked (for crypto BUY orders)
        if (saveThisWallet && formData.serviceType === "cryptocurrency" && formData.transactionType === "buy" && formData.walletAddress) {
          try {
            await fetch("/api/saved-wallets", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                label: walletLabel.trim() || `${formData.cryptoSymbol} Wallet`,
                cryptoSymbol: formData.cryptoSymbol,
                network: formData.cryptoNetwork,
                walletAddress: formData.walletAddress,
                xrpTag: formData.cryptoSymbol === "XRP" ? formData.xrpTag : null
              })
            });
          } catch (err) {
            // Silently ignore save wallet errors - order was successful
            console.error("Failed to save wallet:", err);
          }
        }
        
        // Save email if checkbox was checked (for PayPal/Skrill orders)
        if (saveThisEmail && (formData.serviceType === "paypal" || formData.serviceType === "skrill")) {
          const emailToSave = formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail;
          if (emailToSave) {
            try {
              await fetch("/api/saved-emails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  label: emailLabel.trim() || `${formData.serviceType === "paypal" ? "PayPal" : "Skrill"} Email`,
                  serviceType: formData.serviceType,
                  email: emailToSave
                })
              });
            } catch (err) {
              // Silently ignore save email errors - order was successful
              console.error("Failed to save email:", err);
            }
          }
        }
        
        // Redirect to instructions page
        router.push(`/order/instructions/${result.orderId}`);
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
            <h1 className="mb-4 py-2 border-y text-4xl font-bold [border-image:linear-gradient(to_right,transparent,theme(colors.slate.300/.8),transparent)1] md:text-5xl dark:[border-image:linear-gradient(to_right,transparent,--theme(--color-slate-600/.8),transparent)1] dark:text-gray-100">
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
                    <button
                      type="button"
                      onClick={() => {
                        setLoginLoading(true);
                        router.push(`/login?redirect=${encodeURIComponent(`/order?${searchParams.toString()}`)}`);
                      }}
                      disabled={loginLoading || registerLoading}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loginLoading ? (
                        <>
                          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {language === 'id' ? 'Memuat...' : 'Loading...'}
                        </>
                      ) : (
                        language === 'id' ? 'Masuk' : 'Login'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterLoading(true);
                        router.push(`/register?redirect=${encodeURIComponent(`/order?${searchParams.toString()}`)}`);
                      }}
                      disabled={loginLoading || registerLoading}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {registerLoading ? (
                        <>
                          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {language === 'id' ? 'Memuat...' : 'Loading...'}
                        </>
                      ) : (
                        language === 'id' ? 'Daftar Akun Baru' : 'Register'
                      )}
                    </button>
                  </div>
                  <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
                    {language === 'id' 
                      ? 'Belum punya saldo? Setelah login, Anda dapat melakukan deposit saldo terlebih dahulu.'
                      : "Don't have balance yet? After login, you can deposit funds first."}
                  </p>
                </div>
              </div>
            ) : (
            <div className="rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
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
                  <Link 
                    href="/dashboard/deposit" 
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:shadow-md transition-all"
                  >
                    {language === 'id' ? 'Deposit' : 'Top Up'}
                  </Link>
                </div>
              </div>

              <>
                  {/* Account Info Display */}
                  <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {userPhotoUrl ? (
                          <img 
                            src={userPhotoUrl} 
                            alt={formData.customerName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formData.customerName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formData.customerEmail}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard/settings"
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {language === 'id' ? 'Pengaturan' : 'Settings'}
                      </Link>
                    </div>
                  </div>

                  {/* Phone Number Warning */}
                  {!formData.customerPhone && (
                    <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                      <div className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                            {language === 'id' ? 'Nomor Telepon Belum Diisi' : 'Phone Number Not Set'}
                          </p>
                          <p className="mt-1 text-xs text-orange-700 dark:text-orange-300">
                            {language === 'id' 
                              ? 'Kami membutuhkan nomor telepon untuk menghubungi Anda terkait order. Silakan lengkapi profil Anda terlebih dahulu.'
                              : 'We need your phone number to contact you regarding your order. Please complete your profile first.'}
                          </p>
                          <Link
                            href="/dashboard/settings"
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                          >
                            {language === 'id' ? 'Lengkapi Profil' : 'Complete Profile'}
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

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
                                        {/* Network fee breakdown for BUY orders */}
                                        {networkFeeIDR > 0 && (
                                          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700/50">
                                            <div className="flex justify-between text-sm">
                                              <span className="text-blue-700 dark:text-blue-300">{t('order.cryptoPrice')}:</span>
                                              <span className="text-blue-900 dark:text-blue-100">{formatIDR(parseFloat(formData.amountInput))}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mt-1">
                                              <span className="text-blue-700 dark:text-blue-300">{t('order.networkFee')}:</span>
                                              <span className="text-blue-900 dark:text-blue-100">{formatIDR(networkFeeIDR)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-semibold mt-1 pt-1 border-t border-blue-200 dark:border-blue-700/50">
                                              <span className="text-blue-700 dark:text-blue-300">{t('order.totalPayment')}:</span>
                                              <span className="text-blue-900 dark:text-blue-100">{formatIDR(parseFloat(formData.amountInput) + networkFeeIDR)}</span>
                                            </div>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                              {t('order.networkFeeInfo')}
                                            </p>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                          {formatIDR((calculation as any).totalIDR)}
                                        </p>
                                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                          {t('order.rate')}: {formatIDR(calculation.rate)} per {formData.cryptoSymbol}
                                        </p>
                                        {/* Network fee info for SELL orders - informational only */}
                                        {networkFeeIDR > 0 && (
                                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                            {t('order.networkFee')}: ~{formatIDR(networkFeeIDR)} ({t('order.networkFeeInfo')})
                                          </p>
                                        )}
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
                              
                              {/* Saved wallets dropdown */}
                              {isLoggedIn && savedWallets.length > 0 && (
                                <div className="mb-3">
                                  <select
                                    onChange={(e) => handleSavedWalletSelect(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    defaultValue=""
                                  >
                                    <option value="">
                                      {language === 'id' ? '-- Pilih wallet tersimpan --' : '-- Select saved wallet --'}
                                    </option>
                                    {savedWallets.map((wallet) => (
                                      <option key={wallet.id} value={wallet.id}>
                                        {wallet.label} - {wallet.walletAddress.substring(0, 10)}...{wallet.walletAddress.slice(-6)}
                                      </option>
                                    ))}
                                  </select>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {language === 'id' ? 'Pilih dari daftar wallet tersimpan atau masukkan baru di bawah' : 'Select from saved wallets or enter new below'}
                                  </p>
                                </div>
                              )}
                              
                              {/* Loading saved wallets indicator */}
                              {loadingSavedWallets && (
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                                  {language === 'id' ? 'Memuat wallet tersimpan...' : 'Loading saved wallets...'}
                                </p>
                              )}
                              
                              <input
                                type="text"
                                name="walletAddress"
                                value={formData.walletAddress}
                                onChange={(e) => {
                                  handleChange(e);
                                  // Enable save option when typing new address
                                  if (e.target.value && !savedWallets.some(w => w.walletAddress === e.target.value)) {
                                    // Allow saving new wallet
                                  } else {
                                    setSaveThisWallet(false);
                                    setWalletLabel("");
                                  }
                                }}
                                className={`w-full rounded-lg border ${errors.walletAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 font-mono text-sm`}
                                placeholder={language === 'id' ? 'Paste alamat wallet Anda di sini' : 'Paste your wallet address here'}
                              />
                              {errors.walletAddress && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.walletAddress}</p>
                              )}
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {language === 'id' ? 'Cryptocurrency akan dikirim ke alamat ini' : 'Cryptocurrency will be sent to this address'}
                              </p>
                              
                              {/* Save wallet checkbox (only for logged in users with new address) */}
                              {isLoggedIn && formData.walletAddress && !savedWallets.some(w => w.walletAddress === formData.walletAddress) && (
                                <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={saveThisWallet}
                                      onChange={(e) => setSaveThisWallet(e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-200">
                                      {language === 'id' ? 'Simpan wallet ini untuk transaksi berikutnya' : 'Save this wallet for future transactions'}
                                    </span>
                                  </label>
                                  
                                  {saveThisWallet && (
                                    <div className="mt-2">
                                      <input
                                        type="text"
                                        value={walletLabel}
                                        onChange={(e) => setWalletLabel(e.target.value)}
                                        placeholder={language === 'id' ? 'Label (contoh: Binance, Tokocrypto)' : 'Label (e.g., Binance, Coinbase)'}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                                        maxLength={50}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
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
                                      // For BUY crypto: include network fee in total
                                      const baseIDR = parseFloat(formData.amountInput) || 0;
                                      const totalIDR = baseIDR + networkFeeIDR;
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
                                        ? 'Saldo Anda akan bertambah setelah transaksi diverifikasi'
                                        : 'Your balance will increase after the transaction is verified'}
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
                              
                              {/* Saved emails dropdown */}
                              {isLoggedIn && savedEmails.length > 0 && (
                                <div className="mb-3">
                                  <select
                                    onChange={(e) => handleSavedEmailSelect(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    defaultValue=""
                                  >
                                    <option value="">
                                      {language === 'id' ? '-- Pilih email tersimpan --' : '-- Select saved email --'}
                                    </option>
                                    {savedEmails.map((email) => (
                                      <option key={email.id} value={email.id}>
                                        {email.label} - {email.email}
                                      </option>
                                    ))}
                                  </select>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {language === 'id' ? 'Pilih dari daftar email tersimpan atau masukkan baru di bawah' : 'Select from saved emails or enter new below'}
                                  </p>
                                </div>
                              )}
                              
                              {/* Loading saved emails indicator */}
                              {loadingSavedEmails && (
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                                  {language === 'id' ? 'Memuat email tersimpan...' : 'Loading saved emails...'}
                                </p>
                              )}
                              
                              <input
                                type="email"
                                name={formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail"}
                                value={formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail}
                                onChange={(e) => {
                                  handleChange(e);
                                  // Enable save option when typing new email
                                  const currentEmail = e.target.value;
                                  if (currentEmail && !savedEmails.some(em => em.email === currentEmail)) {
                                    // Allow saving new email
                                  } else {
                                    setSaveThisEmail(false);
                                    setEmailLabel("");
                                  }
                                }}
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
                              
                              {/* Save email checkbox (only for logged in users with new email) */}
                              {isLoggedIn && (formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail) && !savedEmails.some(em => em.email === (formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail)) && (
                                <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={saveThisEmail}
                                      onChange={(e) => setSaveThisEmail(e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-200">
                                      {language === 'id' ? 'Simpan email ini untuk transaksi berikutnya' : 'Save this email for future transactions'}
                                    </span>
                                  </label>
                                  
                                  {saveThisEmail && (
                                    <div className="mt-2">
                                      <input
                                        type="text"
                                        value={emailLabel}
                                        onChange={(e) => setEmailLabel(e.target.value)}
                                        placeholder={language === 'id' ? 'Label (contoh: Utama, Bisnis)' : 'Label (e.g., Main, Business)'}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                                        maxLength={50}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
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
                                {calculation && calculation.valid && 'totalIDR' in calculation && (
                                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                                    {(() => {
                                      // For PayPal/Skrill BUY: use totalIDR from calculation (no network fee)
                                      const totalIDR = calculation.totalIDR || 0;
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
                              
                              {/* Saved emails dropdown */}
                              {isLoggedIn && savedEmails.length > 0 && (
                                <div className="mb-3">
                                  <select
                                    onChange={(e) => handleSavedEmailSelect(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    defaultValue=""
                                  >
                                    <option value="">
                                      {language === 'id' ? '-- Pilih email tersimpan --' : '-- Select saved email --'}
                                    </option>
                                    {savedEmails.map((email) => (
                                      <option key={email.id} value={email.id}>
                                        {email.label} - {email.email}
                                      </option>
                                    ))}
                                  </select>
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {language === 'id' ? 'Pilih dari daftar email tersimpan atau masukkan baru di bawah' : 'Select from saved emails or enter new below'}
                                  </p>
                                </div>
                              )}
                              
                              {/* Loading saved emails indicator */}
                              {loadingSavedEmails && (
                                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                                  {language === 'id' ? 'Memuat email tersimpan...' : 'Loading saved emails...'}
                                </p>
                              )}
                              
                              <input
                                type="email"
                                name={formData.serviceType === "paypal" ? "paypalEmail" : "skrillEmail"}
                                value={formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail}
                                onChange={(e) => {
                                  handleChange(e);
                                  // Enable save option when typing new email
                                  const currentEmail = e.target.value;
                                  if (currentEmail && !savedEmails.some(em => em.email === currentEmail)) {
                                    // Allow saving new email
                                  } else {
                                    setSaveThisEmail(false);
                                    setEmailLabel("");
                                  }
                                }}
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
                              
                              {/* Save email checkbox (only for logged in users with new email) */}
                              {isLoggedIn && (formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail) && !savedEmails.some(em => em.email === (formData.serviceType === "paypal" ? formData.paypalEmail : formData.skrillEmail)) && (
                                <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={saveThisEmail}
                                      onChange={(e) => setSaveThisEmail(e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-200">
                                      {language === 'id' ? 'Simpan email ini untuk transaksi berikutnya' : 'Save this email for future transactions'}
                                    </span>
                                  </label>
                                  
                                  {saveThisEmail && (
                                    <div className="mt-2">
                                      <input
                                        type="text"
                                        value={emailLabel}
                                        onChange={(e) => setEmailLabel(e.target.value)}
                                        placeholder={language === 'id' ? 'Label (contoh: Utama, Bisnis)' : 'Label (e.g., Main, Business)'}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                                        maxLength={50}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
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
                                        ? 'Saldo Anda akan bertambah setelah transaksi diverifikasi'
                                        : 'Your balance will increase after the transaction is verified'}
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
                      disabled={submitting || !calculation || !calculation.valid || !formData.customerPhone}
                      className={`relative w-full rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 ${
                        submitting 
                          ? 'cursor-not-allowed opacity-90' 
                          : !calculation || !calculation.valid || !formData.customerPhone
                          ? 'cursor-not-allowed opacity-50'
                          : ''
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
            </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
