import type { Locale } from './i18n';

// 프로젝트는 코드로 관리한다 (자주 안 바뀜). 글은 posts.project에 이 slug로 연결된다.
// TODO(김세민): 소개 문구와 이미지 채우기 — 지금은 자리표시
export type Project = { slug: string; name: Record<Locale, string>; image: string | null; summary: Record<Locale, string> };

const TBD = { ko: '프로젝트 소개를 준비하고 있습니다.', en: 'Project details coming soon.' };

export const PROJECTS: Project[] = [
  { slug: 'algosu', name: { ko: '알고수', en: 'AlgoSu' }, image: null, summary: TBD },
  { slug: 'finch', name: { ko: 'FINCH', en: 'FINCH' }, image: null, summary: TBD },
  { slug: 'janus', name: { ko: 'Janus', en: 'Janus' }, image: null, summary: TBD },
  { slug: 'pinlog', name: { ko: '핀로그', en: 'PinLog' }, image: null, summary: TBD },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
