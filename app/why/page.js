import Link from "next/link";
import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";
import { reasons } from "../../data/content";

export const metadata = {
  title: "Why First Moto",
  description: "CE Level 2 armor, cut for the riding position, seams that hold and repairs instead of replacements.",
  alternates: { canonical: "/why" },
  openGraph: { title: "Why First Moto", description: "Made to be crashed in.", url: "/why" },
};export default function WhyPage() {
  return (
    <PageShell mainClass="page">
        <header className="page-head">
          <SplitLines as="h1">Made to be crashed in</SplitLines>
          <p>
            A suit is the one piece of kit a rider buys hoping never to test. We build ours as if the test is coming,
            and as if they will want it repaired rather than replaced afterwards — which keeps your customers on the
            product instead of the next brand.
          </p>
        </header>

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
