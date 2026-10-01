import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { Locale } from './i18n';
import { SITE } from './site';

// 링크 미리보기(OG) 이미지 1200×630. 이미지 렌더러(Satori)는 CSS 변수·webp를 못 읽어서
// 색은 app/globals.css 토큰 값을 그대로 옮겨 적고, 로고는 png를 쓴다. 토큰을 바꾸면 여기도 맞출 것.
const C = { fg: '#1d1d1f', muted: '#6e6e73', surface: '#ffffff', line: '#e5e5ea' };
export const OG_SIZE = { width: 1200, height: 630 };

const pub = (f: string) => readFile(path.join(process.cwd(), 'public', f));

async function assets() {
  const [medium, bold, logo] = await Promise.all([
    pub('fonts/GmarketSansTTFMedium.ttf'),
    pub('fonts/GmarketSansTTFBold.ttf'),
    pub('logo.png'),
  ]);
  return {
    logo: `data:image/png;base64,${logo.toString('base64')}`,
    fonts: [
      { name: 'Gmarket Sans', data: medium, weight: 500 as const },
      { name: 'Gmarket Sans', data: bold, weight: 700 as const },
    ],
  };
}

// title 없으면 사이트 기본 카드(로고 + 블로그 이름), 있으면 글 카드(라벨 + 제목 + 하단 로고·이름)
export async function renderOg({ locale, title, label }: { locale: Locale; title?: string; label?: string }) {
  const { logo, fonts } = await assets();
  const name = SITE.name[locale];

  const body = title ? (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 80 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {label && <div style={{ fontSize: 26, fontWeight: 500, color: C.muted, letterSpacing: 1 }}>{label.toUpperCase()}</div>}
        <div style={{ fontSize: title.length > 40 ? 56 : 68, fontWeight: 700, color: C.fg, lineHeight: 1.25, letterSpacing: -1, wordBreak: 'keep-all' }}>{title}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: `2px solid ${C.line}`, paddingTop: 32 }}>
        <img src={logo} width={64} height={64} />
        <div style={{ fontSize: 30, fontWeight: 500, color: C.fg }}>{name}</div>
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: 24 }}>
      <img src={logo} width={300} height={300} />
      <div style={{ fontSize: 72, fontWeight: 700, color: C.fg, letterSpacing: -1 }}>{name}</div>
    </div>
  );

  return new ImageResponse(<div style={{ display: 'flex', width: '100%', height: '100%', background: C.surface, fontFamily: 'Gmarket Sans' }}>{body}</div>, { ...OG_SIZE, fonts });
}
