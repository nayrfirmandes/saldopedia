'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/language-context";
import { 
  calculatePayPalSkrill, 
  calculateCryptoFromIDR, 
  calculateCryptoFromCoin,
  type DynamicRatesConfig 
} from "@/lib/calculator";
import { SYMBOL_TO_ID, SUPPORTED_CRYPTOS } from "@/lib/rates";
import { formatIDR, formatCrypto } from "@/lib/formatters";

interface CommandVariant {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
  line6: string;
}

const COMMAND_VARIANTS: CommandVariant[] = [
  {
    line1: "/beli USDT 50ribu",
    line2: "Proses pesanan...",
    line3: "Dapat 2.94 USDT",
    line4: "Rate: Rp 16.999/USDT",
    line5: "Saldo dipotong Rp 50.000",
    line6: "Transaksi berhasil!"
  },
  {
    line1: "/jual SOL 1",
    line2: "Proses pesanan...",
    line3: "Dapat Rp 2.850.000",
    line4: "Rate: Rp 2.850.000/SOL",
    line5: "Saldo bertambah Rp 2.850.000",
    line6: "Transaksi berhasil!"
  },
  {
    line1: "/beli BTC 500ribu",
    line2: "Proses pesanan...",
    line3: "Dapat 0.00032 BTC",
    line4: "Rate: Rp 1,57 Milyar/BTC",
    line5: "Saldo dipotong Rp 500.000",
    line6: "Transaksi berhasil!"
  },
  {
    line1: "/jual PayPal $50",
    line2: "Proses pesanan...",
    line3: "Dapat Rp 700.000",
    line4: "Rate: Rp 14.000/USD",
    line5: "Saldo bertambah Rp 700.000",
    line6: "Transaksi berhasil!"
  }
];

const CRYPTO_SYMBOLS = Object.values(SUPPORTED_CRYPTOS).map(c => c.symbol);
const WALLET_SERVICES = ['PAYPAL', 'SKRILL'];
const ALL_ASSETS = [...CRYPTO_SYMBOLS, ...WALLET_SERVICES];

interface ParsedCommand {
  action: 'beli' | 'jual';
  asset: string;
  amount: number;
  isCrypto: boolean;
  isUSD: boolean;
}

function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim().toLowerCase();
  
  const match = trimmed.match(/^\/(beli|jual)\s+(\w+)\s+(.+)$/i);
  if (!match) return null;
  
  const [, action, assetRaw, amountRaw] = match;
  const asset = assetRaw.toUpperCase();
  
  if (!ALL_ASSETS.includes(asset)) return null;
  
  const isCrypto = CRYPTO_SYMBOLS.includes(asset);
  const isWallet = WALLET_SERVICES.includes(asset);
  
  let amount = 0;
  let isUSD = false;
  const amountStr = amountRaw.toLowerCase().replace(/[,\.]/g, '');
  
  if (amountStr.startsWith('$')) {
    isUSD = true;
    amount = parseFloat(amountStr.replace('$', ''));
  } else if (amountStr.includes('ribu')) {
    amount = parseFloat(amountStr.replace('ribu', '').replace('k', '')) * 1000;
  } else if (amountStr.includes('juta') || amountStr.includes('jt')) {
    amount = parseFloat(amountStr.replace(/juta|jt/g, '').trim()) * 1000000;
  } else if (amountStr.endsWith('k')) {
    amount = parseFloat(amountStr.replace('k', '')) * 1000;
  } else if (amountStr.endsWith('m')) {
    amount = parseFloat(amountStr.replace('m', '')) * 1000000;
  } else {
    amount = parseFloat(amountStr);
  }
  
  if (isNaN(amount) || amount <= 0) return null;
  
  if (isWallet && !isUSD) {
    isUSD = true;
  }
  
  return {
    action: action as 'beli' | 'jual',
    asset,
    amount,
    isCrypto,
    isUSD
  };
}

interface SimulationResult {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
  line6: string;
  error?: boolean;
}

export default function FeaturesHome() {
  const { t, language } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);
  const [isInputMode, setIsInputMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [cryptoPrices, setCryptoPrices] = useState<{ [key: string]: { idr: number } } | null>(null);
  const [dynamicRates, setDynamicRates] = useState<DynamicRatesConfig | null>(null);
  const [typingIndex, setTypingIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const [pricesRes, ratesRes] = await Promise.all([
          fetch("/api/crypto-rates"),
          fetch("/api/rates")
        ]);
        
        if (pricesRes.ok) {
          const pricesData = await pricesRes.json();
          setCryptoPrices(pricesData);
        }
        
        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          setDynamicRates(ratesData);
        }
      } catch (error) {
        console.error("Failed to fetch rates:", error);
      }
    };
    
    fetchRates();
  }, []);

  useEffect(() => {
    if (!isInputMode && !simulationResult) {
      intervalRef.current = setInterval(() => {
        setVariantIndex((prev) => (prev + 1) % COMMAND_VARIANTS.length);
      }, 15000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isInputMode, simulationResult]);

  useEffect(() => {
    if (simulationResult && typingIndex < 6) {
      const timer = setTimeout(() => {
        setTypingIndex(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [simulationResult, typingIndex]);

  const handleBoxClick = useCallback(() => {
    if (isProcessing) return;
    
    if (simulationResult) {
      setSimulationResult(null);
      setTypingIndex(0);
      return;
    }
    
    setIsInputMode(true);
    setIsActive(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isProcessing, simulationResult]);

  const handleBlur = useCallback(() => {
    if (!inputValue.trim()) {
      setIsInputMode(false);
      setIsActive(false);
    }
  }, [inputValue]);

  const runSimulation = useCallback(async (command: ParsedCommand) => {
    setIsProcessing(true);
    setTypingIndex(0);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { action, asset, amount, isCrypto, isUSD } = command;
    const mode = action === 'beli' ? 'topup' : 'convert';
    
    let result: SimulationResult;
    
    try {
      if (isCrypto) {
        const coinId = SYMBOL_TO_ID[asset];
        let marketPrice = cryptoPrices?.[coinId]?.idr || 0;
        
        // Fallback estimated prices if API not loaded yet
        if (!marketPrice) {
          const fallbackPrices: { [key: string]: number } = {
            BTC: 1600000000,
            ETH: 55000000,
            SOL: 3000000,
            BNB: 10000000,
            XRP: 35000,
            DOGE: 5500,
            ADA: 15000,
            TRX: 4000,
            TON: 85000,
            MATIC: 8000,
            USDT: 16500,
            USDC: 16500,
            TKO: 5000,
            SHIB: 0.35,
            BABYDOGE: 0.000035,
            CAKE: 35000,
            FLOKI: 2.5,
            DOGS: 10,
            NOTCOIN: 100
          };
          marketPrice = fallbackPrices[asset] || 100000;
        }
        
        if (action === 'beli') {
          const amountIDR = isUSD ? amount * 16000 : amount;
          const calc = calculateCryptoFromIDR(asset, amountIDR, marketPrice, mode, dynamicRates || undefined);
          
          if (!calc.valid) {
            result = {
              line1: inputValue,
              line2: "Proses pesanan...",
              line3: calc.error || "Transaksi tidak valid",
              line4: "",
              line5: "",
              line6: "",
              error: true
            };
          } else {
            result = {
              line1: inputValue,
              line2: "Proses pesanan...",
              line3: `Dapat ${formatCrypto(calc.cryptoAmount, asset)} ${asset}`,
              line4: `Rate: ${formatIDR(calc.rate)}/${asset}`,
              line5: `Saldo dipotong ${formatIDR(amountIDR)}`,
              line6: "Transaksi berhasil!"
            };
          }
        } else {
          const calc = calculateCryptoFromCoin(asset, amount, marketPrice, mode, dynamicRates || undefined);
          
          if (!calc.valid) {
            result = {
              line1: inputValue,
              line2: "Proses pesanan...",
              line3: calc.error || "Transaksi tidak valid",
              line4: "",
              line5: "",
              line6: "",
              error: true
            };
          } else {
            result = {
              line1: inputValue,
              line2: "Proses pesanan...",
              line3: `Dapat ${formatIDR(calc.totalIDR)}`,
              line4: `Rate: ${formatIDR(calc.rate)}/${asset}`,
              line5: `Saldo bertambah ${formatIDR(calc.totalIDR)}`,
              line6: "Transaksi berhasil!"
            };
          }
        }
      } else {
        const calc = calculatePayPalSkrill(amount, mode, asset.toLowerCase() as 'paypal' | 'skrill', dynamicRates || undefined);
        
        if (!calc.valid) {
          result = {
            line1: inputValue,
            line2: "Proses pesanan...",
            line3: calc.error || "Transaksi tidak valid",
            line4: "",
            line5: "",
            line6: "",
            error: true
          };
        } else if (action === 'beli') {
          result = {
            line1: inputValue,
            line2: "Proses pesanan...",
            line3: `Dapat $${amount} ${asset}`,
            line4: `Rate: ${formatIDR(calc.rate)}/USD`,
            line5: `Saldo dipotong ${formatIDR(calc.totalIDR)}`,
            line6: "Transaksi berhasil!"
          };
        } else {
          result = {
            line1: inputValue,
            line2: "Proses pesanan...",
            line3: `Dapat ${formatIDR(calc.totalIDR)}`,
            line4: `Rate: ${formatIDR(calc.rate)}/USD`,
            line5: `Saldo bertambah ${formatIDR(calc.totalIDR)}`,
            line6: "Transaksi berhasil!"
          };
        }
      }
    } catch (error) {
      result = {
        line1: inputValue,
        line2: "Proses pesanan...",
        line3: "Terjadi kesalahan",
        line4: "Coba lagi",
        line5: "",
        line6: "",
        error: true
      };
    }
    
    setSimulationResult(result);
    setIsInputMode(false);
    setInputValue('');
    setIsProcessing(false);
  }, [inputValue, cryptoPrices, dynamicRates]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const parsed = parseCommand(inputValue);
      
      if (!parsed) {
        setSimulationResult({
          line1: inputValue,
          line2: "Format tidak valid",
          line3: "Contoh: /beli BTC 100ribu",
          line4: "atau: /jual PayPal $50",
          line5: "",
          line6: "",
          error: true
        });
        setIsInputMode(false);
        setInputValue('');
        setTypingIndex(0);
        return;
      }
      
      runSimulation(parsed);
    } else if (e.key === 'Escape') {
      setIsInputMode(false);
      setInputValue('');
      setIsActive(false);
    }
  }, [inputValue, runSimulation]);

  const currentVariant = COMMAND_VARIANTS[variantIndex];
  const displayContent = simulationResult || currentVariant;

  const placeholderText = language === 'id' 
    ? 'Ketik perintah, misal: /beli BTC 100ribu' 
    : 'Type command, e.g.: /beli BTC 100ribu';

  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="mx-auto max-w-3xl pb-16 text-center md:pb-20">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              {t('featuresHome.title')}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {t('featuresHome.subtitle')}
            </p>
          </div>
          <div
            className="group relative mx-auto mb-32 flex w-full max-w-[500px] justify-center md:mb-36"
            onClick={() => {
              if (!isInputMode && !isProcessing) {
                setSimulationResult(null);
                setTypingIndex(0);
              }
            }}
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleBoxClick();
              }}
              className={`aspect-video w-full rounded-2xl bg-gray-900 dark:bg-gray-800 px-5 py-3 shadow-xl dark:shadow-gray-800/50 dark:border dark:border-gray-700 transition-all duration-300 cursor-pointer ${isActive || isInputMode || simulationResult ? 'rotate-0' : '-rotate-1 hover:rotate-0'}`}
            >
              <div className="relative mb-8 flex items-center justify-between before:block before:h-[9px] before:w-[41px] before:bg-[length:16px_9px] before:[background-image:radial-gradient(circle_at_4.5px_4.5px,var(--color-gray-600)_4.5px,transparent_0)] after:w-[41px]">
                <span className="text-sm font-medium text-white">
                  Saldopedia.com
                </span>
              </div>
              
              {isInputMode ? (
                <div className="font-mono text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-200 mr-1">&gt;</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleBlur}
                      placeholder={placeholderText}
                      className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 outline-none border-none ring-0 focus:outline-none focus:border-none focus:ring-0 caret-gray-400"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <div className="mt-6 text-gray-500 space-y-1">
                    <p>/beli BTC 500ribu</p>
                    <p>/jual SOL 1</p>
                    <p>/beli PayPal $50</p>
                  </div>
                </div>
              ) : (
                <div className={`font-mono text-sm text-gray-500 will-change-[filter] transition duration-500 ${!simulationResult && !isActive ? 'blur-xs group-hover:blur-none' : 'blur-none'}`} key={simulationResult ? 'result' : variantIndex}>
                  <span className={`${simulationResult ? (typingIndex >= 1 ? 'opacity-100' : 'opacity-0') : 'animate-[code-1_10s_infinite] opacity-0'} text-gray-200 transition-opacity duration-300`}>
                    {displayContent.line1}
                  </span>{" "}
                  <span className={`${simulationResult ? (typingIndex >= 2 ? 'opacity-100' : 'opacity-0') : 'animate-[code-2_10s_infinite] opacity-0'} transition-opacity duration-300`}>
                    {displayContent.line2}
                  </span>
                  <br />
                  <span className={`${simulationResult ? (typingIndex >= 3 ? 'opacity-100' : 'opacity-0') : 'animate-[code-3_10s_infinite] opacity-0'} transition-opacity duration-300 ${simulationResult?.error ? 'text-red-400' : ''}`}>
                    {displayContent.line3}
                  </span>{" "}
                  <span className={`${simulationResult ? (typingIndex >= 4 ? 'opacity-100' : 'opacity-0') : 'animate-[code-4_10s_infinite] opacity-0'} transition-opacity duration-300`}>
                    {displayContent.line4}
                  </span>
                  <br />
                  <br />
                  <span className={`${simulationResult ? (typingIndex >= 5 ? 'opacity-100' : 'opacity-0') : 'animate-[code-5_10s_infinite] opacity-0'} text-gray-200 transition-opacity duration-300`}>
                    {displayContent.line5}
                  </span>
                  <br />
                  <span className={`${simulationResult ? (typingIndex >= 6 ? 'opacity-100' : 'opacity-0') : 'animate-[code-6_10s_infinite] opacity-0'} transition-opacity duration-300`}>
                    {displayContent.line6}
                  </span>
                </div>
              )}
              
            </div>
          </div>
          <div className="grid overflow-hidden border-y [border-image:linear-gradient(to_right,transparent,var(--color-slate-200),transparent)1] lg:grid-cols-3 *:relative *:p-6 *:before:absolute *:before:bg-linear-to-b *:before:from-transparent *:before:via-gray-200 *:before:[block-size:100%] *:before:[inline-size:1px] *:before:[inset-block-start:0] *:before:[inset-inline-start:-1px] md:*:px-10 md:*:py-12">
            <article>
              <h3 className="mb-1.5 flex items-center space-x-2 font-medium">
                <svg
                  className="fill-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                >
                  <path d="m15.447 6.605-.673-.336a6.973 6.973 0 0 0-.761-1.834l.238-.715a.999.999 0 0 0-.242-1.023l-.707-.707a.995.995 0 0 0-1.023-.242l-.715.238a6.96 6.96 0 0 0-1.834-.761L9.394.552A1 1 0 0 0 8.5-.001h-1c-.379 0-.725.214-.895.553l-.336.673a6.973 6.973 0 0 0-1.834.761l-.715-.238a.997.997 0 0 0-1.023.242l-.707.707a1.001 1.001 0 0 0-.242 1.023l.238.715a6.959 6.959 0 0 0-.761 1.834l-.673.336a1 1 0 0 0-.553.895v1c0 .379.214.725.553.895l.673.336c.167.653.425 1.268.761 1.834l-.238.715a.999.999 0 0 0 .242 1.023l.707.707a.997.997 0 0 0 1.023.242l.715-.238a6.959 6.959 0 0 0 1.834.761l.336.673a1 1 0 0 0 .895.553h1c.379 0 .725-.214.895-.553l.336-.673a6.973 6.973 0 0 0 1.834-.761l.715.238a1.001 1.001 0 0 0 1.023-.242l.707-.707c.268-.268.361-.664.242-1.023l-.238-.715a6.959 6.959 0 0 0 .761-1.834l.673-.336A1 1 0 0 0 16 8.5v-1c0-.379-.214-.725-.553-.895ZM8 13a5 5 0 1 1 .001-10.001 5 5 0 0 1 0 10.001Z" />
                </svg>
                <span>{t('featuresHome.feature2.title')}</span>
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {t('featuresHome.feature2.description')}
              </p>
            </article>
            <article>
              <h3 className="mb-1.5 flex items-center space-x-2 font-medium">
                <svg
                  className="fill-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={12}
                >
                  <path d="M2 0a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H2Zm0 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7Zm1-3a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H3Z" />
                </svg>
                <span>{t('featuresHome.feature3.title')}</span>
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {t('featuresHome.feature3.description')}
              </p>
            </article>
            <article>
              <h3 className="mb-1.5 flex items-center space-x-2 font-medium">
                <svg
                  className="fill-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                >
                  <path d="M14.75 2.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm0 13.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM2.5 14.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM1.25 2.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM4 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm4-6a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z" />
                </svg>
                <span>{t('featuresHome.feature4.title')}</span>
              </h3>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {t('featuresHome.feature4.description')}
              </p>
            </article>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-b from-transparent to-gray-100 dark:to-gray-800 pointer-events-none -z-10" aria-hidden="true" />
    </section>
  );
}
