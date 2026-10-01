'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DICT, type Locale } from '@/lib/i18n';

// 같은 페이지의 다른 언어판으로. 자동 이동은 하지 않는다 (AGENTS.md).
export default function LocaleSwitch({ locale }: { locale: Locale }) {
  const other: Locale = locale === 'ko' ? 'en' : 'ko';
  const path = usePathname().replace(/^\/(ko|en)(?=\/|$)/, `/${other}`);
  return <Link href={path} hrefLang={other} className="t-body-sm">{DICT[locale].switchTo}</Link>;
}
