import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Suit from "../../../components/Suit";
import PageShell from "../../../components/PageShell";
import { Reveal } from "../../../components/motion";
import { getPublishedProduct, getPublishedProducts, getSetting } from "../../../lib/content";

// Only the static export build enumerates these; the server build resolves
// slugs at request time.
export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const suit = await getPublishedProduct(slug);
  if (!suit) return { title: "Product not found" };
  const title = suit.articleCode ? `${suit.name} (${suit.articleCode})` : suit.name;
  return {
    title: suit.seoTitle || title,
    description: suit.seoDescription || `${suit.note}. ${suit.description}`,
    keywords: suit.keywords || undefined,
    alternates: { canonical: `/suits/${suit.slug}` },
    openGraph: {
      title: `${title} | SYBOC INDUSTRIES`,
      description: suit.note,
      url: `/suits/${suit.slug}`,
      type: "website",
      images: suit.image ? [{ url: suit.image }] : undefined,
    },
  };
}

export default async function SuitPage({ params }) {
  const { slug } = await params;
  const [suit, allProducts] = await Promise.all([
    getPublishedProduct(slug),
    getPublishedProducts(),
  ]);

  if (!suit) notFound();

  const whatsapp = await getSetting("contact.whatsapp", process.env.NEXT_PUBLIC_WHATSAPP || "");
  const wa = whatsapp.replace(/\D/g, "");
  const inquiryMessage = `Hi SYBOC INDUSTRIES, I'd like trade pricing for ${suit.name} (${suit.articleCode || suit.slug}).`;
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(inquiryMessage)}`
    : null;

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://sybocindustries.example";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: suit.name,
    description: suit.description,
    sku: suit.articleCode || suit.slug,
    image: suit.image ? `${site}${suit.image}` : undefined,
    brand: { "@type": "Brand", name: "SYBOC INDUSTRIES" },
  };

  const related = allProducts
    .filter((p) => p.slug !== suit.slug && (p.subcategory === suit.subcategory || p.category === suit.category))
    .slice(0, 4);

  return (
    <PageShell mainClass="product">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="product-grid">
        <div className="product-art" style={{ "--bg": suit.bg }}>
          <div className="product-stage-showcase">
            {suit.image ? (
              <Image
                src={suit.image}
                alt={`${suit.name} — ${suit.articleCode || ""}`}
                width={640}
                height={640}
                priority
                className="product-detail-img"
              />
            ) : (
              <Suit id={`p-${suit.slug}`} base={suit.base} accent={suit.accent} trim={suit.trim} label={`${suit.name}`} />
            )}
          </div>
        </div>

        <Reveal className="product-copy" variant="right" duration={1}>
          <p className="crumb">
            <Link href="/products" transitionTypes={["nav-back"]}>The collection</Link>
            {suit.category && ` / ${suit.category}`}
            {suit.subcategory && ` / ${suit.subcategory}`}
          </p>
          {suit.articleCode && <span className="product-code-pill">{suit.articleCode}</span>}
          <h1>{suit.name}</h1>
          <p className="price product-price">
            {suit.price != null
              ? `$${suit.price.toLocaleString()}`
              : suit.priceNote || "Wholesale Price on Request"}
          </p>
          <p className="lede">{suit.description}</p>

          <h2>Specifications</h2>
          <Reveal as="ul" className="spec" stagger={0.08} duration={0.7}>
            {suit.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </Reveal>

          <div className="row">
            <Link className="btn" href={`/quote?suit=${suit.slug}`} transitionTypes={["nav-forward"]}>
              Request a quote for this style
            </Link>
            <Link className="btn ghost" href="/products" transitionTypes={["nav-back"]}>
              All products
            </Link>
            {waHref && (
              <a className="btn ghost" href={waHref} target="_blank" rel="noopener noreferrer">
                WhatsApp enquiry
              </a>
            )}
          </div>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="product-related" style={{ marginTop: "6rem", paddingTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <header className="category-head" style={{ marginBottom: "2rem" }}>
            <p className="eyebrow">More in this family</p>
            <h2>Related Styles</h2>
          </header>
          <div className="grid">
            {related.map((r) => (
              <article className="tile" key={r.slug} style={{ "--bg": r.bg, "--fg": r.fg }}>
                <div className="tile-top">
                  {r.articleCode && <span className="tile-code">{r.articleCode}</span>}
                  <h3>
                    <Link href={`/suits/${r.slug}`} transitionTypes={["nav-forward"]}>
                      {r.name}
                    </Link>
                  </h3>
                  <p>{r.note}</p>
                </div>
                <div className="tile-art">
                  {r.image ? (
                    <Image
                      src={r.image}
                      alt={`${r.name} — ${r.articleCode || ""}`}
                      width={320}
                      height={320}
                      className="tile-img"
                      loading="lazy"
                    />
                  ) : (
                    <Suit id={`r-${r.slug}`} base={r.base} accent={r.accent} trim={r.trim} decorative />
                  )}
                </div>
                <div className="tile-footer">
                  <p className="price">Wholesale Quote</p>
                  <Link className="tile-cta" href={`/suits/${r.slug}`}>
                    View Style ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
