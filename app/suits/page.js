import Link from "next/link";
import Image from "next/image";
import Suit from "../../components/Suit";
import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";
import { getPublishedProducts } from "../../lib/content";

export const metadata = {
  title: "Products Catalogue",
  description:
    "The official SYBOC INDUSTRIES wholesale catalogue: 70+ products across Leather Wear, Motorcycle Wear and Western Wear.",
  alternates: { canonical: "/products" },
  openGraph: { title: "The SYBOC Collection | Product Catalogue", description: "Leather, motorcycle and western wear catalogue.", url: "/products" },
};

const sections = [
  { id: "leather-jacket", title: "Leather Jackets", category: "Leather Wear", subcategory: "Leather Jacket" },
  { id: "leather-racing-jacket", title: "Leather Racing Jackets", category: "Motorcycle Wear", subcategory: "Leather Racing Jacket" },
  { id: "summer-racing-jacket", title: "Summer Racing Jackets", category: "Motorcycle Wear", subcategory: "Summer Racing Jacket" },
  { id: "racing-hoodie", title: "Racing Hoodies", category: "Motorcycle Wear", subcategory: "Racing Hoodie" },
  { id: "leather-pants", title: "Leather Pants", category: "Leather Wear", subcategory: "Leather Pants" },
  { id: "leather-skirts", title: "Leather Skirts", category: "Leather Wear", subcategory: "Leather Skirts" },
  { id: "leather-vest", title: "Leather Vests", category: "Leather Wear", subcategory: "Leather Vest" },
  { id: "western-wear", title: "Western Wear", category: "Western Wear" },
];

export default async function SuitsPage() {
  const suits = await getPublishedProducts();

  return (
    <PageShell mainClass="page">
      <header className="page-head">
        <SplitLines as="h1">Product Catalogue</SplitLines>
        <p>Explore our complete wholesale range ({suits.length} articles) across Leather Wear, Motorcycle Wear and Western Wear. All styles available for custom branding and OEM production.</p>
      </header>

      <nav className="products-categories" aria-label="Product categories">
        <span>Collections</span>
        {sections.map((sec) => {
          const count = suits.filter((s) => s.subcategory === sec.subcategory || (!sec.subcategory && s.category === sec.category)).length;
          if (count === 0) return null;
          return (
            <a href={`#${sec.id}`} key={sec.id}>
              {sec.title} ({count})
            </a>
          );
        })}
      </nav>

      {sections.map((sec, index) => {
        const sectionItems = suits.filter(
          (s) => s.subcategory === sec.subcategory || (!sec.subcategory && s.category === sec.category)
        );
        if (sectionItems.length === 0) return null;

        return (
          <section className="product-category" id={sec.id} key={sec.id}>
            <header className="category-head">
              <p className="eyebrow">SYBOC / {String(index + 1).padStart(2, "0")} &bull; {sec.category}</p>
              <h2>
                {sec.title} <span className="products-count">({sectionItems.length} styles)</span>
              </h2>
            </header>
            <Reveal className="grid" stagger={0.06} duration={0.8}>
              {sectionItems.map((s) => (
                <article className="tile" key={s.slug} style={{ "--bg": s.bg, "--fg": s.fg }}>
                  <div className="tile-top">
                    {s.articleCode && <span className="tile-code">{s.articleCode}</span>}
                    <h3>
                      <Link href={`/suits/${s.slug}`} transitionTypes={["nav-forward"]}>
                        {s.name}
                      </Link>
                    </h3>
                    <p>{s.note}</p>
                  </div>
                  <div className="tile-art">
                    {s.image ? (
                      <Image
                        src={s.image}
                        alt={`${s.name} — ${s.articleCode || ""}`}
                        width={360}
                        height={360}
                        className="tile-img"
                        loading="lazy"
                      />
                    ) : (
                      <Suit id={`t-${s.slug}`} base={s.base} accent={s.accent} trim={s.trim} decorative />
                    )}
                  </div>
                  <div className="tile-footer">
                    <p className="price">Wholesale Quote</p>
                    <Link className="tile-cta" href={`/quote?suit=${s.slug}`}>
                      Enquire ↗
                    </Link>
                  </div>
                </article>
              ))}
            </Reveal>
          </section>
        );
      })}

      <Reveal className="band-cta" variant="up">
        <h2>Need Custom Specifications or Volume Pricing?</h2>
        <Link className="btn" href="/quote" transitionTypes={["nav-forward"]}>
          Request a Quote
        </Link>
      </Reveal>
    </PageShell>
  );
}
