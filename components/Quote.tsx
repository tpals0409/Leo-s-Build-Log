export default function Quote({ text, cite }: { text: string; cite?: string }) {
  return (
    <section className="pb-20 pt-16 text-center">
      <blockquote className="t-title2 text-secondary">“ {text} ”</blockquote>
      {cite && <cite className="mt-3 block t-body-sm not-italic text-muted">— {cite}</cite>}
    </section>
  );
}
