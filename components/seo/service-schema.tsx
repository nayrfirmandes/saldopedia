interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  provider?: string;
  areaServed?: string;
  priceRange?: string;
  serviceType?: string;
}

export default function ServiceSchema({
  name,
  description,
  url,
  provider = "Saldopedia",
  areaServed = "Indonesia",
  priceRange = "Rp 25.000+",
  serviceType = "FinancialService"
}: ServiceSchemaProps) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceType,
    "name": name,
    "description": description,
    "url": url,
    "provider": {
      "@type": "Organization",
      "name": provider,
      "url": "https://saldopedia.com",
      "logo": "https://saldopedia.com/images/saldopedia-logo.png"
    },
    "areaServed": {
      "@type": "Country",
      "name": areaServed
    },
    "priceRange": priceRange,
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "IDR"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
    />
  );
}
