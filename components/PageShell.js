import Nav from "./Nav";
import Footer from "./Footer";
import Slide from "./Slide";
import { getSettings, getNavigation, getPublishedProducts, parseJson } from "../lib/content";

// Shared page frame: view-transition wrapper + nav + main landmark + footer.
// mainClass varies per route ("page", "product", or none for the home hero).
// Navigation, products and contact/site settings come from the CMS.
export default async function PageShell({ mainClass, children }) {
  const [settings, header, footer, products] = await Promise.all([
    getSettings(),
    getNavigation("HEADER"),
    getNavigation("FOOTER"),
    getPublishedProducts(),
  ]);
  const links = products.map((p) => ({ slug: p.slug, name: p.name }));

  return (
    <Slide>
      <a className="skip" href="#main-content">
        Skip to content
      </a>
      <main id="main-content" tabIndex={-1} className={mainClass}>
        <Nav items={header} products={links} email={settings["contact.email"]} />
        {children}
        <Footer
          siteName={settings["site.name"] || "First Moto"}
          links={footer}
          products={links}
          brandText={settings["footer.brandText"]}
          tagline={settings["footer.tagline"]}
          email={settings["contact.email"]}
          hours={parseJson(settings["contact.hours"], [])}
          whatsapp={settings["contact.whatsapp"] || process.env.NEXT_PUBLIC_WHATSAPP || ""}
        />
      </main>
    </Slide>
  );
}
