import Link from "next/link";
import Image from "next/image";
import Suit from "../components/Suit";
import HeroSlider from "../components/HeroSlider";
import HeroProductStage from "../components/HeroProductStage";
import CustomerReviewsWall from "../components/CustomerReviewsWall";
import PageShell from "../components/PageShell";
import QuoteForm from "../components/QuoteForm";
import { ScrollBar, HScroll, Drift } from "../components/Scroll";
import { Reveal, SplitLines } from "../components/motion";
import { reasons, faqs } from "../data/content";
import { heroSlides } from "../data/heroSlides.js";
import { getSettings, getPublishedProducts } from "../lib/content";

export default async function Home() {
  const [settings, products] = await Promise.all([getSettings(), getPublishedProducts()]);
  // Keep the public hero tied to the current local asset manifest so stale
  // persisted settings cannot replace the images uploaded to /public.
  const slides = heroSlides;

  return (
    <PageShell showAnnouncement>
      <ScrollBar />

        <HeroSlider slides={slides} />

        <HeroProductStage product={products.find((product) => product.slug === "si-lrj-01" || product.legacySlug === "leather-racing-jacket") || products[0]} />

        <section className="manufacturer-ribbon" aria-label="Wholesale leather garments manufacturer">
          <div className="manufacturer-ribbon-track">
            <span>WHOLESALE LEATHER GARMENTS MANUFACTURER</span>
            <b>•</b>
            <em>Custom leather wear</em>
            <b>•</b>
            <em>Motorcycle apparel</em>
            <b>•</b>
            <em>Made for retailers and independent brands</em>
            <span aria-hidden="true">WHOLESALE LEATHER GARMENTS MANUFACTURER</span>
            <b aria-hidden="true">•</b>
            <em aria-hidden="true">Custom leather wear</em>
            <b aria-hidden="true">•</b>
            <em aria-hidden="true">Motorcycle apparel</em>
            <b aria-hidden="true">•</b>
            <em aria-hidden="true">Made for retailers and independent brands</em>
          </div>
        </section>

        <section className="home-video" aria-labelledby="home-video-title">
          <div className="home-video-placeholder">
            <div className="home-video-play" aria-hidden="true">▶</div>
            <p className="eyebrow">SYBOC / Brand film</p>
            <h2 id="home-video-title">Crafted for the way you move</h2>
            <p>Our production story, craftsmanship and collections will be showcased here.</p>
            <span>Video coming soon</span>
          </div>
        </section>

        <HScroll>
          <Reveal className="intro" variant="up" duration={1}>
            <SplitLines as="h2">The SYBOC collection</SplitLines>
            <p>Leather, motorcycle and western pieces for the showroom floor and the customer who wants something distinctive.</p>
          </Reveal>
          {products.slice(0, 16).map((s, i) => (
            <article className="card" key={s.slug} style={{ "--bg": s.bg, "--fg": s.fg }}>
              <div>
                {s.articleCode && <span className="card-code">{s.articleCode}</span>}
                <h3>
                  <Link href={`/suits/${s.slug}`} transitionTypes={["nav-forward"]}>{s.name}</Link>
                </h3>
                <p>{s.note}</p>
              </div>
              <div className="card-art">
                {s.image ? (
                  <Image
                    src={s.image}
                    alt={s.name}
                    width={320}
                    height={320}
                    className="card-img"
                  />
                ) : (
                  <Suit id={`s${i}`} base={s.base} accent={s.accent} trim={s.trim} decorative />
                )}
              </div>
              <p className="price">Price on request</p>
            </article>
          ))}
          <article className="card card-all" style={{ "--bg": "#ff4a0a", "--fg": "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "2rem" }}>
            <p className="eyebrow" style={{ color: "#fff", marginBottom: "0.5rem" }}>Complete Catalogue</p>
            <h3 style={{ fontSize: "1.6rem", margin: "0 0 1rem" }}>All 74 Articles</h3>
            <p style={{ margin: "0 0 1.5rem", fontSize: "0.9rem", color: "rgba(255,255,255,0.9)" }}>Explore our full 2026 collection across 8 categories.</p>
            <Link className="btn" href="/products" style={{ background: "#000", color: "#fff", borderColor: "#000" }}>
              View All Products ↗
            </Link>
          </article>
        </HScroll>

        <section className="bands">
          <Drift className="red">Wear your identity.</Drift>
          <Drift dir={-1} className="out">Made to be remembered</Drift>
        </section>

        <section className="home-categories" aria-labelledby="home-categories-title">
          <div className="section-heading"><p className="eyebrow">Explore / 02</p><h2 id="home-categories-title">Categories</h2><p className="lede">Find the right product family for your customers, from everyday leather to performance motorcycle apparel and western wear.</p></div>
          <div className="home-category-grid">
            {[['Leather Wear', 'Jackets, pants, skirts and vests with a confident finish.'], ['Motorcycle Wear', 'Protective layers and riding pieces built for movement.'], ['Western Wear', 'Distinctive western silhouettes with modern construction.']].map(([title, text], i) => <Link className="home-category-card" href="/products" key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p><b>View products ↗</b></Link>)}
          </div>
        </section>

        <section className="why">
          <div className="why-head">
            <p className="eyebrow">SYBOC / 01</p>
            <SplitLines as="h2">Why customers choose us</SplitLines>
            <p className="lede">Distinctive leather goods, practical riding layers and western pieces with a strong point of view.</p>
            <Link className="btn ghost" href="/why" transitionTypes={["nav-forward"]}>All five reasons</Link>
          </div>
          <Reveal stagger={0.12} duration={0.8}>
            {reasons.slice(0, 3).map(([t, d], i) => (
              <section className="why-item" key={t}>
                <span className="why-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </section>
            ))}
          </Reveal>
        </section>

        <CustomerReviewsWall />

        <section className="faq-teaser">
          <Reveal variant="up">
            <p className="eyebrow">Before you order / 02</p>
            <h2>Questions buyers ask</h2>
            <p className="lede">The short answers on product categories, wholesale availability and ordering.</p>
          </Reveal>
          <Reveal className="faq" stagger={0.08} duration={0.7}>
            {faqs.slice(0, 3).map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <div className="faq-body">
                  <p>{a}</p>
                </div>
              </details>
            ))}
          </Reveal>
          <Reveal variant="up" className="row">
            <Link className="btn ghost" href="/faq" transitionTypes={["nav-forward"]}>All questions</Link>
          </Reveal>
        </section>

      <section className="cta" id="quote">
          <div className="cta-grid">
            <Reveal variant="left">
              <p className="eyebrow">Trade / 03</p>
              <h2>Start a SYBOC order</h2>
              <p className="lede">Tell us which categories and products interest you, plus your quantities and delivery needs.</p>
              <a className="btn ghost" href="#suits">Back to the collection</a>
            </Reveal>
            <Reveal variant="right" duration={1}>
              <QuoteForm
                products={products}
                contactEmail={settings["contact.email"] || ""}
                whatsapp={settings["contact.whatsapp"] || ""}
              />
            </Reveal>
          </div>
        </section>
    </PageShell>
  );
}
