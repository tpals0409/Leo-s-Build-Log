export const LOCALES = ['ko', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

export const CATEGORIES = ['ai-agent', 'engineering', 'retrospective'] as const;
export type Category = (typeof CATEGORIES)[number];

// 화면 문구. 라이브러리 없이 이 사전 하나로 처리한다.
export const DICT = {
  ko: {
    nav: { posts: '글', projects: '프로젝트', about: '소개' },
    category: { 'ai-agent': 'AI 에이전트', engineering: '엔지니어링', retrospective: '회고' },
    search: { placeholder: '블로그 검색', title: (q: string) => `‘${q}’ 검색 결과`, empty: '결과가 없습니다.' },
    home: { featured: 'Featured', read: '글 읽기', latest: '최신 글', projects: '프로젝트', all: '모두 보기', empty: '아직 글이 없습니다.' },
    posts: { title: '글', all: '전체', empty: '글이 없습니다.' },
    projects: { title: '프로젝트', posts: '관련 글', noPosts: '아직 관련 글이 없습니다.' },
    about: { title: '소개', placeholder: '소개를 준비하고 있습니다.', contact: '연락' },
    switchTo: 'English',
  },
  en: {
    nav: { posts: 'Posts', projects: 'Projects', about: 'About' },
    category: { 'ai-agent': 'AI Agents', engineering: 'Engineering', retrospective: 'Retrospective' },
    search: { placeholder: 'Search', title: (q: string) => `Results for “${q}”`, empty: 'No results.' },
    home: { featured: 'Featured', read: 'Read', latest: 'Latest posts', projects: 'Projects', all: 'View all', empty: 'No posts yet.' },
    posts: { title: 'Posts', all: 'All', empty: 'No posts.' },
    projects: { title: 'Projects', posts: 'Related posts', noPosts: 'No related posts yet.' },
    about: { title: 'About', placeholder: 'Coming soon.', contact: 'Contact' },
    switchTo: '한국어',
  },
} satisfies Record<Locale, unknown>;

export const fmtDate = (d: Date, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'long' }).format(d);

