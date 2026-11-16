import Nav from "./Nav";
import Footer from "./Footer";
import Slide from "./Slide";
import { SocialIcon } from "./SocialIcon";
import { getSettings, getNavigation, getPublishedProducts, parseJson } from "../lib/content";
import WhatsAppFloat from "./WhatsAppFloat";

// Shared page frame: view-transition wrapper + nav + main landmark + footer.
// mainClass varies per route ("page", "product", or none for the home hero).
// Navigation, products and contact/site settings come from local frontend data.
export default async function PageShell({ mainClass, children, showAnnouncement = false }) {
  const [settings, header, footer, products] = await Promise.all([
    getSettings(),
    getNavigation("HEADER"),
    getNavigation("FOOTER"),
    getPublishedProducts(),
  ]);
  const collectionLinks = [
    { slug: "leather-jacket", name: "Leather Jackets", href: "/products#leather-jacket" },
    { slug: "leather-racing-jacket", name: "Leather Racing Jackets", href: "/products#leather-racing-jacket" },
    { slug: "summer-racing-jacket", name: "Summer Racing Jackets", href: "/products#summer-racing-jacket" },
    { slug: "racing-hoodie", name: "Racing Hoodies", href: "/products#racing-hoodie" },
    { slug: "leather-pants", name: "Leather Pants", href: "/products#leather-pants" },
    { slug: "leather-skirts", name: "Leather Skirts", href: "/products#leather-skirts" },
    { slug: "leather-vest", name: "Leather Vests", href: "/products#leather-vest" },
    { slug: "western-wear", name: "Western Wear", href: "/products#western-wear" },
  ];
  const email = settings["contact.email"] || "sybocindustry@gmail.com";
  const phone = settings["contact.phone"] || "+92 328 816 6661";
  const phoneHref = `tel:${String(phone).replace(/[^\d+]/g, "")}`;
  const whatsapp = String(settings["contact.whatsapp"] || "").replace(/\D/g, "");
  const announcementSocials = [
    ["instagram", settings["social.instagram"]],
    ["facebook", settings["social.facebook"]],
    ["whatsapp", whatsapp ? `https://wa.me/${whatsapp}` : ""],
  ].filter(([, href]) => href);

  return (
    <Slide>
      <a className="skip" href="#main-content">
        Skip to content
      </a>
      <main id="main-content" tabIndex={-1} className={mainClass} data-announcement={showAnnouncement ? "true" : "false"}>
        {showAnnouncement && (
          <div className="announcement-bar" role="region" aria-label="Trade Contact & Socials">
            <div className="announcement-contact">
              <a href={phoneHref} className="announcement-link" title="Call SYBOC Trade Desk">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5l2.5.6.7 4.1-2 1.5a11.8 11.8 0 0 0 6.5 6.5l1.5-2 4.1.7.6 2.5a2.3 2.3 0 0 1-2.4 2.9A16.6 16.6 0 0 1 3.7 5.9a2.3 2.3 0 0 1 2.9-2.4Z" /></svg>
                <span>{phone}</span>
              </a>
              <span className="announcement-divider" aria-hidden="true" />
              <a href={`mailto:${email}`} className="announcement-link" title="Email SYBOC Trade Desk">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.2" /><path d="m4 7 8 6 8-6" /></svg>
                <span>{email}</span>
              </a>
            </div>
            <div className="announcement-socials" aria-label="Social media links">
              {announcementSocials.map(([name, href]) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Follow SYBOC on ${name}`} title={`SYBOC on ${name}`}>
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          </div>
        )}
        <Nav items={header} products={collectionLinks} email={settings["contact.email"]} />
        {children}
        <Footer
          siteName={settings["site.name"] || "SYBOC INDUSTRIES"}
          links={footer}
          products={collectionLinks}
          brandText={settings["footer.brandText"]}
          tagline={settings["footer.tagline"]}
          email={settings["contact.email"]}
          hours={parseJson(settings["contact.hours"], [])}
          whatsapp={settings["contact.whatsapp"] || process.env.NEXT_PUBLIC_WHATSAPP || ""}
          socials={{
            instagram: settings["social.instagram"],
            facebook: settings["social.facebook"],
            linkedin: settings["social.linkedin"],
            pinterest: settings["social.pinterest"],
            tiktok: settings["social.tiktok"],
          }}
        />
        <WhatsAppFloat whatsapp={settings["contact.whatsapp"] || process.env.NEXT_PUBLIC_WHATSAPP || ""} />
      </main>
    </Slide>
  );
}
