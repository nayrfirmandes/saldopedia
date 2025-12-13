export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Saldopedia",
    "alternateName": "Saldopedia Indonesia",
    "url": "https://saldopedia.com",
    "logo": "https://saldopedia.com/images/saldopedia-logo.png",
    "image": "https://saldopedia.com/images/saldopedia-logo.png",
    "description": "Platform jual beli cryptocurrency eceran, PayPal, dan Skrill terpercaya di Indonesia. Transaksi mulai Rp 25.000, proses 5-15 menit, rate real-time 24/7.",
    "slogan": "Jual Beli Crypto, PayPal & Skrill Mulai 25 Ribu",
    "foundingDate": "2020",
    "areaServed": {
      "@type": "Country",
      "name": "Indonesia"
    },
    "serviceArea": {
      "@type": "Country",
      "name": "Indonesia"
    },
    "currenciesAccepted": "IDR",
    "priceRange": "Rp 25.000 - Rp 100.000.000",
    "paymentAccepted": ["Bank Transfer", "BCA", "Mandiri", "BRI", "BNI", "GoPay", "OVO", "DANA", "ShopeePay"],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "Customer Support",
        "telephone": "+628119666620",
        "availableLanguage": ["Indonesian", "English"],
        "email": "support@saldopedia.com",
        "url": "https://saldopedia.com/support",
        "areaServed": "ID"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "10000",
      "bestRating": "5",
      "worstRating": "1"
    },
    "sameAs": [
      "https://wa.me/628119666620"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Layanan Jual Beli Digital",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Cryptocurrency Exchange",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Jual Beli Bitcoin (BTC)",
                "description": "Transaksi Bitcoin eceran mulai Rp 25.000, proses 5-15 menit"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Jual Beli USDT (Tether)",
                "description": "Transaksi USDT dengan rate stabil, proses cepat 5-15 menit"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Jual Beli Ethereum (ETH)",
                "description": "Transaksi Ethereum eceran dengan rate real-time dari CoinGecko"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "PayPal Exchange",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Jual Beli Saldo PayPal",
                "description": "Convert PayPal ke Rupiah dengan rate terbaik, proses 5-15 menit"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Skrill Exchange",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Jual Beli Saldo Skrill",
                "description": "Convert Skrill ke Rupiah dengan rate kompetitif, transfer ke semua bank"
              }
            }
          ]
        }
      ]
    },
    "knowsAbout": [
      "Cryptocurrency",
      "Bitcoin",
      "Ethereum",
      "USDT",
      "PayPal",
      "Skrill",
      "Digital Currency Exchange",
      "E-Wallet"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Saldopedia",
    "alternateName": "Saldopedia - Jual Beli Crypto, PayPal & Skrill",
    "url": "https://saldopedia.com",
    "inLanguage": ["id-ID", "en"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://saldopedia.com/cryptocurrencies?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Saldopedia - Jual Beli Cryptocurrency, PayPal & Skrill",
    "description": "Platform jual beli cryptocurrency eceran, PayPal, dan Skrill mulai Rp 25.000. Transaksi mudah, cepat 5-15 menit, dan aman.",
    "url": "https://saldopedia.com",
    "inLanguage": "id-ID",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Saldopedia",
      "url": "https://saldopedia.com"
    },
    "about": {
      "@type": "Thing",
      "name": "Cryptocurrency Exchange Indonesia"
    },
    "mentions": [
      { "@type": "Thing", "name": "Bitcoin" },
      { "@type": "Thing", "name": "Ethereum" },
      { "@type": "Thing", "name": "USDT" },
      { "@type": "Thing", "name": "PayPal" },
      { "@type": "Thing", "name": "Skrill" }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Beranda",
        "item": "https://saldopedia.com"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
