import Link from "next/link";
import Image from "next/image";
import { SocialIcon } from "./SocialIcon";

// Footer chrome receives local catalogue and contact data from PageShell.
export default function Footer({
  siteName = "SYBOC INDUSTRIES",
  links = [],
  products = [],
  brandText = "",
  tagline = "",
  email = "",
  hours = [],
  whatsapp = "",
  socials = {},
}) {
  const wa = String(whatsapp || "").replace(/\D/g, "");
  const waHref = wa ? `https://wa.me/${wa}` : null;

  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <Image src="/syboc-logo.png" alt="SYBOC INDUSTRIES" width={1004} height={392} className="footer-logo" />
          <p className="footer-kicker">TRADE / APPAREL / 01</p>
          <p>{brandText}</p>
          <Link className="footer-brand-link" href="/company-profile" transitionTypes={["nav-forward"]}>Company profile ↗</Link>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <p className="footer-heading">Explore</p>
          {links.map((link) => (
            <Link key={`${link.href}-${link.label}`} href={link.href} transitionTypes={["nav-forward"]}>
              {link.label}
            </Link>
          ))}
        </nav>
        <nav className="footer-suits" aria-label="Collection">
          <p className="footer-heading">Collections</p>
          {products.map((s) => (
            <Link key={s.slug} href={s.href || `/suits/${s.slug}`} transitionTypes={["nav-forward"]}>
              {s.name}
            </Link>
          ))}
        </nav>
        <div className="footer-contact">
          <p className="footer-heading">Contact us</p>
          <p className="footer-contact-row"><span className="contact-icon" aria-hidden="true">⌖</span><span>Paki Kotli Daska Rd,<br />Sialkot, Pakistan</span></p>
          <a className="footer-contact-row footer-phone" href="tel:+923288166661"><span className="contact-icon" aria-hidden="true">☎</span><span>+92 328 816 6661</span></a>
          <a className="footer-contact-row footer-mail" href="mailto:sybocindustry@gmail.com"><span className="contact-icon" aria-hidden="true">✉</span><span>sybocindustry@gmail.com</span></a>
          <a className="footer-contact-row footer-website" href="https://www.sybocindustry.com" target="_blank" rel="noopener noreferrer"><span className="contact-icon" aria-hidden="true">◎</span><span>www.sybocindustry.com</span></a>
          {Object.entries(socials).some(([, href]) => href) && (
            <div className="footer-socials" aria-label="Social media links">
              {Object.entries(socials).filter(([, href]) => href).map(([name, href]) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}>
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="footer-legal">
        <span>
          © {new Date().getFullYear()} {siteName}. {tagline}
        </span>
        <span className="footer-credit">Designed &amp; developed by <strong>INFATE STUDIOS</strong></span>
        <span className="footer-legal-links">
          <Link href="/privacy" transitionTypes={["nav-forward"]}>Privacy Policy</Link>
          <Link href="/terms" transitionTypes={["nav-forward"]}>Terms and Conditions</Link>
        </span>
      </div>
    </footer>
  );
}

