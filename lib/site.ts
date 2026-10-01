// 소개·연락 정보. TODO(김세민): 채우기 — 비어 있는 항목은 화면에 안 나온다.
export const SITE = {
  name: 'Blog',
  contacts: [
    { label: 'GitHub', href: 'https://github.com/tpals0409' },
    { label: 'Email', href: '' },
  ],
};

export const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
