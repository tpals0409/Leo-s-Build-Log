// 칸마다 왼쪽 제목 + 오른쪽 내용(좁으면 위아래). 칸 구분은 가는 선과 여백만. (소개·프로젝트 페이지)
export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-8">
      <h2 className="w-[220px] shrink-0 t-tile">{title}</h2>
      <div className="min-w-0 flex-[1_1_480px]">{children}</div>
    </section>
  );
}
