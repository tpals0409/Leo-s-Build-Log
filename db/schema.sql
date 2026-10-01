create table if not exists posts (
  id serial primary key,
  slug text unique not null,
  title text not null,
  summary text not null default '',
  category text not null,
  thumbnail text,            -- /uploads/xxx.jpg 또는 외부 URL
  html text not null,        -- 완성 HTML 문서
  plain_text text not null,  -- 태그 제거본: 검색 + 추후 챗봇 임베딩용
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
