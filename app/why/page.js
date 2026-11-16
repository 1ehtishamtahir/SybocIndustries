import Link from "next/link";
import Image from "next/image";
import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";
import { reasons } from "../../data/content";
import WhyUsLanding from "../../components/WhyUsLanding";

export const metadata = {
  title: "Why Us",
  description: "Why retailers and independent brands choose SYBOC INDUSTRIES for leather, motorcycle and western wear.",
  alternates: { canonical: "/why" },
  openGraph: { title: "Why Us | SYBOC INDUSTRIES", description: "Made to be remembered.", url: "/why" },
};
const proofPoints = [
  ["01", "Product first", "Every decision starts with how the garment feels, moves and earns its place in a wardrobe."],
  ["02", "Clear point of view", "A focused range is easier to merchandise, explain and remember than a catalogue of near-duplicates."],
  ["03", "Trade-minded", "Good product comes with useful information, reliable communication and a straightforward route to order."],
];
const categories = [["Leather Wear", "/hero-leather-v2.png", "Everyday staples with a strong hand feel, considered hardware and silhouettes that get better with wear."], ["Motorcycle Wear", "/hero-motercycle-v2.png", "Riding-led layers built around movement, protection-minded details and a life beyond the bike."], ["Western Wear", "/hero-western-v2.png", "Distinctive western pieces with a confident profile, designed to be styled and remembered."]];

export default function WhyPage() {
  return <WhyUsLanding />;
  return (
    <PageShell mainClass="page">
        <header className="page-head">
          <p className="eyebrow">SYBOC / Why us</p>
          <SplitLines as="h1">Built with purpose. Worn with character.</SplitLines>
          <p>
            We build distinctive apparel with practical construction, clear category stories and a wholesale process that makes the range easier to sell.
          </p>
        </header>

        <Reveal className="why-lead" variant="up">
          <div className="why-lead-number">WHY<br /><span>SYBOC</span></div>
          <div><p className="eyebrow">The short version</p><h2>A strong product earns attention before it asks for loyalty.</h2><p>Our collections are designed to feel considered without becoming precious. We combine practical construction, expressive silhouettes and a clear wholesale process so every piece can work in the showroom, on the road and in everyday life.</p></div>
        </Reveal>

        <Reveal className="proof-strip" stagger={0.12} duration={0.8}>
          {proofPoints.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </Reveal>

        <div className="section-heading"><p className="eyebrow">The SYBOC standard</p><h2>Why customers keep coming back to the range.</h2></div>
        <Reveal className="why-category-grid" stagger={0.12} duration={0.8}>{categories.map(([title, image, copy]) => <article key={title}><div className="why-category-image"><Image src={image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" /></div><div><p className="eyebrow">Collection</p><h3>{title}</h3><p>{copy}</p><Link href="/suits" className="text-link" transitionTypes={["nav-forward"]}>Explore products <span>↗</span></Link></div></article>)}</Reveal>

        <Reveal className="reasons" stagger={0.12} duration={0.8}>
          {reasons.map(([t, d], i) => (
            <section className="why-item" key={t}>
              <span className="why-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </section>
          ))}
        </Reveal>

        <Reveal className="band-cta" variant="up">
          <h2>See it on your floor</h2>
          <Link className="btn" href="/quote" transitionTypes={["nav-forward"]}>
            Request a quote
          </Link>
        </Reveal>
    </PageShell>
  );
}
