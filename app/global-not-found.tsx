import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { DICT } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import './globals.css';

// 모든 404 (없는 글·프로젝트, 없는 주소). 이 앱은 root layout이 [locale] 아래·admin 두 개라
// 일반 not-found.js가 동작하지 않아서 Next의 global-not-found(실험 기능, next.config)를 쓴다.
// 레이아웃을 거치지 않고 주소의 언어도 모르므로 한/영을 함께 보여준다.
export const metadata: Metadata = { title: `404 — ${SITE.name.ko}`, robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="ko">
      <body>
        <main className="mx-auto flex min-h-dvh max-w-wrap flex-col items-center justify-center px-6 text-center">
          <img src="/logo.webp" alt="" width={96} height={96} className="mb-6 size-24" />
          <p className="t-caption text-label">404</p>
          <h1 className="mt-3 t-section">{DICT.ko.notFound.title}</h1>
          <p className="mt-1 t-tile text-secondary">{DICT.en.notFound.title}</p>
          <p className="mb-9 mt-4 t-body text-muted">{DICT.ko.notFound.body}<br />{DICT.en.notFound.body}</p>
          <div className="flex gap-3">
            <ButtonLink href="/ko">{DICT.ko.notFound.home} →</ButtonLink>
            <ButtonLink href="/en" variant="outline">{DICT.en.notFound.home} →</ButtonLink>
          </div>
        </main>
      </body>
    </html>
  );
}
