export default function Quote({ text, cite }: { text: string; cite?: string }) {
  return (
    <section className="pb-20 pt-16 text-center">
      <blockquote className="text-2xl/8 text-secondary">“ {text} ”</blockquote>
      {cite && <cite className="mt-3 block text-sm not-italic text-muted">— {cite}</cite>}
    </section>
  );
}
