import type { Locale } from './i18n';

// 소개·연락 정보. TODO(김세민): 연락처 채우기 — 비어 있는 항목은 화면에 안 나온다.
export const SITE = {
  name: { ko: '레오의 빌드로그', en: 'Leo’s Build Log' } satisfies Record<Locale, string>,
  contacts: [
    { label: 'GitHub', href: 'https://github.com/tpals0409' },
    { label: 'Email', href: '' },
  ],
};

export const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
