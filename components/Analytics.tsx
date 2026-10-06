import Script from 'next/script';
import { SITE_URL } from '@/lib/site';

// 방문 통계: 자체 호스팅 Umami(쿠키 없음 → 동의 배너 불필요). 서버 env가 있을 때만 스크립트를 넣는다(로컬·미설정이면 아무것도 안 함).
// data-domains로 운영 도메인에서만 센다. 페이지 이동(클라이언트 라우팅)은 Umami 스크립트가 알아서 센다. 관리자(/admin)는 레이아웃이 달라 세지 않는다.
// 챗봇 이벤트(횟수만, 질문 내용 없음)는 ChatWidget의 track().
export default function Analytics() {
  const src = process.env.UMAMI_SCRIPT_URL;
  const id = process.env.UMAMI_WEBSITE_ID;
  if (!src || !id) return null;
  return <Script src={src} data-website-id={id} data-domains={new URL(SITE_URL).hostname} strategy="afterInteractive" />;
}
