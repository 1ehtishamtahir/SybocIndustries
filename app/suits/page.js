import Link from "next/link";
import Suit from "../../components/Suit";
import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";
import { getPublishedProducts } from "../../lib/content";

export const metadata = {
  title: "Suits",
  description:
    "The 2026 First Moto line: five race-grade leather and textile suits for dealers, race teams, schools and fleet buyers.",
  alternates: { canonical: "/suits" },
  openGraph: { title: "The 2026 line | First Moto", description: "Five suits for trade buyers.", url: "/suits" },
};

export default async function SuitsPage() {
  const suits = await getPublishedProducts();
  return (
    <PageShell mainClass="page">
        <header className="page-head">
          <SplitLines as="h1">The 2026 line</SplitLines>
          <p>Five suits, one fit philosophy. Every one ships with CE Level 2 armor, with trade pricing quoted per order.</p>
        </header>

        <Reveal className="grid" stagger={0.09} duration={0.8}>
          {suits.map((s) => (
            <article className="tile" key={s.slug} style={{ "--bg": s.bg, "--fg": s.fg }}>
              <div>
                <h2>
                  <Link href={`/suits/${s.slug}`} transitionTypes={["nav-forward"]}>{s.name}</Link>
                </h2>
                <p>{s.note}</p>
              </div>
              <Suit id={`t-${s.slug}`} base={s.base} accent={s.accent} trim={s.trim} decorative />
              <p className="price">Price on request</p>
            </article>
          ))}
        </Reveal>

        <Reveal className="band-cta" variant="up">
          <h2>Not sure which one sells?</h2>
          <Link className="btn" href="/quote" transitionTypes={["nav-forward"]}>
            Request a quote
          </Link>
        </Reveal>
    </PageShell>
  );
}
