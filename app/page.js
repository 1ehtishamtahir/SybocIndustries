import Link from "next/link";
import Image from "next/image";
import Suit from "../components/Suit";
import HeroSlider from "../components/HeroSlider";
import PageShell from "../components/PageShell";
import QuoteForm from "../components/QuoteForm";
import { ScrollBar, HScroll, Drift } from "../components/Scroll";
import { Reveal, SplitLines, Parallax } from "../components/motion";
import { reasons, faqs } from "../data/content";
import { getSettings, getPublishedProducts, parseJson } from "../lib/content";

export default async function Home() {
  const [settings, products] = await Promise.all([getSettings(), getPublishedProducts()]);
  const slides = parseJson(settings["home.heroSlides"], []);

  return (
    <PageShell>
      <ScrollBar />

        <HeroSlider slides={slides} />

        <section className="hero">
          <div className="stripe" aria-hidden="true" />
          <Parallax className="hero-copy" amount={70}>
            <h1 aria-label="First Moto">
              <span className="line"><span>First</span></span>
              <span className="line"><span>Moto</span></span>
            </h1>
            <p className="lede">Race-grade leather and textile suits, supplied to dealers, teams and fleets.</p>
            <div className="row">
              <a className="btn" href="#quote">Request a quote</a>
              <a className="btn ghost" href="#suits">Browse the suits</a>
            </div>
            <ul className="hero-stats">
              <li>CE Level 2 armor</li>
              <li>MOQ from 5 units</li>
              <li>Repaired, not replaced</li>
            </ul>
          </Parallax>
          <div className="hero-suit">
            <Parallax className="hero-art" amount={110}>
              <Image src="/hero-prod.png" alt="First Moto one-piece racing suit" width={496} height={856} priority />
            </Parallax>
          </div>
        </section>

        <HScroll>
          <Reveal className="intro" variant="up" duration={1}>
            <SplitLines as="h2">The 2026 line</SplitLines>
            <p>Five suits for the showroom floor, the grid and the fleet. Keep scrolling.</p>
          </Reveal>
          {products.map((s, i) => (
            <article className="card" key={s.slug} style={{ "--bg": s.bg, "--fg": s.fg }}>
              <div>
                <h3>
                  <Link href={`/suits/${s.slug}`} transitionTypes={["nav-forward"]}>{s.name}</Link>
                </h3>
                <p>{s.note}</p>
              </div>
              <Suit id={`s${i}`} base={s.base} accent={s.accent} trim={s.trim} decorative />
              <p className="price">Price on request</p>
            </article>
          ))}
        </HScroll>

        <section className="bands">
          <Drift className="red">Ride first. Ride strong.</Drift>
          <Drift dir={-1} className="out">Made to be crashed in</Drift>
        </section>

        <section className="why">
          <div className="why-head">
            <p className="eyebrow">Construction / 01</p>
            <SplitLines as="h2">Why it holds up</SplitLines>
            <p className="lede">Five reasons the suits come back from the track repaired, not replaced.</p>
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

        <section className="faq-teaser">
          <Reveal variant="up">
            <p className="eyebrow">Before you order / 02</p>
            <h2>Questions buyers ask</h2>
            <p className="lede">The short answers on MOQ, lead times and terms. The rest live on the FAQ.</p>
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
              <h2>Get a quote for your first order</h2>
              <p className="lede">Tell us the model mix and volumes. Pricing and lead time back within one working day.</p>
              <a className="btn ghost" href="#suits">Back to the suits</a>
            </Reveal>
            <Reveal variant="right" duration={1}>
              <QuoteForm products={products} />
            </Reveal>
          </div>
        </section>
    </PageShell>
  );
}
