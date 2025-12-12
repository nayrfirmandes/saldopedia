'use client';

import { useLanguage } from '@/contexts/language-context';
import { ElementType, ComponentPropsWithoutRef } from 'react';

interface TranslatedTextProps<T extends ElementType = 'span'> {
  tKey: string;
  as?: T;
}

type Props<T extends ElementType> = TranslatedTextProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof TranslatedTextProps<T>>;

export function T<T extends ElementType = 'span'>({ tKey, as, ...rest }: Props<T>) {
  const { t } = useLanguage();
  const Component = as || 'span';
  return <Component {...rest}>{t(tKey)}</Component>;
}

export function TH1({ tKey, className }: { tKey: string; className?: string }) {
  const { t } = useLanguage();
  return <h1 className={className}>{t(tKey)}</h1>;
}

export function TH2({ tKey, className }: { tKey: string; className?: string }) {
  const { t } = useLanguage();
  return <h2 className={className}>{t(tKey)}</h2>;
}

export function TH3({ tKey, className }: { tKey: string; className?: string }) {
  const { t } = useLanguage();
  return <h3 className={className}>{t(tKey)}</h3>;
}

export function TP({ tKey, className }: { tKey: string; className?: string }) {
  const { t } = useLanguage();
  return <p className={className}>{t(tKey)}</p>;
}
