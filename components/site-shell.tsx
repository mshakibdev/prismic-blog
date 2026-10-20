import Link from "next/link";
import { getSettings } from "@/lib/blog";
import { site } from "@/lib/site";

export function HeaderFrame({ name = site.name }: { name?: string }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label={`${name} home`}>
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {name}
          <span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/blog" className="nav-link">
            The journal <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export async function Header() {
  const settings = await getSettings();
  return <HeaderFrame name={settings?.data.site_name || site.name} />;
}

export function FooterFrame({
  text = "A little perspective goes a long way.",
}: {
  text?: string;
}) {
  return (
    <footer className="site-footer">
      <span>{text}</span>
      <Link href="/blog">
        Explore the journal <span aria-hidden="true">↗</span>
      </Link>
    </footer>
  );
}

export async function Footer() {
  const settings = await getSettings();
  return <FooterFrame text={settings?.data.footer_text || undefined} />;
}
