export default function LocalBusinessSchema() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Saldopedia",
    "image": "https://saldopedia.com/images/saldopedia-logo.png",
    "url": "https://saldopedia.com",
    "telephone": "+628119666620",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-6.2088",
      "longitude": "106.8456"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "priceRange": "Rp 25.000+",
    "currenciesAccepted": "IDR",
    "paymentAccepted": "Bank Transfer, E-Wallet",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "10000",
      "bestRating": "5",
      "worstRating": "1"
    },
    "sameAs": [
      "https://wa.me/628119666620"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
    />
  );
}
