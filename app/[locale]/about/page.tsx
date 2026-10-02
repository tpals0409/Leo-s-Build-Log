import { ButtonLink } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { DICT } from '@/lib/i18n';
import { localeOf, pageMeta } from '@/lib/page';
import { PROFILE, SITE } from '@/lib/site';

// 요청 시 렌더: SITE_URL(canonical·OG 주소)을 빌드 때가 아니라 실행 환경에서 읽도록
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const locale = await localeOf(params);
  return pageMeta(locale, '/about', { title: DICT[locale].about.title, description: DICT[locale].about.intro });
}

// 칸마다 왼쪽 제목 + 오른쪽 내용(좁으면 위아래). 칸 구분은 가는 선과 여백만.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-8">
      <h2 className="w-[220px] shrink-0 t-tile">{title}</h2>
      <div className="min-w-0 flex-[1_1_480px]">{children}</div>
    </section>
  );
}

// 날짜 + 내용 한 줄 (활동·교육)
function DatedRow({ date, children }: { date: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-wrap gap-x-6 gap-y-1">
      <span className="w-[140px] shrink-0 pt-1 t-body-sm text-muted">{date}</span>
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">{children}</div>
    </li>
  );
}

export default async function AboutPage({ params }: Props) {
  const locale = await localeOf(params);
  const t = DICT[locale].about;
  const email = SITE.contacts.find((c) => c.label === 'Email');
  const github = SITE.contacts.find((c) => c.label === 'GitHub');

  return (
    <Container className="flex flex-col gap-10 pb-24 pt-8 lg:pt-16">
      <section className="flex flex-wrap items-center gap-x-16 gap-y-6">
        <img src="/about/leo.webp" alt={t.characterAlt} className="size-[140px] shrink-0 object-contain lg:size-[240px]" />
        <div className="flex max-w-[760px] flex-[1_1_480px] flex-col gap-5">
          <h1 className="t-section lg:t-display">
            {t.name}
            <span className="t-tile text-secondary">({t.realName})</span>
          </h1>
          <p className="t-body text-secondary">{t.intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            {email && <ButtonLink href={email.href}>{t.emailMe}</ButtonLink>}
            {github && <ButtonLink href={github.href} variant="outline">GitHub</ButtonLink>}
          </div>
        </div>
      </section>

      <Section title={t.work}>
        <ol className="flex flex-col gap-5">
          {t.workItems.map((w, i) => (
            <li key={w.title} className="flex gap-4">
              <span className="w-7 shrink-0 pt-1 t-body-sm text-muted">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex flex-col gap-1.5">
                <strong className="t-body">{w.title}</strong>
                <span className="t-body-sm text-secondary">{w.body}</span>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 기술만 제목을 위로: 세 묶음이 본문 폭 전체를 쓴다. 숙련도는 레오 발바닥 5개(본인 평가). 20px로 작게 그려서, 화면 배율마다 딱 맞는 크기(20·40·60px)를 따로 둔다 — 브라우저가 크게 줄이면 흐려진다 */}
      <section className="flex flex-col gap-6 border-t border-line pt-8">
        <h2 className="t-tile">{t.skills}</h2>
        <div className="grid gap-x-14 gap-y-8 md:grid-cols-3">
          {PROFILE.skills.map((g) => (
            <div key={g.group}>
              <h3 className="mb-5 t-body">{t.skillGroups[g.group]}</h3>
              <ul className="flex flex-col gap-[18px]">
                {g.items.map(([name, level]) => (
                  <li key={name.en} aria-label={t.skillLevel(name[locale], level)} className="flex items-center justify-between gap-4">
                    <span className="t-body">{name[locale]}</span>
                    <span aria-hidden className="flex shrink-0 gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <img key={n} src="/about/paw-20.webp" srcSet="/about/paw-20.webp 1x, /about/paw-40.webp 2x, /about/paw-60.webp 3x" width={20} height={20} alt="" className={`size-5 object-contain ${n > level ? 'opacity-25 grayscale' : ''}`} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Section title={t.activities}>
        <ul className="flex flex-col gap-4">
          {PROFILE.activities.map((a) => (
            <DatedRow key={a.date} date={a.date}>
              <span className="t-body">{a.title[locale]}</span>
              <span className="t-body-sm text-secondary">{a.body[locale]}</span>
            </DatedRow>
          ))}
        </ul>
      </Section>

      <Section title={t.education}>
        <ul className="flex flex-col gap-3.5">
          {PROFILE.education.map((e) => (
            <DatedRow key={e.name.en} date={e.date}>
              <span className="t-body">
                {e.name[locale]}
                {e.note && <span className="t-body-sm text-secondary"> · {e.note[locale]}</span>}
              </span>
            </DatedRow>
          ))}
        </ul>
      </Section>

      <Section title={t.contact}>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-0.5 t-body [overflow-wrap:anywhere] sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-y-3">
          {SITE.contacts.map((c, i) => (
            <div key={c.label} className="contents">
              <dt className={`text-muted sm:mt-0 ${i ? 'mt-3.5' : ''}`}>{c.label}</dt>
              <dd><a href={c.href} className="link-hover text-link underline">{c.text}</a></dd>
            </div>
          ))}
        </dl>
      </Section>
    </Container>
  );
}
