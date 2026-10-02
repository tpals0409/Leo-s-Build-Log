'use client';
import { ButtonLink } from './ui/Button';
import { usePathname } from 'next/navigation';
import { DICT, type Locale } from '@/lib/i18n';

// 같은 페이지의 다른 언어판으로. 자동 이동은 하지 않는다 (AGENTS.md).
// 메뉴 글자와 구분되게 작은 테두리 버튼(DESIGN.md 버튼 sm).
export default function LocaleSwitch({ locale }: { locale: Locale }) {
  const other: Locale = locale === 'ko' ? 'en' : 'ko';
  const path = usePathname().replace(/^\/(ko|en)(?=\/|$)/, `/${other}`);
  return <ButtonLink href={path} hrefLang={other} variant="outline" size="sm" className="tap">{DICT[locale].switchTo}</ButtonLink>;
}
