export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Saldopedia",
    "url": "https://saldopedia.com",
    "logo": "https://saldopedia.com/images/saldopedia-logo.png",
    "description": "Platform jual beli cryptocurrency eceran, PayPal, dan Skrill mulai 25ribu rupiah. Transaksi mudah via WhatsApp atau form order online. Cepat, aman, terpercaya.",
    "areaServed": "Indonesia",
    "currenciesAccepted": "IDR",
    "priceRange": "Rp 25.000+",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "availableLanguage": ["Indonesian", "English"],
      "email": "support@saldopedia.com",
      "url": "https://saldopedia.com/support"
    },
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
      "name": "Layanan Jual Beli",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Cryptocurrency Buy & Sell",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Jual Beli Bitcoin (BTC)",
                "description": "Transaksi Bitcoin cepat via WhatsApp, mulai 25 ribu"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Jual Beli USDT (Tether)",
                "description": "Transaksi USDT cepat via WhatsApp, mulai 25 ribu"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Jual Beli Ethereum (ETH)",
                "description": "Transaksi Ethereum cepat via WhatsApp, mulai 25 ribu"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "PayPal Buy & Sell",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Jual Beli Saldo PayPal",
                "description": "Transaksi PayPal mulai $20 dengan rate kompetitif"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Skrill Buy & Sell",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Jual Beli Saldo Skrill",
                "description": "Transaksi Skrill mulai $20 dengan rate kompetitif"
              }
            }
          ]
        }
      ]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Saldopedia",
    "url": "https://saldopedia.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://saldopedia.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
