import { DICT, type Locale } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import Container from './ui/Container';

export default function Footer({ locale }: { locale: Locale }) {
  const contacts = SITE.contacts.filter((c) => c.href);
  return (
    <footer className="mt-20 border-t border-line bg-fog">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-8 t-body-sm text-muted">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <nav aria-label={DICT[locale].footer.contact} className="flex gap-6">
          {contacts.map((c) => <a key={c.label} href={c.href} className="hover:text-link">{c.label}</a>)}
        </nav>
      </Container>
    </footer>
  );
}
