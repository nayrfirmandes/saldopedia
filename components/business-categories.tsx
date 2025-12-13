"use client";

import { useState, memo, useMemo } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useLanguage } from "@/contexts/language-context";
import { LayoutGrid, Bitcoin, CreditCard, Wallet } from "lucide-react";
import PriceCard from "./market/price-card";
import { useMarketData } from "./market/use-market-data";
import { CRYPTO_ASSETS, PAYPAL_ASSET, SKRILL_ASSET, MarketAsset } from "./market/types";
import { PAYPAL_SKRILL_RATES } from "@/lib/rates";

type TabKey = 'all' | 'crypto' | 'paypal' | 'skrill';

const TABS: { key: TabKey; icon: typeof LayoutGrid }[] = [
  { key: 'all', icon: LayoutGrid },
  { key: 'crypto', icon: Bitcoin },
  { key: 'paypal', icon: CreditCard },
  { key: 'skrill', icon: Wallet },
];

function BusinessCategories() {
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const { data: marketData, loading } = useMarketData();

  const paypalRate = PAYPAL_SKRILL_RATES.convert[1]?.rate || 14000;
  const skrillRate = PAYPAL_SKRILL_RATES.convert[1]?.rate || 14000;

  const getAssetsByTab = useMemo(() => {
    return (tabKey: TabKey): MarketAsset[] => {
      switch (tabKey) {
        case 'crypto':
          return CRYPTO_ASSETS;
        case 'paypal':
          return [{ ...PAYPAL_ASSET, price: paypalRate }];
        case 'skrill':
          return [{ ...SKRILL_ASSET, price: skrillRate }];
        case 'all':
        default:
          return [
            ...CRYPTO_ASSETS.slice(0, 6),
            { ...PAYPAL_ASSET, price: paypalRate },
            { ...SKRILL_ASSET, price: skrillRate },
          ];
      }
    };
  }, [paypalRate, skrillRate]);

  const getTabLabel = (key: TabKey): string => {
    switch (key) {
      case 'all': return t('business.all');
      case 'crypto': return t('business.crypto.title');
      case 'paypal': return t('business.paypal.title');
      case 'skrill': return t('business.skrill.title');
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('business.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t('business.crypto.description')}
          </p>
        </div>

        <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
          <div className="flex justify-center mb-6">
            <TabList className="inline-flex flex-wrap justify-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
              {TABS.map(({ key, icon: Icon }, index) => (
                <Tab
                  key={key}
                  className={({ selected }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors outline-none ${
                      selected
                        ? 'bg-white dark:bg-blue-500 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{getTabLabel(key)}</span>
                </Tab>
              ))}
            </TabList>
          </div>

          <TabPanels>
            {TABS.map(({ key }) => (
              <TabPanel key={key} className="outline-none">
                <div className={`grid gap-3 ${
                  key === 'paypal' || key === 'skrill'
                    ? 'grid-cols-1 max-w-sm mx-auto'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}>
                  {getAssetsByTab(key).map((asset) => {
                    const priceData = marketData?.[asset.id];
                    const price = asset.price ?? priceData?.idr;
                    const change = asset.category === 'crypto' ? priceData?.idr_24h_change : undefined;
                    
                    return (
                      <PriceCard
                        key={asset.id}
                        asset={asset}
                        price={price}
                        change24h={change}
                        loading={loading && asset.category === 'crypto'}
                      />
                    );
                  })}
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </section>
  );
}

export default memo(BusinessCategories);
