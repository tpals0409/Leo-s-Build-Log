'use client';
import { usePathname } from 'next/navigation';
import Arrow from '@/components/ui/Arrow';
import { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { DICT, isLocale } from '@/lib/i18n';

// 언어 안에서 notFound() (없는 글·프로젝트, 없는 언어). 경로에 맞는 route가 아예 없으면 app/global-not-found.tsx.
// not-found는 params를 못 받아서 주소에서 언어를 읽는다. 서버 HTML은 빈 셸(404)이고 브라우저가 이걸 그린다(Next 동작).
export default function NotFound() {
  const seg = usePathname().split('/')[1] ?? '';
  const locale = isLocale(seg) ? seg : 'ko';
  const t = DICT[locale].notFound;
  return (
    <Container className="py-30 text-center">
      <p className="t-label text-label">404</p>
      <h1 className="mb-4 mt-3 t-title1 font-bold">{t.title}</h1>
      <p className="mb-9 t-body text-muted">{t.body}</p>
      <ButtonLink href={`/${locale}`}>{t.home} <Arrow /></ButtonLink>
    </Container>
  );
}
