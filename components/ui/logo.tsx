import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: 'default' | 'lg';
}

export default function Logo({ size = 'default' }: LogoProps) {
  const imageSize = size === 'lg' ? 32 : 28;
  const textClass = size === 'lg' 
    ? 'text-xl font-bold text-gray-900 dark:text-white ml-[3px] translate-y-0.5'
    : 'text-lg font-bold text-gray-900 dark:text-white ml-[2px] translate-y-0.5';

  return (
    <Link href="/" className="inline-flex items-center" aria-label="Saldopedia">
      {/* Light mode logo */}
      <Image 
        src="/images/saldopedia-logo.webp" 
        alt="" 
        width={imageSize} 
        height={imageSize}
        className="dark:hidden"
        priority
      />
      {/* Dark mode logo (inverted) */}
      <Image 
        src="/images/saldopedia-logo.webp" 
        alt="" 
        width={imageSize} 
        height={imageSize}
        className="hidden dark:block invert brightness-0 contrast-200"
        priority
      />
      <span className={textClass}>
        Saldopedia
      </span>
    </Link>
  );
}
