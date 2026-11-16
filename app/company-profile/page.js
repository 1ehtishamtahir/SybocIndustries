import PageShell from "../../components/PageShell";
import Image from "next/image";
import { Reveal, SplitLines } from "../../components/motion";
import CompanyProfileLanding from "../../components/CompanyProfileLanding";

export const metadata = {
  title: "Company Profile",
  description: "Learn about SYBOC INDUSTRIES and its Leather Wear, Motorcycle Wear and Western Wear collections.",
  alternates: { canonical: "/company-profile" },
  openGraph: { title: "Company Profile | SYBOC INDUSTRIES", description: "The story behind SYBOC INDUSTRIES.", url: "/company-profile" },
};

export default function CompanyProfilePage() {
  return <CompanyProfileLanding />;
  return (
    <PageShell mainClass="page">
      <header className="page-head">
        <p className="eyebrow">SYBOC / Company</p>
        <SplitLines as="h1">Useful products should still have character.</SplitLines>
        <p>SYBOC INDUSTRIES is a Sialkot-based apparel manufacturer focused on leather, motorcycle and western wear for retailers and independent brands.</p>
      </header>
      <Reveal className="company-intro" variant="up">
        <div className="company-intro-mark">S<span>/</span>I</div>
        <div className="company-intro-copy"><p className="eyebrow">A focused apparel manufacturer</p><h2>Designed to be worn often, remembered easily and kept in motion.</h2><p>From our production base in Sialkot, Pakistan, SYBOC brings together strong silhouettes, practical construction and a disciplined product mix. We work in the space between utility and attitude: the jacket that earns its wear, the riding layer that still works off the bike, and the western piece that feels individual without feeling costume.</p><p>Our job is to make those choices easier for the people who sell the products and more rewarding for the people who wear them.</p></div>
      </Reveal>
      <section className="company-values"><div className="section-heading"><p className="eyebrow">How we think</p><h2>One clear idea, carried through the whole range.</h2></div>
        <Reveal className="company-milestones" stagger={0.12} duration={0.8}>
          {["Start with the material", "Design for real life", "Build the range", "Grow with the right partners"].map((title, i) => <article key={title}><span>{String(i + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{["Leather is tactile, durable and personal. We develop products around the way it feels, wears and gains character over time.", "A good garment has to work beyond the photograph. We think about movement, layering, repeat wear and the choices that make a piece easier to live with.", "Leather Wear, Motorcycle Wear and Western Wear give retailers three connected stories: staples, riding-led performance and expressive statement pieces.", "We build relationships with retailers, teams, resellers and independent brands who care about product clarity as much as commercial consistency."][i]}</p></div></article>)}
        </Reveal>
      </section>
      <section className="company-collections"><div className="section-heading"><p className="eyebrow">Three connected categories</p><h2>A range that gives your customer somewhere to start.</h2></div><div className="company-collection-grid">{[["Leather Wear", "/hero-leather-v2.png", "The foundation: familiar, tactile and easy to build a wardrobe around."], ["Motorcycle Wear", "/hero-motercycle-v2.png", "The performance story: purpose-led layers with an attitude that travels."], ["Western Wear", "/hero-western-v2.png", "The signature story: expressive pieces that make the rail memorable."]].map(([title, image, copy]) => <article key={title}><div className="company-collection-image"><Image src={image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" /></div><p className="eyebrow">Category</p><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <Reveal className="prose profile-copy" duration={0.8}>
        <h2>Who we are</h2>
        <p>SYBOC INDUSTRIES is a product-led apparel company focused on leather and lifestyle wear. Our range brings together practical construction, strong silhouettes and a clear point of view.</p>
        <h2>What we make</h2>
        <p>Our collections cover Leather Wear, Motorcycle Wear and Western Wear—from everyday leather staples to riding layers and statement western pieces.</p>
        <h2>How we work</h2>
        <p>We work with retailers, teams, resellers and independent brands that value consistent quality, distinctive design and a straightforward wholesale relationship.</p>
        <h2>Our direction</h2>
        <p>SYBOC is built around one idea: useful products should still have character. Every collection is developed to be worn often, remembered easily and kept in motion.</p>
      </Reveal>
    </PageShell>
  );
}
