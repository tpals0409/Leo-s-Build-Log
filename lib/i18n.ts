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
    chat: {
      open: '레오에 대해 물어보기', close: '대화 닫기', title: '레오에 대해 물어보기', sub: '블로그 글과 프로젝트를 바탕으로 답해요',
      greeting: '안녕하세요. 레오의 글과 프로젝트에 대해 궁금한 걸 물어보세요.',
      suggestions: ['어떤 프로젝트를 했어?', 'AI 에이전트로 어떻게 일해?', '핀치에서 맡은 일은?'],
      placeholder: '질문을 입력하세요', send: '보내기', thinking: '글을 찾아보는 중…', sources: '참고한 글',
      rateLimited: '질문이 너무 많아요. 잠시 뒤에 다시 물어봐 주세요.', unavailable: '지금은 답할 수 없어요. 준비 중이에요.', failed: '답을 받지 못했어요. 다시 시도해 주세요.',
    },
    search: { placeholder: '블로그 검색', title: (q: string) => `‘${q}’ 검색 결과`, empty: '결과가 없습니다.' },
    home: { featured: 'Featured', slide: (n: number) => `대표 글 ${n}`, prev: '이전 대표 글', next: '다음 대표 글', latest: '최신 글', projects: '프로젝트', all: '모두 보기', empty: '아직 글이 없습니다.' },
    posts: { title: '글', all: '전체', empty: '글이 없습니다.', prev: '이전 글', next: '다음 글', first: '가장 처음 글이에요', latest: '가장 최신 글이에요', nav: '이전 글과 다음 글', toc: '목차', view: '보기 방식', grid: '그리드로 보기', list: '목록으로 보기', pages: '페이지', prevPage: '이전 페이지', nextPage: '다음 페이지', page: (n: number) => `${n}페이지` },
    projects: { title: '프로젝트', posts: '관련 글', noPosts: '아직 관련 글이 없습니다.', overview: '개요', problem: '풀고 싶었던 문제', answers: '해결 방법', mine: '담당 업무', fixes: '개선 기록', screens: '화면', architecture: '아키텍처', scenario: '사용자 시나리오', tech: '기술 사용 이유', techName: '기술', techProblem: '문제', techRole: '역할', zoom: (l: string) => `${l} 크게 보기`, close: '닫기', prevScreen: '이전 화면', nextScreen: '다음 화면' },
    about: {
      title: '소개',
      name: '레오',
      realName: '김세민',
      intro: '서비스의 데이터가 끊기지 않도록 비동기 처리 흐름을 설계하고, 로그와 지표로 운영 상태를 확인해 구조를 개선해 왔습니다. AI Native 개발 경험과 배포·운영 경험을 서비스 개발 전반으로 넓혀 가고 있습니다.',
      emailMe: '이메일 보내기',
      characterAlt: '블로그 캐릭터 레오',
      work: 'AI와 일하는 방식',
      workItems: [
        { title: '구현과 검토에 AI Agent를 씁니다', body: '역할을 나눈 에이전트에게 범위를 정한 맥락을 주고, 일을 나눠 맡깁니다.' },
        { title: '테스트·로그·근거 확인과 최종 판단은 제가 합니다', body: '무엇을 만들지, 결과를 받아들일지는 사람이 정합니다.' },
        { title: '생성 속도보다 검증 가능한 변경을 우선합니다', body: '빨리 만든 코드보다, 다시 확인할 수 있는 변경을 남깁니다.' },
      ],
      skills: '기술',
      skillGroups: { ai: 'AI 활용', backend: '풀스택', ops: '운영·관측' },
      skillLevel: (name: string, n: number) => `${name}, 숙련도 5단계 중 ${n}`,
      activities: '활동',
      education: '교육·자격',
      contact: '연락',
    },
    notFound: { title: '페이지를 찾을 수 없어요', body: '주소가 바뀌었거나 없는 페이지예요.', home: '홈으로' },
    switchTo: 'English',
  },
  en: {
    nav: { posts: 'Posts', projects: 'Projects', about: 'About' },
    category: { 'ai-agent': 'AI Agents', engineering: 'Engineering', retrospective: 'Retrospective' },
    chat: {
      open: 'Ask about Leo', close: 'Close chat', title: 'Ask about Leo', sub: 'Answers come from the posts and projects on this blog',
      greeting: "Hi. Ask anything about Leo's posts and projects.",
      suggestions: ['What projects has he built?', 'How does he work with AI agents?', 'What did he do on FINCH?'],
      placeholder: 'Ask a question', send: 'Send', thinking: 'Looking through the posts…', sources: 'Sources',
      rateLimited: 'Too many questions. Please try again in a moment.', unavailable: "I can't answer yet. This is still being set up.", failed: "Couldn't get an answer. Please try again.",
    },
    search: { placeholder: 'Search', title: (q: string) => `Results for “${q}”`, empty: 'No results.' },
    home: { featured: 'Featured', slide: (n: number) => `Featured post ${n}`, prev: 'Previous featured post', next: 'Next featured post', latest: 'Latest posts', projects: 'Projects', all: 'View all', empty: 'No posts yet.' },
    posts: { title: 'Posts', all: 'All', empty: 'No posts.', prev: 'Previous post', next: 'Next post', first: 'This is the first post', latest: 'This is the latest post', nav: 'Previous and next posts', toc: 'Table of contents', view: 'View', grid: 'Grid view', list: 'List view', pages: 'Pages', prevPage: 'Previous page', nextPage: 'Next page', page: (n: number) => `Page ${n}` },
    projects: { title: 'Projects', posts: 'Related posts', noPosts: 'No related posts yet.', overview: 'Overview', problem: 'The problem', answers: 'The approach', mine: 'My work', fixes: 'Improvements', screens: 'Screens', architecture: 'Architecture', scenario: 'User scenario', tech: 'Why these tools', techName: 'Tool', techProblem: 'Problem', techRole: 'Role', zoom: (l: string) => `View ${l} larger`, close: 'Close', prevScreen: 'Previous screen', nextScreen: 'Next screen' },
    about: {
      title: 'About',
      name: 'Leo',
      realName: 'Semin Kim',
      intro: 'I design asynchronous processing so a service’s data never gets lost along the way, and I improve the structure by checking how it runs through logs and metrics. I’m extending my AI-native development and deployment and operations experience across service development as a whole.',
      emailMe: 'Email me',
      characterAlt: 'Leo, the blog’s character',
      work: 'How I work with AI',
      workItems: [
        { title: 'AI agents do the implementation and review', body: 'I split the work among agents with distinct roles and give each one only the context its scope needs.' },
        { title: 'I check the tests, logs, and evidence, and make the final call', body: 'A person decides what to build and whether to accept the result.' },
        { title: 'Verifiable changes come before generation speed', body: 'I’d rather leave a change that can be checked again than code that was simply fast to write.' },
      ],
      skills: 'Skills',
      skillGroups: { ai: 'AI', backend: 'Full-stack', ops: 'Operations & observability' },
      skillLevel: (name: string, n: number) => `${name}, level ${n} of 5`,
      activities: 'Activities',
      education: 'Education & certifications',
      contact: 'Contact',
    },
    notFound: { title: 'Page not found', body: 'This page has moved or doesn’t exist.', home: 'Go home' },
    switchTo: '한국어',
  },
} satisfies Record<Locale, unknown>;

// 날짜는 작성자 기준(서울)으로 찍는다 — 서버 시간대(컨테이너는 UTC)를 따르면 자정 KST 글이 전날로 보인다
export const BLOG_TZ = 'Asia/Seoul';
export const fmtDate = (d: Date, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'long', timeZone: BLOG_TZ }).format(d);
export const ymd = (d: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: BLOG_TZ }).format(d); // 2023-07-15

