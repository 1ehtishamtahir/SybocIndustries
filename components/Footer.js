import Link from "next/link";
import Image from "next/image";

// Footer chrome: links, suit list and contact details all come from the CMS
// (PageShell passes them down). WhatsApp accepts a CMS value or the env var.
export default function Footer({
  siteName = "First Moto",
  links = [],
  products = [],
  brandText = "",
  tagline = "",
  email = "",
  hours = [],
  whatsapp = "",
}) {
  const wa = String(whatsapp || "").replace(/\D/g, "");
  const waHref = wa ? `https://wa.me/${wa}` : null;

  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <Image src="/logo.png" alt="First Moto" width={927} height={545} className="footer-logo" />
          <p>{brandText}</p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          {links.map((link) => (
            <Link key={`${link.href}-${link.label}`} href={link.href} transitionTypes={["nav-forward"]}>
              {link.label}
            </Link>
          ))}
        </nav>
        <nav className="footer-suits" aria-label="Suits">
          {products.map((s) => (
            <Link key={s.slug} href={`/suits/${s.slug}`} transitionTypes={["nav-forward"]}>
              {s.name}
            </Link>
          ))}
        </nav>
        <div className="footer-contact">
          <a className="footer-mail" href={`mailto:${email}`}>
            {email}
          </a>
          {waHref && (
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              WhatsApp the trade desk
            </a>
          )}
          {hours.map((h) => (
            <p key={h}>{h}</p>
          ))}
        </div>
      </div>
      <div className="footer-legal">
        <span>
          © {new Date().getFullYear()} {siteName}. {tagline}
        </span>
        <Link href="/privacy" transitionTypes={["nav-forward"]}>
          Privacy
        </Link>
      </div>
    </footer>
  );
}
