import Link from "next/link";
import { notFound } from "next/navigation";
import Suit from "../../../components/Suit";
import PageShell from "../../../components/PageShell";
import { Reveal, Parallax } from "../../../components/motion";
import { getPublishedProduct, getSetting } from "../../../lib/content";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const suit = await getPublishedProduct(slug);
  if (!suit) return { title: "Suit not found" };
  return {
    title: suit.seoTitle || suit.name,
    description: suit.seoDescription || `${suit.note}. ${suit.description}`,
    keywords: suit.keywords || undefined,
    alternates: { canonical: `/suits/${suit.slug}` },
    openGraph: { title: suit.name, description: suit.note, url: `/suits/${suit.slug}`, type: "website" },
  };
}

export default async function SuitPage({ params }) {
  const { slug } = await params;
  const suit = await getPublishedProduct(slug);
  if (!suit) notFound();

  const whatsapp = await getSetting("contact.whatsapp", process.env.NEXT_PUBLIC_WHATSAPP || "");
  const wa = whatsapp.replace(/\D/g, "");
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Hi First Moto, I'd like trade pricing for the ${suit.name}.`)}`
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: suit.name,
    description: suit.description,
    sku: suit.slug,
    brand: { "@type": "Brand", name: "First Moto" },
  };

  return (
    <PageShell mainClass="product">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <div className="product-grid">
          <div className="product-art" style={{ "--bg": suit.bg }}>
            <Parallax className="product-par" amount={70}>
              <Suit id={`p-${suit.slug}`} base={suit.base} accent={suit.accent} trim={suit.trim} label={`${suit.name} racing suit`} />
            </Parallax>
          </div>

          <Reveal className="product-copy" variant="right" duration={1}>
            <p className="crumb">
              <Link href="/suits" transitionTypes={["nav-back"]}>The 2026 line</Link> / {suit.name}
            </p>
            <h1>{suit.name}</h1>
            <p className="price product-price">
              {suit.price != null
                ? `R ${suit.price.toLocaleString("en-ZA")}`
                : suit.priceNote || "Price on request"}
            </p>
            <p className="lede">{suit.description}</p>

            <h2>Details</h2>
            <Reveal as="ul" className="spec" stagger={0.1} duration={0.7}>
              {suit.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </Reveal>

            <div className="row">
              <Link className="btn" href={`/quote?suit=${suit.slug}`} transitionTypes={["nav-forward"]}>Request a quote for this suit</Link>
              <Link className="btn ghost" href="/suits" transitionTypes={["nav-back"]}>All suits</Link>
              {waHref && (
                <a className="btn ghost" href={waHref} target="_blank" rel="noopener noreferrer">
                  WhatsApp us
                </a>
              )}
            </div>
          </Reveal>
        </div>
    </PageShell>
  );
}
