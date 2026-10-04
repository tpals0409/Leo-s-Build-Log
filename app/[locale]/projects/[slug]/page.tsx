import { notFound } from 'next/navigation';
import PostGrid from '@/components/PostGrid';
import ScreenGallery from '@/components/ScreenGallery';
import { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import Thumb from '@/components/ui/Thumb';
import { listPosts } from '@/lib/db';
import { DICT, type Locale } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';
import { getProject, type ProjectDetail } from '@/lib/projects';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const project = getProject(slug);
  return project ? pageMeta(locale, `/projects/${slug}`, { title: project.name[locale], description: project.summary[locale], ownImage: true }) : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const locale = await localeOf(params);
  const project = getProject(slug);
  if (!project) notFound();
  const t = DICT[locale].projects;
  const posts = await listPosts(locale, { project: slug });
  const d = project.detail;

  return (
    <Container className="pb-20">
      <h1 className="pb-4 pt-12 t-section">{project.name[locale]}</h1>
      <p className="mb-8 t-body text-secondary">{project.summary[locale]}</p>
      {d && (
        <div className="-mt-2 mb-8 flex flex-wrap gap-3">
          {d.links.map((l) => <ButtonLink key={l.href} href={l.href} variant="outline" size="sm">{l.label[locale]}</ButtonLink>)}
        </div>
      )}
      <Thumb src={d?.banner ?? project.image} eager className={`mb-12 rounded-panel ${d ? 'aspect-2/1' : 'aspect-[2.1/1]'}`} />
      {d && <CaseStudy d={d} locale={locale} />}
      <SectionHeader title={t.posts} />
      {posts.length ? <PostGrid posts={posts} locale={locale} /> : <p className="py-12 text-muted">{t.noPosts}</p>}
    </Container>
  );
}

// 케이스 스터디: 소개 페이지와 같은 칸(왼쪽 제목 + 오른쪽 내용). 팀이 한 것(어떻게 풀었나)과 내 몫(내가 맡은 일·운영하며 고친 것)을 칸으로 나눈다.
// 처음 보는 사람이 앱 모습부터 보도록 화면을 배너 바로 아래(맨 위)에. 항목은 쉬운 말이 먼저, 기술 세부(tech)는 그 아래 작게.
function CaseStudy({ d, locale }: { d: ProjectDetail; locale: Locale }) {
  const t = DICT[locale].projects;
  return (
    <div className="mb-16 flex flex-col gap-10">
      {/* 화면만 제목을 위로: 휴대폰 화면 8장이 본문 폭 전체를 쓴다(넓으면 4열, 좁으면 2열). 캡처에 휴대폰 테두리가 있어 상자로 감싸지 않음. 누르면 크게 보고 좌우로 넘김 */}
      <section className="flex flex-col gap-6 border-t border-line pt-8">
        <h2 className="t-tile">{t.screens}</h2>
        <ScreenGallery screens={d.screens.map((s) => ({ src: s.src, video: s.video, label: s.label[locale] }))} locale={locale} />
      </section>
      <Section title={t.overview}>
        <Facts rows={d.facts.map((f) => [f.label[locale], f.value[locale]])} />
      </Section>
      <Section title={t.problem}>
        <p className="t-body text-secondary">{d.problem[locale]}</p>
      </Section>
      <Section title={t.answers}>
        <Numbered items={d.answers} locale={locale} />
      </Section>
      <Section title={t.mine}>
        <p className="mb-6 t-body">{d.mine.intro[locale]}</p>
        <Numbered items={d.mine.items} locale={locale} />
      </Section>
      <Section title={t.fixes}>
        <Numbered items={d.fixes} locale={locale} />
      </Section>
      <Section title={t.stack}>
        <Facts rows={d.stack.map((s) => [s.label[locale], s.value])} />
      </Section>
    </div>
  );
}

// 소개 페이지 연락 칸과 같은 표: 왼쪽 이름(muted) + 오른쪽 값
function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-0.5 t-body sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-y-3">
      {rows.map(([k, v], i) => (
        <div key={k} className="contents">
          <dt className={`text-muted sm:mt-0 ${i ? 'mt-3.5' : ''}`}>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

// 소개 페이지 'AI와 일하는 방식'과 같은 번호 목록 (+ 기술 세부 한 줄)
function Numbered({ items, locale }: { items: ProjectDetail['answers']; locale: Locale }) {
  return (
    <ol className="flex flex-col gap-5">
      {items.map((w, i) => (
        <li key={w.title.en} className="flex gap-4">
          <span className="w-7 shrink-0 pt-1 t-body-sm text-muted">{String(i + 1).padStart(2, '0')}</span>
          <div className="flex flex-col gap-1.5">
            <strong className="t-body">{w.title[locale]}</strong>
            <span className="t-body-sm text-secondary">{w.body[locale]}</span>
            {w.tech && <span className="t-caption text-muted">{w.tech[locale]}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
