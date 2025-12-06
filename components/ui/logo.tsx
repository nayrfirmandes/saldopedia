import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-0.8" aria-label="Saldopedia">
      {/* Light mode logo */}
      <Image 
        src="/images/saldopedia-logo.webp" 
        alt="Saldopedia Logo" 
        width={32} 
        height={32}
        className="rounded dark:hidden"
        priority
      />
      {/* Dark mode logo (inverted) */}
      <Image 
        src="/images/saldopedia-logo.webp" 
        alt="Saldopedia Logo" 
        width={32} 
        height={32}
        className="rounded hidden dark:block invert brightness-0 contrast-200"
        priority
      />
      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Saldopedia
      </span>
    </Link>
  );
}
