import '../globals.css';

export const metadata = { title: 'Admin', robots: { index: false } };

// 관리자는 언어 구분 없음 → [locale] 밖의 별도 root layout
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
