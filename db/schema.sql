-- 마이그레이션 도구 없음: 앱 첫 쿼리 때 실행된다. 구조를 바꾸면 DB를 비우고 다시 만든다 (README).
create table if not exists posts (
  id serial primary key,
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),  -- 영문, 한/영 공유
  category text not null check (category in ('ai-agent', 'engineering', 'retrospective')),
  project text,                              -- lib/projects.ts의 slug, 없으면 null
  tags text[] not null default '{}',
  thumbnail text,                            -- /uploads/xxx.jpg 또는 외부 URL
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 글마다 ko, en 두 행이 반드시 있다 (API가 강제)
create table if not exists post_translations (
  post_id int not null references posts(id) on delete cascade,
  locale text not null check (locale in ('ko', 'en')),
  title text not null,
  summary text not null default '',
  html text not null,                        -- 완성 HTML 문서
  plain_text text not null,                  -- 태그 제거본: 검색 + 추후 챗봇 임베딩용
  primary key (post_id, locale)
);
